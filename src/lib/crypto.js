/**
 * crypto.js — AES-256-GCM encryption for offline question cache.
 *
 * Key derivation:
 *   The encryption key is NEVER stored on disk. It is derived fresh each
 *   session from the user's Bearer token using HKDF-SHA-256:
 *
 *     key = HKDF(ikm: token, salt: APP_SALT, info: "2wise-cache-v1")
 *
 *   This means:
 *   - Someone who steals the device's localStorage gets opaque ciphertext.
 *   - The key only exists in memory while the user is logged in.
 *   - A different token (different user, or after logout+login) produces a
 *     completely different key, so cross-user cache reads are impossible.
 *   - Logout wipes the in-memory key AND clears the ciphertext from storage.
 *
 * Encryption scheme:
 *   AES-256-GCM with a random 12-byte IV prepended to each ciphertext.
 *   GCM provides both confidentiality and integrity — tampered ciphertext
 *   will fail to decrypt rather than silently returning garbage.
 *
 * Limitations (honest):
 *   - A user who is actively logged in can still read questions from the
 *     running app (they have to — it is an exam app). This protects the
 *     at-rest database, not the in-use display.
 *   - Combine with server-side rate limiting for full protection.
 */

// App-level salt — change this string to rotate all user caches on next deploy
const APP_SALT  = '2wise-qbank-salt-v1'
const KEY_INFO  = new TextEncoder().encode('2wise-cache-v1')
const SALT_BYTES = new TextEncoder().encode(APP_SALT)

// Module-level derived key — in memory only, never written to disk
let _derivedKey = null

// ── Key management ────────────────────────────────────────────────────────

/**
 * Call this right after the user logs in (or on app boot if a token exists).
 * Derives the AES key from the token and holds it in memory.
 */
export async function initEncryption(token) {
  if (!token) { _derivedKey = null; return }

  const rawKeyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HKDF' },
    false,
    ['deriveKey']
  )

  _derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: SALT_BYTES,
      info: KEY_INFO,
    },
    rawKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,       // not extractable — key bytes can never be read back out
    ['encrypt', 'decrypt']
  )
}

/** Call on logout. Wipes the in-memory key. */
export function clearEncryptionKey() {
  _derivedKey = null
}

export function hasEncryptionKey() {
  return _derivedKey !== null
}

// ── Encrypt ───────────────────────────────────────────────────────────────

/**
 * Encrypts a JSON-serialisable value.
 * Returns a base64 string: [12-byte random IV][AES-GCM ciphertext]
 */
export async function encryptValue(value) {
  if (!_derivedKey) throw new Error('Encryption key not initialised. User must be logged in.')

  const plaintext = JSON.stringify(value)
  const iv        = crypto.getRandomValues(new Uint8Array(12))
  const encoded   = new TextEncoder().encode(plaintext)

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    _derivedKey,
    encoded
  )

  // Concat IV + ciphertext into a single base64 string for storage
  const combined = new Uint8Array(12 + cipherBuf.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(cipherBuf), 12)

  // Use chunked fromCharCode to avoid stack overflow on large arrays
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < combined.length; i += chunk) {
    binary += String.fromCharCode(...combined.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// ── Decrypt ───────────────────────────────────────────────────────────────

/**
 * Decrypts a base64 string produced by encryptValue.
 * Returns the original value (parsed from JSON).
 * Throws if the key is wrong, the data is tampered, or the key is not set.
 */
export async function decryptValue(b64) {
  if (!_derivedKey) throw new Error('Encryption key not initialised. User must be logged in.')

  const binary   = atob(b64)
  const combined = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i)

  const iv       = combined.slice(0, 12)
  const cipher   = combined.slice(12)

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    _derivedKey,
    cipher
  )

  return JSON.parse(new TextDecoder().decode(plainBuf))
}

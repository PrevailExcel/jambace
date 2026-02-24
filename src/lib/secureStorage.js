/**
 * secureStorage.js
 *
 * Manual async persistence for the encrypted question cache.
 *
 * WHY NOT pinia-plugin-persistedstate?
 *   pinia-plugin-persistedstate v3 does not support async storage —
 *   it calls getItem/setItem synchronously and ignores returned Promises.
 *   Passing an async storage object silently breaks hydration: the cache
 *   always comes back empty, and writes are never awaited.
 *
 * HOW THIS WORKS INSTEAD:
 *   - The questions store keeps `cache` as a normal reactive ref (in-memory).
 *   - `coverage` stays in pinia's standard persist (plain localStorage —
 *     it's just metadata: counts and timestamps, no question content).
 *   - After every bulk sync, the store calls `saveCache(cache)` explicitly.
 *   - On app boot / first fetch, the store calls `loadCache()` to hydrate
 *     `cache` from the encrypted blob on disk.
 *
 * Storage format:
 *   localStorage key: "2w_enc:questions"
 *   value: base64( 12-byte-IV + AES-256-GCM-ciphertext )
 *
 * Security:
 *   The AES key is derived from the user's Bearer token via HKDF (see crypto.js).
 *   The key exists only in memory — never written to disk.
 *   Logout wipes the in-memory key and deletes the ciphertext.
 */

import { encryptValue, decryptValue, hasEncryptionKey } from '@/lib/crypto'

const STORAGE_KEY = '2w_enc:questions'

/**
 * Persist the full question cache to localStorage, encrypted.
 * Call this after every successful sync.
 *
 * @param {Object} cache  Plain object: { [subject]: Question[] }
 */
export async function saveCache(cache) {
  if (!hasEncryptionKey()) {
    // No key means the user is logged out or the key hasn't been derived yet.
    // Don't write plaintext questions to disk.
    console.warn('[secureStorage] saveCache skipped — no encryption key')
    return
  }
  try {
    const encrypted = await encryptValue(cache)
    localStorage.setItem(STORAGE_KEY, encrypted)
  } catch (err) {
    console.error('[secureStorage] Failed to encrypt cache:', err)
  }
}

/**
 * Load and decrypt the question cache from localStorage.
 * Returns the cache object, or {} if nothing is stored / decryption fails.
 *
 * @returns {Promise<Object>}  { [subject]: Question[] }
 */
export async function loadCache() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  if (!hasEncryptionKey()) {
    // Key not yet derived — caller should retry after initEncryption()
    return {}
  }
  try {
    return await decryptValue(raw)
  } catch (err) {
    // Wrong key (different user or rotated salt) or tampered data.
    // Treat as empty — questions will be re-downloaded on next sync.
    console.warn('[secureStorage] Decryption failed — treating cache as empty:', err.message)
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

/**
 * Delete the encrypted cache from localStorage.
 * Call on logout so no question data is left on disk.
 */
export function clearSecureCache() {
  localStorage.removeItem(STORAGE_KEY)

  // Belt-and-suspenders: also clear any legacy keys from the old implementation
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('2w_enc:')) toRemove.push(k)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}
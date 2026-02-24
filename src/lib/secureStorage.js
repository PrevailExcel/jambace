/**
 * secureStorage.js
 *
 * A drop-in replacement for `localStorage` that transparently encrypts
 * values using AES-256-GCM before writing, and decrypts on read.
 *
 * Used as the `storage` option in pinia-plugin-persistedstate for the
 * questions store — so the question cache is always encrypted at rest.
 *
 * The interface matches the Storage API that pinia-plugin-persistedstate
 * expects: { getItem(key), setItem(key, value), removeItem(key) }
 *
 * All methods are async-compatible via Promise returns, which
 * pinia-plugin-persistedstate supports in its `storage` option.
 *
 * Keys in localStorage:
 *   "2w_enc:{storeName}" → base64(IV + AES-GCM ciphertext)
 *
 * The prefix "2w_enc:" makes it clear to anyone inspecting storage that
 * the value is encrypted and intentionally unreadable.
 */

import { encryptValue, decryptValue, hasEncryptionKey } from '@/lib/crypto'

const PREFIX = '2w_enc:'

function storageKey(key) {
  return PREFIX + key
}

export const secureStorage = {
  /**
   * Read and decrypt a value.
   * Returns null if not found, key not initialised, or decryption fails
   * (e.g. data written by a different user's key — safe to treat as cache miss).
   */
  async getItem(key) {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return null
    if (!hasEncryptionKey()) return null   // logged out — don't decrypt

    try {
      const value = await decryptValue(raw)
      // pinia-plugin-persistedstate expects the serialised string back
      // We stored the already-parsed value, so re-stringify for the plugin
      return JSON.stringify(value)
    } catch {
      // Wrong key (different user / rotated salt) or tampered data
      // Treat as cache miss — the store will re-download from the API
      console.warn('[secureStorage] Failed to decrypt cache for key:', key, '— treating as empty')
      localStorage.removeItem(storageKey(key))
      return null
    }
  },

  /**
   * Encrypt and write a value.
   * If the key is not initialised (user logged out mid-session), silently
   * skip the write — better to lose the cache than to write plaintext.
   */
  async setItem(key, value) {
    if (!hasEncryptionKey()) {
      // No key = logged out. Don't write plaintext questions to disk.
      return
    }
    try {
      // value coming from pinia-plugin-persistedstate is already a JSON string
      const parsed    = JSON.parse(value)
      const encrypted = await encryptValue(parsed)
      localStorage.setItem(storageKey(key), encrypted)
    } catch (err) {
      console.error('[secureStorage] Encryption failed for key:', key, err)
    }
  },

  removeItem(key) {
    localStorage.removeItem(storageKey(key))
  },
}

/**
 * Wipe all encrypted cache entries from localStorage.
 * Call on logout — leaves no question data behind.
 */
export function clearSecureCache() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) keysToRemove.push(k)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

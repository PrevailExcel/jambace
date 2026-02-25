/**
 * usePaystack.js
 *
 * Wraps the Paystack inline popup (PaystackPop) for the PWA.
 *
 * Flow for both subscription and credit packs:
 *  1. Call our backend to initialise the transaction
 *     → backend creates a Payment record, calls Paystack, returns { reference, access_code }
 *  2. Open PaystackPop with the access_code (stays inside the PWA — no page redirect)
 *  3. User pays on the Paystack sheet
 *  4. onSuccess → call GET /api/payments/verify/{reference}
 *     → backend re-confirms with Paystack, returns fresh subscription + credits
 *  5. reconcileFromServer() updates the Pinia user store
 *
 * Why access_code instead of the public key + email + amount?
 *   access_code opens an already-initialised transaction so we don't
 *   expose amount/email in the frontend, and the reference is already
 *   registered in our DB before the popup even opens.
 */

import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const API = import.meta.env.VITE_API_BASE_URL ?? '/api'

// ── Load PaystackPop script once ─────────────────────────────────────────
let _scriptPromise = null

function loadPaystackScript() {
  if (_scriptPromise) return _scriptPromise
  _scriptPromise = new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop)
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => resolve(window.PaystackPop)
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.head.appendChild(script)
  })
  return _scriptPromise
}

// ── Composable ────────────────────────────────────────────────────────────
export function usePaystack() {
  const userStore = useUserStore()

  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)   // true after a successful payment + verify

  // ── Internal: open the popup given an access_code ─────────────────────
  function openPopup({ accessCode, email, amount, reference }) {
    return new Promise((resolve, reject) => {
      const paystack = new window.PaystackPop()

      paystack.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        access_code: accessCode,
        amount,
        reference,
        email,

        onSuccess: (transaction) => resolve(transaction),
        onCancel: () => reject(new Error('PAYMENT_CANCELLED')),
      })
    })
  }

  // ── Internal: call our verify endpoint and update the user store ───────
  async function verifyAndReconcile(reference) {
    const res = await fetch(`${API}/payments/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Verify failed: HTTP ${res.status}`)

    const data = await res.json()

    if (data.status !== 'success') {
      throw new Error(`Payment verification failed: ${data.status}`)
    }

    // Update the user store with the server's authoritative values
    userStore.reconcileFromServer({
      subscription: data.subscription,
      credits: data.credits,
    })

    return data
  }

  // ── subscribe() ───────────────────────────────────────────────────────
  // Opens the ₦1,000/year subscription popup.
  async function subscribe() {
    error.value = null
    success.value = false
    loading.value = true

    try {
      await loadPaystackScript()

      // 1. Initialise with our backend
      const initRes = await fetch(`${API}/payments/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!initRes.ok) {
        const body = await initRes.json().catch(() => ({}))
        throw new Error(body.message ?? `Server error ${initRes.status}`)
      }

      const { access_code, reference, amount_kobo } = await initRes.json()

      // 2. Open popup — suspends here until paid or cancelled
      await openPopup({
        accessCode: access_code,
        reference,
        amount: amount_kobo,
        email: userStore.profile?.email,
      })

      // 3. Verify + reconcile
      await verifyAndReconcile(reference)
      success.value = true

    } catch (err) {
      if (err.message === 'PAYMENT_CANCELLED') {
        // User closed the popup — not an error, just do nothing
      } else {
        console.error('[usePaystack] subscribe error:', err)
        error.value = err.message
      }
    } finally {
      loading.value = false
    }
  }

  // ── buyCredits() ──────────────────────────────────────────────────────
  // Opens a credit pack purchase popup.
  async function buyCredits(packId) {
    error.value = null
    success.value = false
    loading.value = true

    try {
      await loadPaystackScript()

      // 1. Initialise credit pack purchase with our backend
      const initRes = await fetch(`${API}/payments/credits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pack_id: packId }),
      })

      if (!initRes.ok) {
        const body = await initRes.json().catch(() => ({}))
        throw new Error(body.message ?? `Server error ${initRes.status}`)
      }

      const { access_code, reference, credits } = await initRes.json()

      // 2. Open popup
      await openPopup({
        accessCode: access_code,
        reference,
        email: userStore.profile?.email,
      })

      // 3. Verify + reconcile
      await verifyAndReconcile(reference)
      success.value = true

      return credits   // caller can use this for a toast message

    } catch (err) {
      if (err.message === 'PAYMENT_CANCELLED') {
        // do nothing
      } else {
        console.error('[usePaystack] buyCredits error:', err)
        error.value = err.message
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, success, subscribe, buyCredits }
}

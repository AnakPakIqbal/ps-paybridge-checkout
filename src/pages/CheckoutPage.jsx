import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react'
import CheckoutTemplate from '../templates/CheckoutTemplate.jsx'
import OrderSummaryPanel, { formatCurrency } from '../organisms/OrderSummaryPanel.jsx'
import PaymentMethodTabs from '../organisms/PaymentMethodTabs.jsx'
import CardForm from '../organisms/CardForm.jsx'
import VirtualAccountForm from '../organisms/VirtualAccountForm.jsx'
import EwalletForm from '../organisms/EwalletForm.jsx'
import SecureNotice from '../molecules/SecureNotice.jsx'
import PaymentFooter from '../organisms/PaymentFooter.jsx'
import { icons } from '../atoms/Icon.jsx'
import { useCardForm } from '../hooks/useCardForm.js'

// Helper function to dynamically load JS script SDKs
function loadScript(id, src, attributes = {}) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    Object.entries(attributes).forEach(([key, val]) => {
      script.setAttribute(key, val)
    })
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.body.appendChild(script)
  })
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 bg-lineSoft rounded w-1/3 mb-2" />
      <div className="h-32 bg-lineSoft rounded-xl2 w-full mb-2" />
      <div className="space-y-4">
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-lineSoft rounded-xl" />
          <div className="h-12 bg-lineSoft rounded-xl" />
        </div>
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
      </div>
      <div className="h-14 bg-lineSoft rounded-xl w-full mt-4" />
    </div>
  )
}

function ErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs mb-4">
      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Payment Error</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-400 hover:text-red-200 text-xs font-semibold self-start"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const [sessionId, setSessionId] = useState(null)
  const [token, setToken] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [overrideSelection, setOverrideSelection] = useState(false)

  // Card input custom hook state
  const { details: cardDetails, updateField: updateCardField, resetForm: resetCardForm } = useCardForm()

  // VA & Ewallet selection states
  const [selectedVaMethod, setSelectedVaMethod] = useState('')
  const [selectedEwalletMethod, setSelectedEwalletMethod] = useState('')

  const [method, setMethod] = useState('card')
  const cardRef = useRef(null)
  const panelRef = useRef(null)
  const eventSourceRef = useRef(null)

  // Parse path and query params on mount
  useEffect(() => {
    const path = window.location.pathname
    const segments = path.split('/').filter(Boolean)
    const checkoutSessionId = segments[segments.length - 1]

    const hash = window.location.hash || ''
    const tokenMatch = hash.match(/token=([^&]+)/)
    const initialToken = tokenMatch ? tokenMatch[1] : null

    if (!checkoutSessionId) {
      setError('Checkout session ID is missing from the URL path.')
      setLoading(false)
      return
    }
    if (!initialToken) {
      setError('Authorization token is missing from the URL fragment.')
      setLoading(false)
      return
    }

    setSessionId(checkoutSessionId)
    setToken(initialToken)
    fetchSession(checkoutSessionId, initialToken)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Gsap animations
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    }
  }, [method, session?.status])

  // Fetch session details from backend
  const fetchSession = async (sid, tkn) => {
    try {
      const res = await fetch(`/checkout/${sid}/session`, {
        headers: {
          'Authorization': `Bearer ${tkn}`
        }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error?.message || `Failed to retrieve checkout session (${res.status})`)
      }
      const data = await res.json()
      const sess = data.data
      setSession(sess)
      
      if (sess.checkoutToken) {
        setToken(sess.checkoutToken)
      }

      // Initialize selected methods if available
      if (sess.availableMethods) {
        const vaMethods = sess.availableMethods.filter(m => m.category === 'virtual_account')
        if (vaMethods.length > 0) setSelectedVaMethod(vaMethods[0].code)

        const walletMethods = sess.availableMethods.filter(m => m.category === 'e_wallet' || m.category === 'qr_code')
        if (walletMethods.length > 0) setSelectedEwalletMethod(walletMethods[0].code)

        // Set initial category tab based on available methods
        const hasCard = sess.availableMethods.some(m => m.category === 'card')
        const hasVa = sess.availableMethods.some(m => m.category === 'virtual_account')
        const hasEwallet = sess.availableMethods.some(m => m.category === 'e_wallet' || m.category === 'qr_code')

        if (hasCard) setMethod('card')
        else if (hasVa) setMethod('va')
        else if (hasEwallet) setMethod('ewallet')
      }

      if (sess.status === 'awaiting_payment') {
        subscribeToSSE(sid, sess.checkoutToken || tkn)
      }
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Subscribe to real-time events via Server-Sent Events
  const subscribeToSSE = (sid, tkn) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    const es = new EventSource(`/checkout/${sid}/events?token=${encodeURIComponent(tkn)}`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setSession(data)
        if (data.checkoutToken) {
          setToken(data.checkoutToken)
        }
      } catch (e) {
        console.error('Error parsing SSE event data', e)
      }
    }

    es.onerror = () => {
      console.warn('SSE connection closed or lost. Retrying...')
    }
  }

  // Submit standard non-card payment method selection
  const selectPaymentMethod = async (methodCode) => {
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch(`/checkout/${sessionId}/select-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod: methodCode })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error?.message || 'Failed to select payment method.')
      }
      const data = await res.json()
      const updatedSess = data.data
      setSession(updatedSess)
      if (updatedSess.checkoutToken) {
        setToken(updatedSess.checkoutToken)
      }
      if (updatedSess.status === 'awaiting_payment') {
        subscribeToSSE(sessionId, updatedSess.checkoutToken || token)
      }
      setOverrideSelection(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Tokenize card and complete card charge flow
  const tokenizeCard = async (provider, cardDetailsObj) => {
    const { number, cvv, expiryMonth, expiryYear } = cardDetailsObj

    if (provider === 'midtrans') {
      const clientKey = window.MIDTRANS_CLIENT_KEY
      const isSandbox = clientKey && clientKey.startsWith('SB-Mid-')
      const environment = isSandbox ? 'sandbox' : 'production'

      await loadScript(
        'midtrans-script',
        'https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js',
        {
          'data-environment': environment,
          'data-client-key': clientKey
        }
      )

      if (!window.MidtransNew3ds) {
        throw new Error('Midtrans card SDK failed to load.')
      }

      return new Promise((resolve, reject) => {
        const cardData = {
          card_number: number.replace(/\s/g, ''),
          card_cvv: cvv,
          card_exp_month: expiryMonth,
          card_exp_year: expiryYear
        }

        window.MidtransNew3ds.getCardToken(cardData, {
          onSuccess: (response) => {
            if (response.token_id) {
              resolve(response.token_id)
            } else {
              reject(new Error('Card tokenization succeeded but no token ID was returned.'))
            }
          },
          onFailure: (response) => {
            reject(new Error(response.status_message || 'Midtrans card tokenization failed.'))
          }
        })
      })
    } else if (provider === 'xendit') {
      // Xendit V3 uses Full PAN: raw card details go to the backend
      // which sends them directly to Xendit's /v3/payment_requests.
      // No client-side tokenization SDK is needed.
      return null
    } else {
      throw new Error(`Card processing is not supported for provider "${provider}".`)
    }
  }

  const submitCardPayment = async (cardDetailsObj) => {
    setSubmitting(true)
    setFormError(null)
    try {
      const cardMethod = session.provider === 'midtrans' ? 'credit_card' : 'CARDS'
      const selRes = await fetch(`/checkout/${sessionId}/select-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod: cardMethod })
      })
      if (!selRes.ok) {
        const data = await selRes.json().catch(() => ({}))
        throw new Error(data.error?.message || 'Failed to select credit card method.')
      }
      const selData = await selRes.json()
      let currentToken = selData.data.checkoutToken || token
      setSession(selData.data)
      setToken(currentToken)
      setOverrideSelection(false)

      // Build the card-token request body based on provider:
      // - Midtrans: client-side tokenization returns a PSP token string
      // - Xendit V3: send raw card details (Full PAN flow, no client-side SDK)
      let cardTokenBody
      if (session.provider === 'xendit') {
        cardTokenBody = {
          cardDetails: {
            cardNumber: cardDetailsObj.number.replace(/\s/g, ''),
            expiryMonth: cardDetailsObj.expiryMonth,
            expiryYear: cardDetailsObj.expiryYear,
            cvn: cardDetailsObj.cvv,
            cardholderFirstName: cardDetailsObj.firstName,
            cardholderLastName: cardDetailsObj.lastName
          }
        }
      } else {
        const pspToken = await tokenizeCard(session.provider, cardDetailsObj)
        cardTokenBody = { token: pspToken }
      }

      const tokenRes = await fetch(`/checkout/${sessionId}/card-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(cardTokenBody)
      })
      if (!tokenRes.ok) {
        const data = await tokenRes.json().catch(() => ({}))
        throw new Error(data.error?.message || 'Failed to complete credit card transaction.')
      }
      const tokenData = await tokenRes.json()
      setSession(tokenData.data)
      if (tokenData.data.checkoutToken) {
        setToken(tokenData.data.checkoutToken)
      }

      // Handle 3DS redirect (REQUIRES_ACTION from Xendit)
      const checkoutUrl = tokenData.data.paymentAttempt?.checkoutUrl
      if (checkoutUrl && checkoutUrl.startsWith('http')) {
        window.location.href = checkoutUrl
        return
      }

      if (tokenData.data.status === 'awaiting_payment') {
        subscribeToSSE(sessionId, tokenData.data.checkoutToken || currentToken)
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderRightSide = () => {
    if (loading) {
      return <SkeletonLoader />
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-5">
            <XCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Checkout Error</h2>
          <p className="text-xs text-muted leading-relaxed">{error}</p>
        </div>
      )
    }

    if (!session) return null

    // Terminal status: paid (Success)
    if (session.status === 'paid') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-brandDim/80 border border-brand/35 rounded-full flex items-center justify-center text-brand mb-6 shadow-xl shadow-brand/10 animate-bounce">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Payment Successful</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Thank you! Your payment has been processed successfully. You can now close this tab safely.
          </p>
          <div className="w-full bg-panel2 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2 mb-2">
            <div className="flex justify-between">
              <span>Order Ref:</span>
              <span className="font-mono text-text">{session.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="text-brand font-semibold">{formatCurrency(session.amount, session.currency)}</span>
            </div>
          </div>
        </div>
      )
    }

    // Terminal status: failed
    if (session.status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-xl shadow-red-500/5">
            <XCircle size={44} />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Payment Failed</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This payment attempt was unsuccessful. Please return to the merchant application and try again.
          </p>
        </div>
      )
    }

    // Terminal status: expired
    if (session.status === 'expired') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-xl shadow-yellow-500/5">
            <Clock size={44} />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Payment Expired</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This checkout session has expired. Please contact the merchant to request a new session.
          </p>
        </div>
      )
    }

    // Awaiting Payment Details
    if (session.status === 'awaiting_payment' && !overrideSelection) {
      const attempt = session.paymentAttempt
      if (!attempt) return null

      const isCard = attempt.paymentMethod === 'credit_card' || attempt.paymentMethod === 'CARDS'
      const hasVaProtocol = attempt.checkoutUrl?.startsWith('midtrans-va://') || attempt.checkoutUrl?.startsWith('xendit-va://')

      return (
        <div className="flex flex-col gap-5 h-full">
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-lineSoft pb-3">
            <button
              type="button"
              onClick={() => setOverrideSelection(true)}
              className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors duration-150"
            >
              <ArrowLeft size={14} />
              Change Payment Method
            </button>
            <span className="text-[10px] text-muted flex items-center gap-1 font-mono uppercase bg-panel2 border border-lineSoft px-2.5 py-1 rounded-lg">
              {attempt.paymentMethod.replace(/_/g, ' ')}
            </span>
          </div>

          <ErrorBanner message={formError} onClose={() => setFormError(null)} />

          <div ref={panelRef} className="rounded-xl2 border border-lineSoft bg-panel2/30 p-6 flex-1">
            {isCard && attempt.status === 'awaiting_token' ? (
              <CardForm details={cardDetails} onUpdateField={updateCardField} />
            ) : hasVaProtocol ? (
              <VirtualAccountForm paymentAttempt={attempt} />
            ) : isCard ? (
              <div className="flex flex-col items-center justify-center py-16 text-center h-full max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin mb-4" />
                <p className="text-sm font-semibold text-text mb-2">Processing Card Payment</p>
                <p className="text-xs text-muted leading-relaxed">
                  Confirming with your bank. Please do not close or refresh this tab.
                </p>
              </div>
            ) : (
              <EwalletForm paymentAttempt={attempt} />
            )}
          </div>

          {/* Conditional Secure Notice & Footer */}
          {isCard && attempt.status === 'awaiting_token' ? (
            <>
              <SecureNotice title="Secure payment" subtitle="Your card details are tokenized client-side directly with the gateway." />
              <PaymentFooter
                label={submitting ? 'Processing...' : `Pay ${formatCurrency(session.amount, session.currency)}`}
                onSubmit={() => {
                  if (submitting) return
                  if (!cardDetails.number || !cardDetails.firstName || !cardDetails.lastName || !cardDetails.expiry || !cardDetails.cvv) {
                    setFormError('Please fill in all credit card details.')
                    return
                  }
                  const [m, y] = cardDetails.expiry.split('/')
                  submitCardPayment({
                    number: cardDetails.number,
                    cvv: cardDetails.cvv,
                    expiryMonth: m?.trim() || '',
                    expiryYear: y ? '20' + y.trim() : '',
                    firstName: cardDetails.firstName,
                    lastName: cardDetails.lastName
                  })
                }}
              />
            </>
          ) : (
            <SecureNotice title="Waiting for confirmation" subtitle="We will automatically refresh as soon as payment is confirmed." />
          )}
        </div>
      )
    }

    // Method selection picker (renders on initial awaiting_method_selection OR when overrideSelection is active)
    if (session.status === 'awaiting_method_selection' || overrideSelection) {
      const hasCard = session.availableMethods?.some(m => m.category === 'card')
      const hasVa = session.availableMethods?.some(m => m.category === 'virtual_account')
      const hasEwallet = session.availableMethods?.some(m => m.category === 'e_wallet' || m.category === 'qr_code')

      const tabs = []
      if (hasCard) tabs.push({ id: 'card', label: 'Card', icon: icons.card })
      if (hasVa) tabs.push({ id: 'va', label: 'Virtual Account', icon: icons.bank })
      if (hasEwallet) tabs.push({ id: 'ewallet', label: 'E-Wallet', icon: icons.wallet })

      const labels = {
        card: `Pay ${formatCurrency(session.amount, session.currency)}`,
        va: 'Confirm Selected Bank',
        ewallet: 'Continue to Wallet'
      }

      const notices = {
        card: { title: 'Secure payment', subtitle: 'You will enter card details tokenized securely directly with the provider.' },
        va: { title: 'Bank transfer', subtitle: 'Select a bank to generate your unique virtual account details.' },
        ewallet: { title: 'E-Wallet checkout', subtitle: "You will be redirected to the provider's payment page or scan a QR code." }
      }

      return (
        <div className="flex flex-col gap-5 h-full">
          {/* Show "Back to active payment details" if they have an active attempt and are overriding selection */}
          {session.paymentAttempt && overrideSelection && (
            <div className="flex items-center border-b border-lineSoft pb-3">
              <button
                type="button"
                onClick={() => setOverrideSelection(false)}
                className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors duration-150"
              >
                <ArrowLeft size={14} />
                Back to active payment details
              </button>
            </div>
          )}

          {tabs.length > 0 && <PaymentMethodTabs active={method} onChange={setMethod} tabs={tabs} />}
          
          <ErrorBanner message={formError} onClose={() => setFormError(null)} />

          <div ref={panelRef} className="rounded-xl2 border border-lineSoft bg-panel2/30 p-6 flex-1">
            {method === 'card' && (
              <CardForm details={cardDetails} onUpdateField={updateCardField} />
            )}
            {method === 'va' && (
              <VirtualAccountForm
                availableMethods={session.availableMethods}
                selectedMethod={selectedVaMethod}
                setSelectedMethod={setSelectedVaMethod}
              />
            )}
            {method === 'ewallet' && (
              <EwalletForm
                availableMethods={session.availableMethods}
                selectedMethod={selectedEwalletMethod}
                setSelectedMethod={setSelectedEwalletMethod}
              />
            )}
          </div>
          <SecureNotice {...notices[method]} />
          <PaymentFooter
            label={submitting ? 'Processing...' : labels[method]}
            onSubmit={() => {
              if (submitting) return
              if (method === 'card') {
                if (!cardDetails.number || !cardDetails.firstName || !cardDetails.lastName || !cardDetails.expiry || !cardDetails.cvv) {
                  setFormError('Please fill in all credit card details.')
                  return
                }
                const [m, y] = cardDetails.expiry.split('/')
                submitCardPayment({
                  number: cardDetails.number,
                  cvv: cardDetails.cvv,
                  expiryMonth: m?.trim() || '',
                  expiryYear: y ? '20' + y.trim() : '',
                  firstName: cardDetails.firstName,
                  lastName: cardDetails.lastName
                })
              } else if (method === 'va') {
                if (!selectedVaMethod) {
                  setFormError('Please select a bank virtual account option.')
                  return
                }
                selectPaymentMethod(selectedVaMethod)
              } else if (method === 'ewallet') {
                if (!selectedEwalletMethod) {
                  setFormError('Please select an e-wallet / QRIS option.')
                  return
                }
                selectPaymentMethod(selectedEwalletMethod)
              }
            }}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div ref={cardRef}>
      <CheckoutTemplate
        left={<OrderSummaryPanel session={session} />}
        right={renderRightSide()}
      />
    </div>
  )
}

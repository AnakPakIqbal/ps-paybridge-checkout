export default function CheckoutTemplate({ left, right }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:py-8">
      <div
        id="checkout-card"
        className="w-full max-w-5xl flex flex-col md:grid md:grid-cols-[340px_1fr] bg-panel border border-line rounded-xl2 overflow-hidden shadow-2xl shadow-black/40"
      >
        <div className="bg-panel2 border-b md:border-b-0 md:border-r border-lineSoft">{left}</div>
        <div className="p-5 sm:p-8 md:py-6">{right}</div>
      </div>
    </div>
  )
}

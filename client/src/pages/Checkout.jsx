import { useState } from "react";
import { useCart } from "../hooks/useCart";
import CartItem from "../components/CartItem";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
  });

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT SECTION — FORM */}
        <div className="flex-1 bg-white rounded-xl shadow p-8 space-y-10">
          {/* CONTACT */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                name="email"
                placeholder="Email"
                className="input"
                value={form.email}
                onChange={updateForm}
              />
              <input
                name="phone"
                placeholder="Phone"
                className="input"
                value={form.phone}
                onChange={updateForm}
              />
            </div>
          </section>

          {/* SHIPPING INFO */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                placeholder="Full Name"
                className="input md:col-span-2"
                value={form.fullName}
                onChange={updateForm}
              />
              <input
                name="address"
                placeholder="Street Address"
                className="input md:col-span-2"
                value={form.address}
                onChange={updateForm}
              />
              <input
                name="city"
                placeholder="City"
                className="input"
                value={form.city}
                onChange={updateForm}
              />
              <input
                name="state"
                placeholder="State"
                className="input"
                value={form.state}
                onChange={updateForm}
              />
              <input
                name="zip"
                placeholder="ZIP Code"
                className="input md:col-span-2"
                value={form.zip}
                onChange={updateForm}
              />
            </div>
          </section>

          {/* PAYMENT INFO (Mock UI) */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="grid grid-cols-1 gap-4">
              <input placeholder="Card Number" className="input" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="MM/YY" className="input" />
                <input placeholder="CVC" className="input" />
              </div>
            </div>
          </section>

          {/* PLACE ORDER BUTTON */}
          <button className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Place Order
          </button>
        </div>

        {/* RIGHT SECTION — ORDER SUMMARY */}
        <aside className="w-full lg:w-96 bg-white rounded-xl shadow p-6 h-fit sticky top-10">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {cart.items.map((item) => (
              <CartItem key={item.productId} item={item} readOnly />
            ))}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
          </div>

          <div className="border-t pt-4 mt-4 text-lg font-semibold flex justify-between">
            <span>Total</span>
            <span>${cartTotal}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

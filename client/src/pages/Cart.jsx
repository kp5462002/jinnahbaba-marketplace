import { useState } from 'react';
import { apiFetch } from '../api/fetch.js';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { user } = useAuth();
  const { cart, loading, itemCount, subtotal, removeItem, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (!user) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Sign in to view your cart</h2>
          <p className="text-sm text-gray-600 mb-4">
            You need an account to save items and check out.
          </p>
          <Link
            to="/login"
            className="inline-block bg-[#00A651] text-white px-6 py-2 rounded-full font-bold"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-lg font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-600 mb-6">
              Browse products and add items to get started.
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#00A651] text-white px-6 py-2.5 rounded-full font-bold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const p = item.product;
                const image = p.images?.[0]?.url || `https://picsum.photos/seed/${p.id}/200/200`;
                const priceDisplay = p.priceMin === p.priceMax
                  ? `$${p.priceMin.toFixed(2)}`
                  : `$${p.priceMin.toFixed(2)} - $${p.priceMax.toFixed(2)}`;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border p-4 flex gap-4"
                  >
                    <Link to={`/products/slug/${p.slug}`} className="shrink-0">
                      <img
                        src={image}
                        alt={p.title}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/slug/${p.slug}`}
                        className="font-semibold text-sm hover:text-[#00A651] line-clamp-2"
                      >
                        {p.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        Supplier: {p.supplier?.companyName || '—'} • {p.supplier?.country}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        MOQ: {p.minOrderQty} {p.unit}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-sm font-bold text-[#00A651]">{priceDisplay}</span>
                          <span className="text-xs text-gray-500 ml-2">/ {p.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                      <div className="text-sm font-bold text-gray-800">
                        ${(item.quantity * p.priceMin).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-5 sticky top-4">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-400">Negotiated</span>
                </div>

                <div className="border-t pt-4 flex justify-between items-baseline mb-4">
                  <span className="font-bold">Total (est.)</span>
                  <span className="text-2xl font-bold text-[#00A651]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {checkoutError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-3 text-center">
                    {checkoutError}
                  </div>
                )}
                <button
                  onClick={async () => {
                    setCheckoutError('');
                    setCheckingOut(true);
                    try {
                      const token = localStorage.getItem('accessToken');
                      const res = await apiFetch('/cart/checkout', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || 'Checkout failed');
                      }
                      clearCart();
                      await refreshCart();
                      navigate('/orders');
                    } catch (e) {
                      setCheckoutError(e.message);
                    } finally {
                      setCheckingOut(false);
                    }
                  }}
                  disabled={checkingOut}
                  className="w-full bg-[#00A651] hover:bg-[#008a44] disabled:opacity-60 text-white rounded-full py-2.5 text-sm font-bold transition"
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Final price and shipping will be negotiated with the supplier.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

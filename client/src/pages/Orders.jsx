import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  DISPUTED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/orders/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Sign in to view your orders</h2>
          <Link to="/login" className="inline-block mt-4 bg-[#00A651] text-white px-6 py-2 rounded-full font-bold">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-sm text-gray-600 mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm text-[#00A651] hover:underline"
          >
            Continue shopping →
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-lg font-bold mb-2">No orders yet</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your orders will appear here after you check out.
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#00A651] text-white px-6 py-2.5 rounded-full font-bold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const image = order.product?.images?.[0]?.url || `https://picsum.photos/seed/${order.id}/100/100`;
              const statusStyle = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500">
                        Order <span className="font-mono font-semibold text-gray-700">{order.orderNumber}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusStyle}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex gap-4 pt-3">
                    <Link to={`/products/slug/${order.product?.slug}`} className="shrink-0">
                      <img
                        src={image}
                        alt={order.product?.title}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/slug/${order.product?.slug}`}
                        className="font-semibold text-sm hover:text-[#00A651] line-clamp-2"
                      >
                        {order.product?.title || 'Product'}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        Supplier: {order.supplier?.companyName || '—'} • {order.supplier?.country}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>Qty: <span className="font-semibold">{order.quantity}</span></span>
                        <span>Unit: <span className="font-semibold">${order.unitPrice.toFixed(2)}</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-gray-500">Total</div>
                      <div className="text-lg font-bold text-[#00A651]">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-400">{order.currency}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

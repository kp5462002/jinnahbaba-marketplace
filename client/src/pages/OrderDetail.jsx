import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/fetch.js';
import { ArrowLeft, Package, MapPin, User, CheckCircle2, Circle } from 'lucide-react';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  DISPUTED: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await apiFetch(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Order not found or unauthorized');
        const data = await res.json();
        setOrder(data.order || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading order...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center"><p className="text-red-500 mb-4">{error}</p><button onClick={() => navigate(-1)} className="text-[#00A651] underline">Go Back</button></div>;
  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminated = ['CANCELLED', 'DISPUTED'].includes(order.status);

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#00A651] mb-6">
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                Order {order.orderNumber}
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Timeline */}
          {!isTerminated ? (
            <div className="flex items-center justify-between w-full mt-8 mb-4 relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#00A651] -z-0 transition-all" style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}></div>
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex flex-col items-center relative z-10 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx <= currentStepIndex ? 'bg-[#00A651] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {idx < currentStepIndex ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${idx <= currentStepIndex ? 'text-[#00A651]' : 'text-gray-400'}`}>{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 rounded-lg mb-4 ${order.status === 'CANCELLED' ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-700'}`}>
              <p className="font-bold">Order {order.status}</p>
              <p className="text-sm">This order is no longer active.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={20} className="text-[#00A651]" /> Product Details</h2>
              <div className="flex gap-4 items-start">
                <img src={order.product?.images?.[0]?.url || `https://picsum.photos/seed/${order.product?.id}/100/100`} alt="" className="w-24 h-24 rounded-lg object-cover border" />
                <div className="flex-1">
                  <Link to={`/products/slug/${order.product?.slug}`} className="font-semibold hover:text-[#00A651]">{order.product?.title}</Link>
                  <div className="text-sm text-gray-500 mt-2 flex flex-col gap-1">
                    <span>Unit Price: <span className="font-bold text-gray-700">${order.unitPrice?.toFixed(2)}</span> / {order.product?.unit || 'piece'}</span>
                    <span>Quantity: <span className="font-bold text-gray-700">{order.quantity}</span></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Amount</span>
                  <span className="text-xl font-bold text-[#00A651]">${order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.inquiry && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-bold text-lg mb-2">Original Inquiry</h2>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">"{order.inquiry.message}"</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-[#00A651]" /> Parties Involved</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Buyer</span>
                  <p className="font-semibold mt-1">{order.buyer?.companyName || order.buyer?.contactName}</p>
                  <p className="text-sm text-gray-500">{order.buyer?.country}</p>
                </div>
                <div className="border-t pt-4">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Supplier</span>
                  <p className="font-semibold mt-1">{order.supplier?.companyName || order.supplier?.contactName}</p>
                  <p className="text-sm text-gray-500">{order.supplier?.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-[#00A651]" /> Shipping Address</h2>
              <p className="text-sm text-gray-600">{order.shippingAddress || 'No shipping address provided.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

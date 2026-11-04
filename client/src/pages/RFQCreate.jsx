import { useState, useEffect } from 'react';
import { apiFetch } from '../api/fetch.js';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RFQCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    quantity: 100,
    unit: 'piece',
    targetPrice: '',
    currency: 'USD',
    destination: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (Number(form.quantity) < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await apiFetch('/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || undefined,
          quantity: Number(form.quantity),
          unit: form.unit,
          targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
          currency: form.currency,
          destination: form.destination || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create RFQ');
      navigate(`/rfq`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-sm text-gray-600 mb-4">You need an account to post an RFQ.</p>
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

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Post a Request for Quotation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Describe what you need, and verified suppliers will send you quotes.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What are you looking for? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                maxLength={200}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
                placeholder="e.g. 5000 pieces of custom printed cotton t-shirts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                required
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651] resize-none"
                placeholder="Describe materials, colors, sizes, packaging, certifications, etc."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => update('destination', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                  placeholder="e.g. Karachi, Pakistan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => update('unit', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                >
                  <option value="piece">piece</option>
                  <option value="pair">pair</option>
                  <option value="set">set</option>
                  <option value="kg">kg</option>
                  <option value="box">box</option>
                  <option value="unit">unit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target price / unit
                </label>
                <div className="flex">
                  <select
                    value={form.currency}
                    onChange={(e) => update('currency', e.target.value)}
                    className="border rounded-l-lg px-2 text-sm focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="PKR">PKR</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.targetPrice}
                    onChange={(e) => update('targetPrice', e.target.value)}
                    className="flex-1 w-full border-t border-b border-r rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                    placeholder="e.g. 2.50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00A651] hover:bg-[#008a44] disabled:opacity-60 text-white px-8 py-2.5 rounded-full font-bold text-sm transition"
              >
                {loading ? 'Posting...' : 'Post Request'}
              </button>
              <Link
                to="/rfq"
                className="px-8 py-2.5 rounded-full border text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

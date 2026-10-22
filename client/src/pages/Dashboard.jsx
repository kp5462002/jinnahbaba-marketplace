import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  DISPUTED: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    title: '', description: '', shortDesc: '', priceMin: '', priceMax: '',
    minOrderQty: 100, unit: 'piece', categoryId: '', imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isSupplier = user?.role === 'SUPPLIER';

  useEffect(() => {
    if (!user) return;
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const [productsRes, ordersRes] = await Promise.all([
        isSupplier ? fetch(`/api/products/supplier/${user.id}?limit=50`) : Promise.resolve({ json: () => ({ products: [] }) }),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const productList = productsData.products || [];
      const orderList = ordersData.orders || [];
      setProducts(productList);
      setOrders(orderList);
      const revenue = orderList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pending = orderList.filter((o) => o.status === 'PENDING').length;
      setStats({
        products: productList.length,
        orders: orderList.length,
        revenue,
        pending,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: productForm.title,
          description: productForm.description,
          shortDesc: productForm.shortDesc || undefined,
          priceMin: Number(productForm.priceMin),
          priceMax: Number(productForm.priceMax),
          minOrderQty: Number(productForm.minOrderQty),
          unit: productForm.unit,
          categoryId: productForm.categoryId,
          currency: 'USD',
          images: productForm.imageUrl ? [{ url: productForm.imageUrl }] : [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create product');
      }
      setShowAddProduct(false);
      setProductForm({
        title: '', description: '', shortDesc: '', priceMin: '', priceMax: '',
        minOrderQty: 100, unit: 'piece', categoryId: '', imageUrl: '',
      });
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, <span className="font-semibold">{user?.companyName || user?.contactName || user?.email}</span>
            {user?.role && <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">{user.role}</span>}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Products</div>
            <div className="text-2xl font-bold text-[#00A651] mt-1">{stats.products}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Orders</div>
            <div className="text-2xl font-bold text-[#00A651] mt-1">{stats.orders}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Revenue</div>
            <div className="text-2xl font-bold text-[#00A651] mt-1">${stats.revenue.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b flex gap-1 px-4">
            <button
              onClick={() => setTab('overview')}
              className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                tab === 'overview' ? 'border-[#00A651] text-[#00A651]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            {isSupplier && (
              <button
                onClick={() => setTab('products')}
                className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                  tab === 'products' ? 'border-[#00A651] text-[#00A651]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Products ({products.length})
              </button>
            )}
            <button
              onClick={() => setTab('orders')}
              className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                tab === 'orders' ? 'border-[#00A651] text-[#00A651]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders ({orders.length})
            </button>
            <Link
              to="/rfq"
              className="py-3 px-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              RFQs →
            </Link>
          </div>

          <div className="p-6">
            {/* Overview tab */}
            {tab === 'overview' && (
              <div>
                <h3 className="font-bold mb-3">Quick actions</h3>
                <div className="flex flex-wrap gap-3">
                  {isSupplier && (
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-[#00A651] hover:bg-[#008a44] text-white px-5 py-2 rounded-full text-sm font-bold"
                    >
                      + Add Product
                    </button>
                  )}
                  <Link
                    to="/rfq"
                    className="border border-[#00A651] text-[#00A651] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#00A651]/5"
                  >
                    View RFQs
                  </Link>
                  <Link
                    to="/orders"
                    className="border border-[#00A651] text-[#00A651] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#00A651]/5"
                  >
                    My Orders
                  </Link>
                </div>
              </div>
            )}

            {/* Products tab */}
            {tab === 'products' && isSupplier && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Your products ({products.length})</h3>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-[#00A651] hover:bg-[#008a44] text-white px-4 py-1.5 rounded-full text-xs font-bold"
                  >
                    + Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No products yet. Click "Add Product" to list your first item.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b text-xs text-gray-500">
                        <tr>
                          <th className="text-left py-2 px-2">Product</th>
                          <th className="text-left py-2 px-2">Price</th>
                          <th className="text-left py-2 px-2">MOQ</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Stock</th>
                          <th className="text-right py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.images?.[0]?.url || `https://picsum.photos/seed/${p.id}/40/40`}
                                  alt=""
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <Link to={`/products/slug/${p.slug}`} className="hover:text-[#00A651] line-clamp-1">
                                  {p.title}
                                </Link>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              ${p.priceMin.toFixed(2)}{p.priceMin !== p.priceMax && ` - $${p.priceMax.toFixed(2)}`}
                            </td>
                            <td className="py-2 px-2">{p.minOrderQty} {p.unit}</td>
                            <td className="py-2 px-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 px-2">{p.stockQty}</td>
                            <td className="py-2 px-2 text-right">
                              <Link
                                to={`/products/slug/${p.slug}`}
                                className="text-xs text-[#00A651] hover:underline"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div>
                <h3 className="font-bold mb-4">Orders ({orders.length})</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No orders yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div>
                            <span className="text-xs font-mono text-gray-500">{o.orderNumber}</span>
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{o.product?.title}</div>
                            <div className="text-xs text-gray-500">
                              {o.quantity} × ${o.unitPrice?.toFixed(2)} = <span className="font-bold text-gray-700">${o.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Buyer: {o.buyer?.companyName || o.buyer?.contactName || '—'}
                            </div>
                          </div>
                          {isSupplier && (
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Add New Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Premium Leather Gloves"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price min *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={productForm.priceMin}
                      onChange={(e) => setProductForm(p => ({ ...p, priceMin: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price max *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={productForm.priceMax}
                      onChange={(e) => setProductForm(p => ({ ...p, priceMax: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min order qty</label>
                    <input
                      type="number"
                      min={1}
                      value={productForm.minOrderQty}
                      onChange={(e) => setProductForm(p => ({ ...p, minOrderQty: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm(p => ({ ...p, unit: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="piece">piece</option>
                      <option value="pair">pair</option>
                      <option value="set">set</option>
                      <option value="kg">kg</option>
                      <option value="box">box</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm(p => ({ ...p, imageUrl: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#00A651] hover:bg-[#008a44] disabled:opacity-60 text-white px-6 py-2 rounded-full text-sm font-bold"
                  >
                    {submitting ? 'Creating...' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="border px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

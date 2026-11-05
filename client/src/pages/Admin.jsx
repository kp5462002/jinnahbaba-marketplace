import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/fetch.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPPLIER: 'bg-blue-100 text-blue-700',
  BUYER: 'bg-green-100 text-green-700',
};

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const [pendingRes, allRes, usersRes] = await Promise.all([
        apiFetch('/products?status=PENDING&limit=100'),
        apiFetch('/products?limit=100&status=ACTIVE'),
        fetch(`${import.meta.env.VITE_API_URL || '/api'}/users?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingRes.json();
      const allData = await allRes.json();
      setPending(pendingData.products || []);
      setAllProducts(allData.products || []);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || usersData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateProductStatus = async (productId, newStatus) => {
    setActionMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update status');
      }

      setActionMsg(`✅ Product ${newStatus.toLowerCase()}`);
      setTimeout(() => setActionMsg(''), 2000);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">
            Signed in as <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {actionMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Pending Products</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{pending.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Active Products</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{allProducts.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Users</div>
            <div className="text-2xl font-bold text-[#00A651] mt-1">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">Suppliers</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {users.filter((u) => u.role === 'SUPPLIER').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b flex gap-1 px-4">
            <button
              onClick={() => setTab('pending')}
              className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                tab === 'pending'
                  ? 'border-[#00A651] text-[#00A651]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Products ({pending.length})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                tab === 'all'
                  ? 'border-[#00A651] text-[#00A651]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Products ({allProducts.length})
            </button>
            <button
              onClick={() => setTab('users')}
              className={`py-3 px-4 border-b-2 text-sm font-medium transition ${
                tab === 'users'
                  ? 'border-[#00A651] text-[#00A651]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
          </div>

          <div className="p-6">
            {/* Pending Products */}
            {tab === 'pending' && (
              <div>
                <h3 className="font-bold mb-4">Pending Products Awaiting Approval</h3>
                {pending.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No pending products. All caught up!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b text-xs text-gray-500">
                        <tr>
                          <th className="text-left py-2 px-2">Product</th>
                          <th className="text-left py-2 px-2">Supplier</th>
                          <th className="text-left py-2 px-2">Price</th>
                          <th className="text-left py-2 px-2">MOQ</th>
                          <th className="text-right py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map((p) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    p.images?.[0]?.url ||
                                    `https://picsum.photos/seed/${p.id}/40/40`
                                  }
                                  alt=""
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <div>
                                  <Link
                                    to={`/products/slug/${p.slug}`}
                                    className="hover:text-[#00A651] line-clamp-1 font-medium"
                                  >
                                    {p.title}
                                  </Link>
                                  <div className="text-xs text-gray-500">
                                    {p.category?.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-xs">
                              {p.supplier?.companyName || '—'}
                              <div className="text-gray-400">{p.supplier?.country}</div>
                            </td>
                            <td className="py-2 px-2">
                              ${p.priceMin.toFixed(2)} - ${p.priceMax.toFixed(2)}
                            </td>
                            <td className="py-2 px-2">
                              {p.minOrderQty} {p.unit}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => updateProductStatus(p.id, 'ACTIVE')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded font-bold mr-2"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => updateProductStatus(p.id, 'REJECTED')}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-bold"
                              >
                                ✗ Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Active Products */}
            {tab === 'all' && (
              <div>
                <h3 className="font-bold mb-4">All Active Products</h3>
                {allProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No active products.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/slug/${p.slug}`}
                        className="border rounded-lg p-3 hover:shadow-md transition flex gap-3"
                      >
                        <img
                          src={
                            p.images?.[0]?.url ||
                            `https://picsum.photos/seed/${p.id}/80/80`
                          }
                          alt=""
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm line-clamp-1">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.supplier?.companyName}
                          </div>
                          <div className="text-sm font-bold text-[#00A651] mt-1">
                            ${p.priceMin.toFixed(2)} - ${p.priceMax.toFixed(2)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div>
                <h3 className="font-bold mb-4">All Users</h3>
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No users.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b text-xs text-gray-500">
                        <tr>
                          <th className="text-left py-2 px-2">Name</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Role</th>
                          <th className="text-left py-2 px-2">Country</th>
                          <th className="text-left py-2 px-2">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">
                              {u.companyName || u.contactName || '—'}
                            </td>
                            <td className="py-2 px-2 text-xs text-gray-600">
                              {u.email}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  ROLE_COLORS[u.role] || 'bg-gray-100'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-xs">{u.country || '—'}</td>
                            <td className="py-2 px-2 text-xs">
                              {u.isVerified ? '✅ Yes' : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

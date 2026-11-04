import { useState, useEffect } from 'react';
import { apiFetch } from '../api/fetch.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RFQList() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('mine'); // 'mine' | 'all'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (filter === 'mine' && user?.id) {
          params.set('buyerId', user.id);
        }
        params.set('limit', '20');

        const res = await apiFetch(`/rfqs?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load RFQs');
        const data = await res.json();
        setRfqs(data.rfqs || []);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(err.message);
        setRfqs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, user?.id]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Requests for Quotation</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filter === 'mine'
                ? 'Requests you have posted'
                : 'All open requests from buyers'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex border rounded-full overflow-hidden text-sm">
              <button
                onClick={() => setFilter('mine')}
                disabled={!user}
                className={`px-4 py-1.5 transition disabled:opacity-40 ${
                  filter === 'mine' ? 'bg-[#00A651] text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                My RFQs
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 transition ${
                  filter === 'all' ? 'bg-[#00A651] text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                All RFQs
              </button>
            </div>
            <Link
              to="/rfq/new"
              className="bg-[#00A651] hover:bg-[#008a44] text-white px-4 py-2 rounded-full text-sm font-bold"
            >
              + Post New
            </Link>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && filter === 'mine' && !user && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <p className="text-gray-700 font-semibold mb-2">Sign in to view your RFQs</p>
            <Link to="/login" className="text-[#00A651] underline text-sm">
              Sign in
            </Link>
          </div>
        )}

        {!loading && !error && rfqs.length === 0 && (filter !== 'mine' || user) && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <p className="text-gray-700 font-semibold mb-2">No RFQs yet</p>
            <p className="text-sm text-gray-500 mb-4">
              {filter === 'mine'
                ? "You haven't posted any requests yet."
                : 'No requests have been posted.'}
            </p>
            <Link
              to="/rfq/new"
              className="inline-block bg-[#00A651] text-white px-6 py-2 rounded-full font-bold text-sm"
            >
              Post a Request
            </Link>
          </div>
        )}

        {!loading && !error && rfqs.length > 0 && (
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <Link
                key={rfq.id}
                to={`/rfq/${rfq.id}`}
                className="block bg-white rounded-lg border p-5 hover:shadow-md hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base truncate">{rfq.title}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rfq.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : rfq.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{rfq.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                      <span>📦 {rfq.quantity} {rfq.unit}</span>
                      {rfq.targetPrice && (
                        <span>💰 Target: ${rfq.targetPrice} {rfq.currency}</span>
                      )}
                      {rfq.destination && <span>📍 {rfq.destination}</span>}
                      {rfq.buyer && (
                        <span>👤 {rfq.buyer.companyName || rfq.buyer.contactName || 'Buyer'}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#00A651]">
                      {rfq._count?.responses || 0}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {(rfq._count?.responses || 0) === 1 ? 'response' : 'responses'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500 mt-6">
            Page {pagination.page} of {pagination.totalPages} — {pagination.total} total
          </div>
        )}
      </div>
    </div>
  );
}

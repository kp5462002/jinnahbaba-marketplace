import { useState, useEffect } from 'react';
import { apiFetch } from '../api/fetch.js';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RFQDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRespondForm, setShowRespondForm] = useState(false);
  const [responseForm, setResponseForm] = useState({
    unitPrice: '',
    minOrderQty: '',
    leadTimeDays: 10,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseError, setResponseError] = useState('');

  const loadRFQ = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/rfqs/${id}`);
      if (!res.ok) throw new Error('RFQ not found');
      const data = await res.json();
      setRfq(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRFQ();
  }, [id]);

  const handleRespond = async (e) => {
    e.preventDefault();
    setResponseError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await apiFetch(`/rfqs/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unitPrice: Number(responseForm.unitPrice),
          currency: rfq.currency || 'USD',
          minOrderQty: Number(responseForm.minOrderQty),
          leadTimeDays: Number(responseForm.leadTimeDays),
          message: responseForm.message,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit response');
      }
      await loadRFQ();
      setShowRespondForm(false);
      setResponseForm({ unitPrice: '', minOrderQty: '', leadTimeDays: 10, message: '' });
    } catch (err) {
      setResponseError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading RFQ...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 font-semibold">{error || 'RFQ not found'}</p>
        <Link to="/rfq" className="text-[#00A651] underline">Back to RFQs</Link>
      </div>
    );
  }

  const isOwner = user?.id === rfq.buyerId;
  const isSupplier = user?.role === 'SUPPLIER' || user?.role === 'ADMIN';
  const alreadyResponded = rfq.responses?.some((r) => r.supplierId === user?.id);
  const canRespond = isSupplier && !isOwner && rfq.status === 'OPEN' && !alreadyResponded;

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="text-xs text-gray-500 mb-3">
          <Link to="/" className="hover:text-[#00A651]">Home</Link>
          {' / '}
          <Link to="/rfq" className="hover:text-[#00A651]">RFQs</Link>
          {' / '}
          <span className="text-gray-700 truncate">{rfq.title}</span>
        </div>

        {/* Main RFQ card */}
        <div className="bg-white rounded-xl border p-6 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold">{rfq.title}</h1>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    rfq.status === 'OPEN'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rfq.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Posted {new Date(rfq.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
                {rfq.buyer && ` by ${rfq.buyer.companyName || rfq.buyer.contactName || 'Buyer'}`}
                {rfq.buyer?.country && ` • ${rfq.buyer.country}`}
              </div>
            </div>

            {canRespond && (
              <button
                onClick={() => setShowRespondForm((v) => !v)}
                className="bg-[#00A651] hover:bg-[#008a44] text-white px-6 py-2 rounded-full text-sm font-bold shrink-0"
              >
                {showRespondForm ? 'Cancel' : 'Respond with Quote'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b">
            <div>
              <div className="text-[11px] text-gray-500">Quantity</div>
              <div className="text-sm font-bold">{rfq.quantity} {rfq.unit}</div>
            </div>
            {rfq.targetPrice && (
              <div>
                <div className="text-[11px] text-gray-500">Target price</div>
                <div className="text-sm font-bold">${rfq.targetPrice.toFixed(2)} {rfq.currency}</div>
              </div>
            )}
            {rfq.destination && (
              <div>
                <div className="text-[11px] text-gray-500">Destination</div>
                <div className="text-sm font-bold">{rfq.destination}</div>
              </div>
            )}
            {rfq.deliveryDate && (
              <div>
                <div className="text-[11px] text-gray-500">Delivery by</div>
                <div className="text-sm font-bold">
                  {new Date(rfq.deliveryDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-bold mb-2">Description</div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {rfq.description}
            </p>
          </div>

          {isOwner && (
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              You posted this RFQ. You'll see supplier quotes below as they come in.
            </div>
          )}

          {alreadyResponded && (
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              You've already submitted a quote for this RFQ.
            </div>
          )}
        </div>

        {/* Respond form */}
        {showRespondForm && canRespond && (
          <div className="bg-white rounded-xl border p-6 mb-4">
            <h2 className="font-bold text-lg mb-4">Submit your quote</h2>
            {responseError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {responseError}
              </div>
            )}
            <form onSubmit={handleRespond} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit price ({rfq.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={responseForm.unitPrice}
                    onChange={(e) => setResponseForm((p) => ({ ...p, unitPrice: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                    placeholder="e.g. 9.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. order qty *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={responseForm.minOrderQty}
                    onChange={(e) => setResponseForm((p) => ({ ...p, minOrderQty: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead time (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={responseForm.leadTimeDays}
                    onChange={(e) => setResponseForm((p) => ({ ...p, leadTimeDays: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to buyer
                </label>
                <textarea
                  rows={3}
                  value={responseForm.message}
                  onChange={(e) => setResponseForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] resize-none"
                  placeholder="Materials, certifications, samples availability..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#00A651] hover:bg-[#008a44] disabled:opacity-60 text-white px-6 py-2 rounded-full text-sm font-bold"
              >
                {submitting ? 'Submitting...' : 'Submit Quote'}
              </button>
            </form>
          </div>
        )}

        {/* Responses list */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-lg mb-4">
            Supplier Quotes ({rfq.responses?.length || 0})
          </h2>

          {(!rfq.responses || rfq.responses.length === 0) ? (
            <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
              No quotes yet. Suppliers will respond shortly.
            </p>
          ) : (
            <div className="space-y-3">
              {rfq.responses.map((r) => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {r.supplier?.companyName || 'Supplier'}
                        {r.supplier?.isVerified && (
                          <span className="bg-[#00A651]/10 text-[#00A651] px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.supplier?.country} • ⭐ {r.supplier?.rating?.toFixed(1) || '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#00A651]">
                        ${r.unitPrice.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        / {rfq.unit} • MOQ {r.minOrderQty}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Lead time: {r.leadTimeDays} days
                  </div>
                  {r.message && (
                    <p className="text-sm text-gray-700 mt-2 pt-2 border-t">{r.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

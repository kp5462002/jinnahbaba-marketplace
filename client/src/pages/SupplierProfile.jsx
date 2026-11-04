import { useState, useEffect } from 'react';
import { apiFetch } from '../api/fetch.js';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, productsRes] = await Promise.all([
          apiFetch(`/users/${id}/public`),
          apiFetch(`/products/supplier/${id}?limit=20`),
        ]);

        if (!profileRes.ok) throw new Error('Supplier not found');
        const profileData = await profileRes.json();
        setSupplier(profileData);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading supplier profile...</p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 font-semibold">{error || 'Supplier not found'}</p>
        <Link to="/" className="text-[#00A651] underline">Back to home</Link>
      </div>
    );
  }

  const initials = (supplier.companyName || 'S').slice(0, 2).toUpperCase();
  const businessTypeLabel = supplier.businessType?.replace('_', ' ') || 'Supplier';
  const yearsOnPlatform = Math.max(
    1,
    Math.floor((Date.now() - new Date(supplier.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))
  );

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-3">
          <Link to="/" className="hover:text-[#00A651]">Home</Link>
          {' / '}
          <Link to="/products" className="hover:text-[#00A651]">Suppliers</Link>
          {' / '}
          <span className="text-gray-700">{supplier.companyName}</span>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#00A651] to-[#008a44]" />

          {/* Profile header */}
          <div className="px-8 pb-6 -mt-12">
            <div className="flex items-end gap-5 flex-wrap">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                {supplier.logoUrl ? (
                  <img
                    src={supplier.logoUrl}
                    alt={supplier.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#00A651] text-white flex items-center justify-center font-bold text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{supplier.companyName}</h1>
                  {supplier.isVerified && (
                    <span className="bg-[#00A651]/10 text-[#00A651] text-[11px] font-bold px-2 py-0.5 rounded">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>🌍 {supplier.country}{supplier.city ? `, ${supplier.city}` : ''}</span>
                  <span>•</span>
                  <span>{businessTypeLabel}</span>
                  {supplier.yearEstablished && (
                    <>
                      <span>•</span>
                      <span>Est. {supplier.yearEstablished}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{yearsOnPlatform} year{yearsOnPlatform > 1 ? 's' : ''} on Jinnahbaba</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to="/rfq/new"
                  className="bg-[#00A651] hover:bg-[#008a44] text-white px-5 py-2 rounded-full text-sm font-bold transition"
                >
                  Contact Supplier
                </Link>
                <button className="border border-[#00A651] text-[#00A651] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#00A651]/5 transition">
                  Chat Now
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="border-t grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-[#00A651]">{supplier.rating?.toFixed(1) || '—'}</div>
              <div className="text-[11px] text-gray-500 mt-1">Rating</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-[#00A651]">{supplier.responseRate || 0}%</div>
              <div className="text-[11px] text-gray-500 mt-1">Response rate</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-[#00A651]">{supplier.responseTimeHours || '—'}h</div>
              <div className="text-[11px] text-gray-500 mt-1">Response time</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-[#00A651]">{supplier.totalTransactions || 0}</div>
              <div className="text-[11px] text-gray-500 mt-1">Transactions</div>
            </div>
          </div>
        </div>

        {/* About */}
        {supplier.description && (
          <div className="bg-white rounded-xl border p-6 mt-4">
            <h2 className="font-bold text-lg mb-3">About the supplier</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{supplier.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">Business type</div>
                <div className="text-sm font-semibold mt-0.5">{businessTypeLabel}</div>
              </div>
              {supplier.yearEstablished && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-[11px] text-gray-500">Year established</div>
                  <div className="text-sm font-semibold mt-0.5">{supplier.yearEstablished}</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">Country</div>
                <div className="text-sm font-semibold mt-0.5">{supplier.country || '—'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">Reviews</div>
                <div className="text-sm font-semibold mt-0.5">{supplier.reviewCount || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-xl border p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              Products ({supplier._count?.products || products.length})
            </h2>
            <Link
              to={`/products?supplierId=${supplier.id}`}
              className="text-sm text-[#00A651] hover:underline"
            >
              View all →
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              This supplier has no active products yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => {
                const image = p.images?.[0]?.url || `https://picsum.photos/seed/${p.id}/400/400`;
                const priceDisplay = p.priceMin === p.priceMax
                  ? `$${p.priceMin.toFixed(2)}`
                  : `$${p.priceMin.toFixed(2)} - $${p.priceMax.toFixed(2)}`;

                return (
                  <Link
                    key={p.id}
                    to={`/products/slug/${p.slug}`}
                    className="border rounded-lg p-3 hover:shadow-lg transition group overflow-hidden"
                  >
                    <div className="overflow-hidden rounded mb-2 bg-gray-50">
                      <img
                        src={image}
                        alt={p.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-[13px] line-clamp-2 leading-tight group-hover:text-[#00A651] h-10">
                      {p.title}
                    </h3>
                    <p className="font-bold text-sm mt-1 text-[#00A651]">{priceDisplay}</p>
                    <p className="text-[11px] text-gray-500">
                      MOQ: {p.minOrderQty} {p.unit}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

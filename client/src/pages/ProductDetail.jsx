import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetail() {
  const { slug, id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('Description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const url = slug ? `/api/products/slug/${slug}` : `/api/products/${id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, id]);

  useEffect(() => {
    if (!product?.category?.slug) return;
    const loadRelated = async () => {
      try {
        const res = await fetch(`/api/products?categorySlug=${product.category.slug}&limit=7`);
        if (!res.ok) return;
        const data = await res.json();
        const list = (data.products || []).filter((p) => p.id !== product.id).slice(0, 6);
        setRelatedProducts(list);
      } catch {
        setRelatedProducts([]);
      }
    };
    loadRelated();
  }, [product]);

  useEffect(() => {
    setActiveImg(0);
  }, [product?.id]);

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 font-semibold">Product not found</p>
        <Link to="/" className="text-[#00A651] underline">Back to home</Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map((i) => i.url)
    : [`https://picsum.photos/seed/${product.id}/800/800`];

  const priceDisplay = product.priceMin === product.priceMax
    ? `$${product.priceMin.toFixed(2)}`
    : `$${product.priceMin.toFixed(2)} - $${product.priceMax.toFixed(2)}`;

  const supplier = product.supplier || {};
  const reviews = product.reviews || [];
  const avgRating = product.rating?.toFixed(1) || '0.0';

  const specs = [
    { k: 'Unit', v: product.unit },
    { k: 'Min. order', v: `${product.minOrderQty} ${product.unit}` },
    { k: 'Stock available', v: `${product.stockQty} ${product.unit}` },
    { k: 'Lead time', v: `${product.leadTimeDays} days` },
    { k: 'Port of dispatch', v: product.portOfDispatch || '—' },
    { k: 'Payment terms', v: product.paymentTerms || 'Negotiable' },
    { k: 'Supply ability', v: product.supplyAbility || '—' },
    { k: 'Currency', v: product.currency },
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="text-xs text-gray-500 mb-3">
          <Link to="/" className="hover:text-[#00A651]">Home</Link>
          {' / '}
          <Link to="/products" className="hover:text-[#00A651]">Products</Link>
          {product.category?.slug && (
            <>
              {' / '}
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-[#00A651]">
                {product.category.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-gray-700">{product.title}</span>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex gap-3">
              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 border rounded overflow-hidden cursor-pointer transition ${
                      activeImg === i ? 'border-[#00A651] border-2' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-gray-50 border rounded-lg overflow-hidden">
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  className="w-full h-[460px] object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <h1 className="font-bold text-lg leading-snug">{product.title}</h1>

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  ⭐ <span className="font-bold text-gray-700">{avgRating}</span>
                  <span>({product.reviewCount || 0} reviews)</span>
                </span>
                <span>•</span>
                <span>{product.inquiryCount || 0} inquiries</span>
              </div>

              <div className="mt-4 pb-4 border-b">
                <div className="text-2xl font-bold text-[#00A651]">{priceDisplay}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Min. order: {product.minOrderQty} {product.unit}
                </div>
              </div>

              {product.shortDesc && (
                <div className="mt-4 pb-4 border-b">
                  <div className="text-xs font-bold text-gray-700 mb-2">Quick summary</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{product.shortDesc}</p>
                </div>
              )}

              {product.tags?.length > 0 && (
                <div className="mt-4 pb-4 border-b">
                  <div className="text-xs font-bold text-gray-700 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                      <span key={t} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="text-xs font-bold text-gray-700 mb-2">Key specifications</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {specs.slice(0, 6).map((s) => (
                    <div key={s.k} className="text-[11px]">
                      <div className="text-gray-500">{s.k}</div>
                      <div className="font-semibold text-gray-800">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  {supplier.logoUrl ? (
                    <img src={supplier.logoUrl} alt={supplier.companyName} className="w-12 h-12 rounded-full border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#00A651] text-white flex items-center justify-center font-bold">
                      {supplier.companyName?.[0] || 'S'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/suppliers/${supplier.id}`} className="font-bold text-sm truncate hover:text-[#00A651] hover:underline">{supplier.companyName || 'Verified Supplier'}</Link>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      🌍 {supplier.country || 'Unknown'}
                      {supplier.isVerified && (
                        <span className="ml-1 bg-[#00A651]/10 text-[#00A651] px-1.5 py-0.5 rounded text-[10px] font-bold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="bg-white rounded p-2 border">
                    <div className="text-gray-500">Rating</div>
                    <div className="font-bold">⭐ {supplier.rating?.toFixed(1) || '—'}</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-gray-500">Response</div>
                    <div className="font-bold">{supplier.responseRate || '—'}%</div>
                  </div>
                </div>

                <button className="w-full bg-[#00A651] hover:bg-[#008a44] text-white rounded-full py-2.5 text-sm font-bold transition">
                  Start Order
                </button>
                <button className="w-full mt-2 border border-[#00A651] text-[#00A651] rounded-full py-2.5 text-sm font-bold hover:bg-[#00A651]/5 transition">
                  Chat with Supplier
                </button>

                <div className="text-[11px] text-gray-500 mt-3 space-y-1">
                  <div>✓ Secure payment</div>
                  <div>✓ Refund policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg mt-4">
          <div className="border-b px-6 flex gap-6 text-sm">
            {['Description', 'Specifications', 'Supplier', 'Reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 border-b-2 transition ${
                  tab === t
                    ? 'border-[#00A651] text-[#00A651] font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                {t === 'Reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'Description' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold mb-3">Product description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
                {product.shortDesc && (
                  <div className="mt-6 bg-[#00A651]/5 border border-[#00A651]/20 p-4 rounded-lg">
                    <div className="text-sm font-bold text-[#00A651] mb-1">Highlights</div>
                    <div className="text-sm text-gray-700">{product.shortDesc}</div>
                  </div>
                )}
              </div>
            )}

            {tab === 'Specifications' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold mb-3">Specifications</h2>
                <div className="border rounded-lg overflow-hidden">
                  {specs.map((s, i) => (
                    <div key={s.k} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="w-1/3 px-4 py-3 text-gray-500">{s.k}</div>
                      <div className="w-2/3 px-4 py-3 font-medium">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Supplier' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold mb-3">About the supplier</h2>
                <div className="border rounded-lg p-5">
                  <div className="flex items-center gap-4 mb-4">
                    {supplier.logoUrl && (
                      <img src={supplier.logoUrl} alt="" className="w-16 h-16 rounded-full border" />
                    )}
                    <div>
                      <div className="font-bold text-base">{supplier.companyName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {supplier.businessType?.replace('_', ' ') || 'Supplier'}
                        {supplier.yearEstablished && ` • Established ${supplier.yearEstablished}`}
                        {supplier.country && ` • ${supplier.country}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-[#00A651]">{supplier.rating?.toFixed(1) || '—'}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Rating</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-[#00A651]">{supplier.responseRate || '—'}%</div>
                      <div className="text-[11px] text-gray-500 mt-1">Response rate</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-[#00A651]">{supplier.reviewCount || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Reviews</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-[#00A651]">{supplier.totalTransactions || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Transactions</div>
                    </div>
                  </div>

                  {supplier.description && (
                    <p className="text-sm text-gray-700 mt-5 leading-relaxed">{supplier.description}</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'Reviews' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold mb-3">Buyer reviews</h2>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border rounded-lg">
                    No reviews yet. Be the first to review this product.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{r.author?.contactName || 'Anonymous Buyer'}</div>
                          <div className="text-yellow-500 text-sm">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {r.author?.country || '—'} • {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                        {r.title && <div className="text-sm font-medium mt-2">{r.title}</div>}
                        <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-lg mt-4 p-6">
            <h2 className="text-lg font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((rp) => {
                const image = rp.images?.[0]?.url || `https://picsum.photos/seed/${rp.id}/400/400`;
                const rpPrice = rp.priceMin === rp.priceMax
                  ? `$${rp.priceMin.toFixed(2)}`
                  : `$${rp.priceMin.toFixed(2)} - $${rp.priceMax.toFixed(2)}`;
                return (
                  <Link
                    key={rp.id}
                    to={`/products/slug/${rp.slug}`}
                    className="border rounded-lg p-2 hover:shadow-lg transition group"
                  >
                    <div className="overflow-hidden rounded mb-2 bg-gray-50">
                      <img src={image} alt={rp.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h3 className="text-[12px] line-clamp-2 leading-tight group-hover:text-[#00A651] h-8">
                      {rp.title}
                    </h3>
                    <p className="text-[12px] font-bold mt-1 text-[#00A651]">{rpPrice}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

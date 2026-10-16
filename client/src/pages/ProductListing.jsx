import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categorySlug = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'createdAt';
  const sortOrder = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (categorySlug) params.set('categorySlug', categorySlug);
        if (searchQuery) params.set('search', searchQuery);
        params.set('page', String(page));
        params.set('limit', '20');
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categorySlug, searchQuery, sortBy, sortOrder, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-[#00A651]">Home</Link>
          {' / '}
          <Link to="/products" className="hover:text-[#00A651]">Products</Link>
          {activeCategory && (
            <>
              {' / '}
              <span className="text-gray-700">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex gap-6">
          <aside className="w-[240px] bg-white rounded-lg p-4 hidden lg:block shrink-0 h-fit">
            <h3 className="font-bold text-sm mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`text-[13px] w-full text-left py-1.5 px-2 rounded transition ${
                    !categorySlug ? 'bg-[#00A651]/10 text-[#00A651] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => updateParam('category', c.slug)}
                    className={`text-[13px] w-full text-left py-1.5 px-2 rounded transition flex justify-between ${
                      categorySlug === c.slug ? 'bg-[#00A651]/10 text-[#00A651] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c._count?.products > 0 && (
                      <span className="text-[11px] text-gray-400">{c._count.products}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-bold text-lg">
                  {activeCategory ? activeCategory.name : 'All Products'}
                </h1>
                {pagination && (
                  <p className="text-xs text-gray-500 mt-1">
                    {pagination.total} products found
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Sort by:</span>
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => {
                    const [sb, so] = e.target.value.split(':');
                    const next = new URLSearchParams(searchParams);
                    next.set('sort', sb);
                    next.set('order', so);
                    setSearchParams(next);
                  }}
                  className="border rounded px-2 py-1.5 text-xs"
                >
                  <option value="createdAt:desc">Newest</option>
                  <option value="priceMin:asc">Price: Low to High</option>
                  <option value="priceMin:desc">Price: High to Low</option>
                  <option value="rating:desc">Top Rated</option>
                  <option value="viewCount:desc">Most Popular</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-3 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-white rounded-lg p-8 mt-4 text-center">
                <p className="text-red-500">Error: {error}</p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-lg p-12 mt-4 text-center">
                <p className="text-gray-500 text-sm">No products found in this category.</p>
                <Link to="/products" className="text-[#00A651] text-sm mt-3 inline-block hover:underline">
                  View all products
                </Link>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {products.map((p) => {
                  const image = p.images?.[0]?.url || `https://picsum.photos/seed/${p.id}/400/400`;
                  const priceDisplay = p.priceMin === p.priceMax
                    ? `$${p.priceMin.toFixed(2)}`
                    : `$${p.priceMin.toFixed(2)} - $${p.priceMax.toFixed(2)}`;

                  return (
                    <Link
                      key={p.id}
                      to={`/products/slug/${p.slug}`}
                      className="bg-white rounded-lg border p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-200 group overflow-hidden"
                    >
                      <div className="overflow-hidden rounded mb-2 bg-gray-50">
                        <img
                          src={image}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-[13px] line-clamp-2 h-10 leading-tight group-hover:text-[#00A651]">
                        {p.title}
                      </h3>
                      <p className="font-bold text-sm mt-1 text-[#00A651]">{priceDisplay}</p>
                      <p className="text-[11px] text-gray-500">
                        Min. order: {p.minOrderQty} {p.unit}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {p.supplier?.country || 'Pakistan'}
                        {p.supplier?.isVerified && ' ✓'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => updateParam('page', String(Math.max(1, page - 1)))}
                  disabled={page <= 1}
                  className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-600 px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => updateParam('page', String(Math.min(pagination.totalPages, page + 1)))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

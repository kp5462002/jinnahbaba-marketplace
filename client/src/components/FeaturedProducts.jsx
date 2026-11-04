import { useEffect, useState } from 'react';
import { apiFetch } from '../api/fetch.js';
import { Link } from 'react-router-dom';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/products?limit=12');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const list = data.products || [];
        setProducts(list);
      } catch (err) {
        console.error('API failed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Just for you from Pakistan 🇵🇰</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-3 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Just for you from Pakistan 🇵🇰</h2>
        <p className="text-gray-500">No products available right now.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">
        Just for you from Pakistan 🇵🇰 - {products.length} Products
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((p) => {
          const pid = p.id;
          const title = p.title;
          const image = p.images?.[0]?.url || `https://picsum.photos/seed/${pid}/400/400`;
          const priceDisplay = p.priceMin === p.priceMax
            ? `$${p.priceMin.toFixed(2)}`
            : `$${p.priceMin.toFixed(2)} - $${p.priceMax.toFixed(2)}`;

          return (
            <Link
              key={pid}
              to={`/products/slug/${p.slug}`}
              className="bg-white rounded-lg border p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-200 group overflow-hidden"
            >
              <div className="overflow-hidden rounded mb-2 bg-gray-50">
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[13px] line-clamp-2 h-10 leading-tight group-hover:text-[#00A651]">
                {title}
              </h3>
              <p className="font-bold text-sm mt-1 text-[#00A651]">
                {priceDisplay}
              </p>
              <p className="text-[11px] text-gray-500">
                Min. order: {p.minOrderQty} {p.unit}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {p.supplier?.country || 'Pakistan'}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

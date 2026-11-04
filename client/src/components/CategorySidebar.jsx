import { useEffect, useState } from 'react';
import { apiFetch } from '../api/fetch.js';
import { Link } from 'react-router-dom';

export default function CategorySidebar() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/categories');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Categories fetch failed:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="w-[280px] bg-white rounded-lg p-4 hidden lg:block shrink-0">
        <h3 className="font-bold mb-4">☰ Categories for you</h3>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] bg-white rounded-lg p-4 hidden lg:block shrink-0">
      <h3 className="font-bold mb-4 flex items-center gap-2">☰ Categories for you</h3>
      <ul className="space-y-1">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              to={`/products?category=${cat.slug}`}
              className="text-[14px] text-gray-700 hover:text-[#00A651] hover:bg-gray-50 cursor-pointer flex justify-between items-center py-2 px-2 rounded transition"
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-gray-400 flex items-center gap-1">
                {cat._count?.products > 0 && (
                  <span className="text-[11px] text-gray-400">{cat._count.products}</span>
                )}
                <span>›</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t">
        <h4 className="font-bold text-sm mb-2">Top Ranking</h4>
        <p className="text-xs text-gray-500">Most popular products this week</p>
      </div>
    </div>
  );
}

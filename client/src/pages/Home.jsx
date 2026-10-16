import { Link } from 'react-router-dom';
import SearchSection from '../components/SearchSection';
import FeaturedProducts from '../components/FeaturedProducts';
import CategorySidebar from '../components/CategorySidebar';

export default function Home() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <SearchSection />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <CategorySidebar />

          <div className="flex-1">
            <div className="bg-gradient-to-r from-[#e8f5e9] to-white rounded-lg p-6 flex gap-6 border">
              <div className="flex-1">
                <span className="bg-[#00A651] text-white text-xs px-3 py-1 rounded-full">Hot picks</span>
                <h2 className="text-2xl font-bold mt-3">Find products for your business</h2>
                <p className="text-gray-600 text-sm mt-1">Source from 1M+ verified suppliers</p>
                <div className="flex gap-3 mt-5">
                  <img src="https://images.unsplash.com/photo-1525598912003-663126343e1f?w=100&h=100&fit=crop" alt="" className="w-20 h-20 bg-white rounded-lg border object-cover" />
                  <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" alt="" className="w-20 h-20 bg-white rounded-lg border object-cover" />
                  <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&h=100&fit=crop" alt="" className="w-20 h-20 bg-white rounded-lg border object-cover" />
                </div>
              </div>
              <div className="w-[300px] bg-white rounded-lg p-5 border hidden md:block">
                <h3 className="font-bold">Start your order</h3>
                <p className="text-xs text-gray-600 mt-1">Trade with confidence</p>
                <button className="w-full bg-[#00A651] hover:bg-[#008a44] text-white py-2.5 rounded-full mt-4 text-sm font-semibold transition">
                  Post a Request
                </button>
                <p className="text-[11px] text-gray-400 mt-2 text-center">Get quotes from suppliers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">For Buyers</h3>
                <p className="text-gray-600 text-sm">Discover products, compare suppliers, send RFQs.</p>
                <Link to="/products" className="text-[#00A651] text-sm font-medium mt-3 inline-block hover:underline">
                  Browse Products →
                </Link>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">For Suppliers</h3>
                <p className="text-gray-600 text-sm">List products, receive inquiries, and manage B2B orders.</p>
                <Link to="/register" className="text-[#00A651] text-sm font-medium mt-3 inline-block hover:underline">
                  Join as Supplier →
                </Link>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Secure Trading</h3>
                <p className="text-gray-600 text-sm">Trade with confidence with Trade Assurance and verified suppliers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeaturedProducts />
    </div>
  );
}

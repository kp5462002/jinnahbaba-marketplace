import { Link } from 'react-router-dom';
import SearchSection from '../components/SearchSection';
import FeaturedProducts from '../components/FeaturedProducts';
import CategorySidebar from '../components/CategorySidebar';
import FloatingRail from '../components/FloatingRail';

export default function Home() {
  const countries = [
    { name: 'All', flag: '🌍', path: '/products' },
    { name: 'China', flag: '🇨🇳', path: '/products?country=China' },
    { name: 'Pakistan', flag: '🇵🇰', path: '/products?country=Pakistan' },
    { name: 'India', flag: '🇮🇳', path: '/products?country=India' },
    { name: 'Turkey', flag: '🇹🇷', path: '/products?country=Turkey' },
    { name: 'UAE', flag: '🇦🇪', path: '/products?country=United Arab Emirates' },
    { name: 'Saudi Arabia', flag: '🇸🇦', path: '/products?country=Saudi Arabia' },
    { name: 'Indonesia', flag: '🇮🇩', path: '/products?country=Indonesia' },
    { name: 'Vietnam', flag: '🇻🇳', path: '/products?country=Vietnam' },
    { name: 'Kazakhstan', flag: '🇰🇿', path: '/products?country=Kazakhstan' },
    { name: 'Uzbekistan', flag: '🇺🇿', path: '/products?country=Uzbekistan' },
    { name: 'Russia', flag: '🇷🇺', path: '/products?country=Russia' },
    { name: 'Africa', flag: '🌍', path: '/products?region=Africa' },
    { name: 'Europe', flag: '🇪🇺', path: '/products?region=Europe' },
  ];

  const industryHubs = [
    {
      title: 'Pakistani Textiles',
      subtitle: 'Premium Quality Fabric',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      link: '/products?country=Pakistan&categorySlug=apparel-accessories',
      searches: '923K+ searches',
    },
    {
      title: 'Chinese Electronics',
      subtitle: 'Smart Home & Gadgets',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
      link: '/products?country=China&categorySlug=consumer-electronics',
      searches: '413K+ searches',
    },
    {
      title: 'Turkish Home Decor',
      subtitle: 'Elegant Living Essentials',
      image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600',
      link: '/products?country=Turkey&categorySlug=home-garden',
      searches: '75K+ searches',
    },
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <SearchSection />

      {/* ===== BROWSE BY COUNTRY ===== */}
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Your global suppliers guide from 190+ regions</h2>
              <p className="text-xs text-gray-500 mt-1">Belt & Road Initiative countries — CPEC & global trade hubs</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">🌐 Diversified global reach</span>
              <span className="flex items-center gap-1">💰 Lower tariffs</span>
              <span className="flex items-center gap-1">📦 Faster fulfillment</span>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2">
            {countries.map((country) => (
              <Link
                key={country.name}
                to={country.path}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 border-2 border-transparent group-hover:border-[#00A651] flex items-center justify-center text-2xl md:text-3xl transition">
                  {country.flag}
                </div>
                <span className="text-[11px] md:text-xs font-medium text-gray-700 group-hover:text-[#00A651] transition text-center max-w-[80px] leading-tight">
                  {country.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== GLOBAL INDUSTRY HUBS ===== */}
      <div className="bg-white">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Global industry hubs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {industryHubs.map((hub) => (
              <Link
                key={hub.title}
                to={hub.link}
                className="relative rounded-lg overflow-hidden group h-48"
              >
                <img
                  src={hub.image}
                  alt={hub.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                  Explore now
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-lg font-bold">{hub.title}</div>
                  <div className="text-xs opacity-90">{hub.subtitle}</div>
                  <div className="text-[11px] opacity-70 mt-1 flex items-center gap-1">
                    🔍 {hub.searches}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BROWSING HISTORY + KEEP LOOKING ===== */}
      <div className="bg-white">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white border rounded-lg p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Browsing history</h3>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&h=100&fit=crop" alt="" className="w-20 h-20 rounded object-cover" />
                <div>
                  <div className="text-sm font-semibold text-gray-800">Smart Watch</div>
                  <div className="text-xs text-gray-500 mt-1">Just viewed</div>
                  <div className="text-sm font-bold text-[#00A651] mt-1">$8.90 - $15.00</div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-1">Keep looking for</h3>
              <p className="text-xs text-gray-500 mb-3">Other Home Decor</p>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=100&h=100&fit=crop" alt="" className="w-16 h-16 rounded object-cover" />
                <div>
                  <div className="text-xs font-medium text-gray-700">Ceramic Set</div>
                  <div className="text-xs font-bold text-[#00A651]">$179.73</div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-1">Keep looking for</h3>
              <p className="text-xs text-gray-500 mb-3">Dining Room Sets</p>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1615873968403-89e068629265?w=100&h=100&fit=crop" alt="" className="w-16 h-16 rounded object-cover" />
                <div>
                  <div className="text-xs font-medium text-gray-700">Dining Set</div>
                  <div className="text-xs font-bold text-[#00A651]">$100.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO + CATEGORY + CTA ===== */}
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
                <Link to="/rfq/new" className="block w-full text-center bg-[#00A651] hover:bg-[#008a44] text-white py-2.5 rounded-full mt-4 text-sm font-semibold transition">
                  Post a Request
                </Link>
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
      <FloatingRail />
    </div>
  );
}

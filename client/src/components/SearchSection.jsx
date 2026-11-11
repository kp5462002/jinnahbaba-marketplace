import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, FileText, Search } from 'lucide-react';

export default function SearchSection() {
  const [query, setQuery] = useState("magnetic levitation led night lamp");
  const [activeTab, setActiveTab] = useState("Products");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) return;
    if (activeTab === "Products") {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else if (activeTab === "Suppliers") {
      navigate(`/products?search=${encodeURIComponent(query)}&type=supplier`);
    } else if (activeTab === "AI Mode") {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/rfq?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-white border-b">
      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="flex gap-6 md:gap-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab("AI Mode")}
            className={`pb-3 text-[15px] font-medium border-b-2 transition flex items-center gap-1 ${
              activeTab === "AI Mode"
                ? "border-[#00A651] text-[#00A651]"
                : "border-transparent text-gray-700 hover:text-black"
            }`}
          >
            <Sparkles size={16} />
            AI Mode
          </button>
          {["Products", "Suppliers", "RFQ", "Worldwide"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[15px] font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-[#00A651] text-[#00A651]"
                  : "border-transparent text-gray-700 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-center py-6">
          <div className="w-full max-w-[900px] border-2 border-[#00A651] rounded-2xl bg-white p-2">
            <div className="flex items-center">
              <div className="px-4 py-2 text-sm text-gray-700 border-r hidden sm:block">
                All Products
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What are you looking for..."
                className="flex-1 px-4 py-2 outline-none text-[15px]"
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#00A651] to-[#008a44] hover:opacity-90 text-white px-6 py-2.5 rounded-full font-medium text-[14px] flex items-center gap-2"
              >
                <Search size={16} />
                Search
              </button>
            </div>
            <div className="flex items-center gap-4 px-4 pt-2 pb-1 text-xs text-gray-500">
              <button className="flex items-center gap-1 hover:text-[#00A651] transition">
                <Camera size={14} /> Image Search
              </button>
              <span>|</span>
              <button className="flex items-center gap-1 hover:text-[#00A651] transition">
                <FileText size={14} /> Search with File
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 pb-3 max-w-[900px] mx-auto flex-wrap gap-2">
          <span>Welcome to <b>Jinnahbaba.com</b></span>
          <div className="flex gap-4 flex-wrap">
            <span>◎ Request for Quotation</span>
            <span>🏆 Top Ranking</span>
            <span>⚡ Fast customization</span>
          </div>
        </div>
      </div>
    </div>
  );
}

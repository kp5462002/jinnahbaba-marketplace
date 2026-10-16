import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex gap-8 justify-center">
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
          <div className="flex items-center w-full max-w-[800px] border-2 border-[#00A651] rounded-full overflow-hidden bg-white">
            <div className="px-5 py-3 text-sm text-gray-700 border-r bg-gray-50 hidden sm:block">
              All Products
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What are you looking for..."
              className="flex-1 px-5 py-3 outline-none text-[15px]"
            />
            <button
              onClick={handleSearch}
              className="bg-[#00A651] hover:bg-[#008a44] text-white px-8 py-2.5 m-1 rounded-full font-medium text-[14px]"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 pb-3 max-w-[800px] mx-auto">
          <span>Welcome to <b>Jinnahbaba.com</b></span>
          <div className="flex gap-4">
            <span>◎ Request for Quotation</span>
            <span>🏆 Top Ranking</span>
            <span>⚡ Fast customization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
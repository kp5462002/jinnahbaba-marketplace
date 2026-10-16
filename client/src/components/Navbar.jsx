import { Link } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";

const Navbar = () => {
  return (
    <header className="bg-[#00A651] text-white">
      {/* TOP ROW - Logo + Right Icons like Alibaba */}
      <div className="flex justify-between items-center px-8 py-4">
        {/* LEFT - Logo - BIG like Alibaba */}
        <Link to="/">
          <img src={logoWhite} alt="Jinnahbaba.com" className="h-20 w-auto object-contain" />
        </Link>

        {/* RIGHT - Like Alibaba: Flag + Language + Icons */}
        <div className="flex items-center gap-6 text-[13px]">
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Deliver to:</span>
            <span className="flex items-center gap-1">
              <span className="text-base">🇵🇰</span> Pakistan
            </span>
          </div>

          <div className="flex items-center gap-1 cursor-pointer hover:underline">
            <span className="text-base">🌐</span>
            <span>English-PKR</span>
          </div>

          <div className="flex items-center gap-5 ml-4 text-xl">
            <span className="cursor-pointer" title="Cart">🛒</span>
            <span className="cursor-pointer" title="Messages">💬</span>
            <span className="cursor-pointer" title="Orders">📋</span>
            <span className="cursor-pointer" title="Profile">👤</span>
          </div>

          <span className="cursor-pointer hover:underline ml-2">Sign In</span>
        </div>
      </div>

      {/* SECOND ROW - Categories like Alibaba */}
      <div className="flex justify-between items-center px-8 pb-3 text-[13px] border-t border-white/10 pt-3">
        <div className="flex items-center gap-6">
          <span className="font-bold cursor-pointer">☰ All categories</span>
          <span className="cursor-pointer hover:underline">Featured selections</span>
          <span className="cursor-pointer hover:underline">Order protections</span>
        </div>
        <div>
          <span className="cursor-pointer hover:underline">Buyer Central</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
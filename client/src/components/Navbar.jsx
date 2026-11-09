import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const displayName =
    user?.companyName || user?.contactName || user?.email || "Account";

  return (
    <header className="bg-[#00A651] text-white">
      <div className="flex justify-between items-center px-3 md:px-8 py-2 md:py-4">
        <Link to="/">
          <img src={logoWhite} alt="Jinnahbaba.com" className="h-12 md:h-20 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-2 md:gap-6 text-[13px]">
          <div className="hidden md:flex items-center gap-2 cursor-pointer hover:underline">
            <span>Deliver to:</span>
            <span className="flex items-center gap-1">
              <span className="text-base">🇵🇰</span> Pakistan
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 cursor-pointer hover:underline">
            <span className="text-base">🌐</span>
            <span>English-PKR</span>
          </div>

          <div className="flex items-center gap-3 md:gap-5 md:ml-4 text-lg md:text-xl">
            <Link
              to="/cart"
              className="relative cursor-pointer hover:opacity-80 transition"
              title="Cart"
            >
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <span className="cursor-pointer" title="Messages">💬</span>
            <span className="cursor-pointer" title="Orders">📋</span>
          </div>

          {user ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer hover:underline"
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                  {displayName[0]?.toUpperCase()}
                </span>
                <span className="max-w-[160px] truncate">{displayName}</span>
                <span className="text-[10px]">▾</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <div className="text-xs text-gray-500">Signed in as</div>
                    <div className="text-sm font-semibold truncate">{user.email}</div>
                    <div className="text-[11px] text-gray-500 mt-1">Role: {user.role}</div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    📊 My Dashboard
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold"
                    >
                      🔧 Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    🛒 My Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>
                  <Link
                    to="/rfq"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    💬 My RFQs
                  </Link>

                  <div className="border-t">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      ↩ Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:underline ml-2">
              Sign In
            </Link>
          )}
        </div>
      </div>

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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: 'BUYER',
    contactName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'PK',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role: form.role,
        email: form.email,
        password: form.password,
        contactName: form.contactName || undefined,
        companyName: form.companyName || undefined,
        phone: form.phone || undefined,
        country: form.country || undefined,
      };
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl border shadow-sm p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Jinnahbaba.com — buy or sell globally
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update('role', 'BUYER')}
                className={`border-2 rounded-lg py-3 text-sm font-semibold transition ${
                  form.role === 'BUYER'
                    ? 'border-[#00A651] bg-[#00A651]/5 text-[#00A651]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🛒 Buy products
              </button>
              <button
                type="button"
                onClick={() => update('role', 'SUPPLIER')}
                className={`border-2 rounded-lg py-3 text-sm font-semibold transition ${
                  form.role === 'SUPPLIER'
                    ? 'border-[#00A651] bg-[#00A651]/5 text-[#00A651]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🏭 Sell products
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.role === 'SUPPLIER' ? 'Company name' : 'Full name'}
            </label>
            <input
              type="text"
              value={form.role === 'SUPPLIER' ? form.companyName : form.contactName}
              onChange={(e) =>
                form.role === 'SUPPLIER'
                  ? update('companyName', e.target.value)
                  : update('contactName', e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
              placeholder={form.role === 'SUPPLIER' ? 'Acme Trading Co.' : 'John Doe'}
            />
          </div>

          {form.role === 'SUPPLIER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact name
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
                placeholder="+92 300 1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]"
              >
                <option value="PK">Pakistan</option>
                <option value="CN">China</option>
                <option value="IN">India</option>
                <option value="TR">Turkey</option>
                <option value="VN">Vietnam</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">UAE</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A651] hover:bg-[#008a44] disabled:opacity-60 text-white font-bold py-2.5 rounded-full transition mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00A651] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

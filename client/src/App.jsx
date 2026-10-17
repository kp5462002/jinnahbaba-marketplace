import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ProductListing from './pages/ProductListing.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RFQList from './pages/RFQList.jsx';
import RFQCreate from './pages/RFQCreate.jsx';
import SupplierProfile from './pages/SupplierProfile.jsx';
import Cart from './pages/Cart.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/slug/:slug" element={<ProductDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rfq" element={<RFQList />} />
        <Route path="/rfq/new" element={<RFQCreate />} />
        <Route path="/rfq/:id" element={<RFQList />} />
        <Route path="/suppliers/:id" element={<SupplierProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

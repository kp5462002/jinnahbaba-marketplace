import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/fetch.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        setCart(null);
      }
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, fetchCart]);

  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Please sign in to add items to cart');

    const res = await apiFetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add to cart');
    }
    const data = await res.json();
    setCart(data);
    return data;
  };

  const removeItem = async (itemId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const res = await apiFetch(`/cart/item/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce(
    (sum, i) => sum + i.quantity * i.product.priceMin,
    0
  ) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, addToCart, removeItem, refreshCart: fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

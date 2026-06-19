import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('aurum_user');
    return u ? JSON.parse(u) : null;
  });
  const [cart, setCart] = useState(() => {
    const c = localStorage.getItem('aurum_cart');
    return c ? JSON.parse(c) : [];
  });

  useEffect(() => {
    localStorage.setItem('aurum_cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('aurum_token', data.token);
    localStorage.setItem('aurum_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('aurum_token', data.token);
    localStorage.setItem('aurum_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aurum_token');
    localStorage.removeItem('aurum_user');
    setUser(null);
  };

  const addToCart = (product, sizeKey, sizeLabel, price) => {
    // Always normalise images to a plain array so localStorage round-trip is safe
    const images = Array.isArray(product.images)
      ? product.images
      : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
    setCart(prev => {
      const key = `${product.id}-${sizeKey}`;
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, id: product.id, name: product.name, brand_name: product.brand_name, sizeKey, sizeLabel, price, qty: 1, images }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
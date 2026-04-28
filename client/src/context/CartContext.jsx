import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fetchCart = async () => {
    if (!user?.id) return;
    setLoadingCart(true);
    try {
      const res = await fetch(`http://localhost:5000/api/carrito/${user.id}`);
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Escuchar eventos de storage para actualizar carrito al loguearse/desloguearse
    const handleStorage = () => fetchCart();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line
  }, [user?.id]);

  const addToCart = async (producto_id, cantidad = 1) => {
    if (!user?.id) {
      alert("Debes iniciar sesión para añadir productos al carrito.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/carrito/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, producto_id, cantidad })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsCartOpen(true); // Abrir modal automáticamente
        await fetchCart(); // Refrescar carrito
      } else {
        alert(data.error || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error de red al conectar con el servidor.');
    }
  };

  const removeFromCart = async (carrito_id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/carrito/eliminar/${carrito_id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (carrito_id, cantidad) => {
    try {
      const res = await fetch(`http://localhost:5000/api/carrito/actualizar/${carrito_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchCart();
      } else {
        alert(data.error || 'Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ cartItems, isCartOpen, loadingCart, addToCart, removeFromCart, updateQuantity, toggleCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

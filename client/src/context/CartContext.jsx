import React, { createContext, useState, useEffect, useContext } from 'react';
import Notification from '../components/ui/Notification.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fetchCart = async () => {
    const stored = localStorage.getItem('user');
    const currentUser = stored ? JSON.parse(stored) : null;
    if (!currentUser?.id) return;
    setLoadingCart(true);
    try {
      const res = await fetch(`http://localhost:5000/api/carrito/${currentUser.id}`);
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
    const stored = localStorage.getItem('user');
    const currentUser = stored ? JSON.parse(stored) : null;
    if (!currentUser?.id) {
      alert("Debes iniciar sesión para añadir productos al carrito.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/carrito/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: currentUser.id, producto_id, cantidad })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsCartOpen(true); // Abrir modal automáticamente
        await fetchCart(); // Refrescar carrito
        showNotification('Producto agregado al carrito', 'success');
      } else {
        const msg = data.error || 'Error al agregar al carrito';
        showNotification(msg, 'error');
        alert(msg);
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
        showNotification('Producto eliminado del carrito', 'success');
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
        showNotification('Cantidad actualizada en el carrito', 'success');
      } else {
        const msg = data.error || 'Error al actualizar cantidad';
        showNotification(msg, 'error');
        alert(msg);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const checkoutOrder = async (total) => {
    const stored = localStorage.getItem('user');
    const currentUser = stored ? JSON.parse(stored) : null;
    if (!currentUser?.id || cartItems.length === 0) return { success: false };

    try {
      const res = await fetch('http://localhost:5000/api/ordenes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: currentUser.id, total })
      });
      const data = await res.json();
      if (res.ok) {
        setIsCartOpen(false); // Cerramos el modal
        await fetchCart(); // Refresca, dejándolo vacío
        showNotification('Orden creada exitosamente', 'success');
        return { success: true };
      } else {
        const message = data.message || data.error || 'Error al procesar la orden';
        showNotification(message, 'error');
        return { success: false, code: data.error, message };
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      return { success: false, message: 'Error de conexión al procesar la orden' };
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <>
      <CartContext.Provider value={{ cartItems, isCartOpen, loadingCart, addToCart, removeFromCart, updateQuantity, checkoutOrder, toggleCart, fetchCart, showNotification }}>
        {children}
      </CartContext.Provider>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
};

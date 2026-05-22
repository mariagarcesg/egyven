import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

const CartModal = () => {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity, checkoutOrder } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (Number(item.precio_unitario || item.precio_venta || 0) * item.cantidad), 0);

  const handleCheckout = async () => {
    setCheckoutError('');
    setIsProcessing(true);
    const result = await checkoutOrder(total);
    setIsProcessing(false);
    
    if (result.success) {
      alert('¡Orden creada exitosamente! Gracias por su compra.');
    } else {
      setCheckoutError(result.message || 'Error desconocido.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={toggleCart}
      />

      {/* Modal / Sidebar Right */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-500">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 uppercase">Tu Carrito</h2>
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest block mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'Artículo' : 'Artículos'}
            </span>
          </div>
          <button
            onClick={toggleCart}
            className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-slate-400 mt-20 italic">
              El carrito está vacío.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.carrito_id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 p-2">
                  <img
                    src={`http://localhost:5000/${item.imagen?.replace(/\\/g, '/')}`}
                    alt={item.nombre}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22/%3E%3C/svg%3E'; }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">{item.nombre}</h4>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.categoria_nombre}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.carrito_id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar del carrito"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.carrito_id, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="text-slate-700 text-xs font-bold w-4 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.carrito_id, item.cantidad + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-blue-600 font-bold">${Number(item.precio_unitario || item.precio_venta).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            {checkoutError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex flex-col gap-2 shadow-sm animate-pulse">
                <span>{checkoutError}</span>
                {checkoutError.includes('Perfil') && (
                  <button 
                    onClick={() => { toggleCart(); navigate('/perfil'); }}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Ir a Completar Perfil
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 uppercase font-black tracking-widest text-xs">Total Estimado</span>
              <span className="text-3xl font-black italic text-slate-900">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {isProcessing ? 'Procesando...' : 'Crear Orden de Compra'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartModal;

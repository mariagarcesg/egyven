import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';

const CatalogoView = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('http://localhost:5000/api/productos'),
          fetch('http://localhost:5000/api/productos/categorias')
        ]);

        const dataProd = await resProd.json();
        const dataCat = await resCat.json();

        setProductos(dataProd);
        const nombresCat = dataCat.map(c => c.nombre);
        setCategorias(['Todos', ...nombresCat]);
      } catch (error) {
        console.error("Error cargando catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lógica de Roles y Sesión
  const isAdmin = user?.rol_id === 1 || user?.rol_id === 4;
  const isCliente = user?.rol_id === 5;
  const isLogged = !!user; // Verifica si hay cualquier usuario logueado

  const productosFiltrados = activeCategory === 'Todos'
    ? productos
    : productos.filter(p => p.categoria_nombre === activeCategory);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isAdmin ? 'bg-white text-slate-900' : 'bg-[#05070a] text-slate-200'} font-sans`}>
      <Navbar />
      <div className="h-20"></div>

      {/* HERO SECTION */}
      <header className={`py-20 px-6 border-b ${isAdmin ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Industrial Solutions</span>
          <h1 className={`text-6xl font-black tracking-tighter mb-6 ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
            NUESTROS <span className="text-blue-500">PRODUCTOS</span>
          </h1>
          <p className={`${isAdmin ? 'text-slate-500' : 'text-slate-400'} max-w-2xl mx-auto text-lg leading-relaxed`}>
            Los mejores servicios y componentes electrónicos para el mercado venezolano.
          </p>
        </div>
      </header>

      {/* BARRA DE CATEGORÍAS */}
      <div className={`sticky top-20 z-40 backdrop-blur-md border-b py-6 ${isAdmin ? 'bg-white/90 border-slate-200' : 'bg-[#05070a]/90 border-white/5'}`}>
        <div className="flex justify-center gap-3 overflow-x-auto px-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20'
                : (isAdmin
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300')
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-500 font-black tracking-widest text-xs uppercase">Cargando Inventario Real...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productosFiltrados.map((prod) => (
              <div key={prod.id} className={`group border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${isAdmin
                ? 'bg-white border-slate-200 hover:border-blue-500/40'
                : 'bg-[#0d1117] border-white/5 hover:border-blue-500/40'
                }`}>

                {/* Contenedor de Imagen */}
                <div className={`aspect-square relative overflow-hidden flex items-center justify-center p-12 ${isAdmin ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                  <div className={`absolute inset-0 opacity-80 ${isAdmin ? 'bg-gradient-to-t from-white to-transparent' : 'bg-gradient-to-t from-[#0d1117] to-transparent'}`}></div>
                  <img
                    src={`http://localhost:5000/${prod.imagen?.replace(/\\/g, '/')}`}
                    alt={prod.nombre}
                    className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23111%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%23444%22%20text-anchor%3D%22middle%22%3EEGYVEN%20-%20IMAGEN%20NO%20DISPONIBLE%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{prod.categoria_nombre}</span>
                      <h3 className={`text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
                        {prod.nombre}
                      </h3>

                      {/* El SKU solo se ve si NO es cliente (Rol 5) */}
                      {!isCliente && (
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">SKU: {prod.sku}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${isAdmin ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-white/5'}`}>
                      ${prod.precio_venta}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Stock disponible: <span className="text-blue-500 font-bold">{prod.stock_actual} unidades</span>.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => document.getElementById(`modal_producto_${prod.id}`).showModal()}
                      className={`flex-grow py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border flex items-center justify-center gap-2 group/btn ${isAdmin
                        ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-white/5'
                        }`}
                    >
                      Detalles
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {/* Botón de Carrito: Ahora visible para cualquier usuario logueado */}
                    {isLogged && (
                      <button
                        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group/cart active:scale-95"
                        title="Agregar al carrito"
                        onClick={() => addToCart(prod.id, 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* MODAL DE DETALLES */}
                <dialog
                  id={`modal_producto_${prod.id}`}
                  className="fixed inset-0 m-auto bg-transparent border-none outline-none backdrop:bg-black/80 backdrop:backdrop-blur-sm"
                >
                  <div className={`border-none outline-none rounded-[2.5rem] p-10 shadow-2xl max-w-lg w-full ${isAdmin ? 'bg-white' : 'bg-[#0d1117]'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest block mb-2">Ficha Técnica Egyven</span>
                        <h3 className={`text-3xl font-black italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>{prod.nombre}</h3>
                      </div>
                      <form method="dialog">
                        <button className="text-slate-600 hover:text-blue-500 transition-colors text-xl font-black">✕</button>
                      </form>
                    </div>

                    <div className={`space-y-4 text-sm border-t pt-6 ${isAdmin ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-white/5'}`}>
                      <div className={`flex justify-between border-b pb-2 ${isAdmin ? 'border-slate-100' : 'border-white/5'}`}>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Precio Venta</span>
                        <span className="font-mono text-xs text-blue-500 font-bold">${prod.precio_venta}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-2 ${isAdmin ? 'border-slate-100' : 'border-white/5'}`}>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Categoría</span>
                        <span className={`font-mono text-xs ${isAdmin ? 'text-slate-900' : 'text-white'}`}>{prod.categoria_nombre}</span>
                      </div>
                      {/* Ocultar SKU en el modal solo para clientes */}
                      {!isCliente && (
                        <div className={`flex justify-between border-b pb-2 ${isAdmin ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className="font-bold text-slate-500 uppercase text-[10px]">SKU</span>
                          <span className={`font-mono text-xs ${isAdmin ? 'text-slate-900' : 'text-white'}`}>{prod.sku}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <form method="dialog" className="w-full">
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
                          Cerrar Detalles
                        </button>
                      </form>
                    </div>
                  </div>
                </dialog>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CatalogoView;
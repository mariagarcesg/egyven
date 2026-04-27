import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';

const CatalogoView = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const categories = ['Todos', 'Periféricos', 'Componentes', 'Herramientas'];

  const isAdmin = user?.rol_id === 1 || user?.rol_id === 4;

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
          {categories.map(cat => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`group border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${
              isAdmin 
                ? 'bg-white border-slate-200 hover:border-blue-500/40' 
                : 'bg-[#0d1117] border-white/5 hover:border-blue-500/40'
            }`}>
              <div className={`aspect-square relative overflow-hidden flex items-center justify-center p-12 ${isAdmin ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                <div className={`absolute inset-0 opacity-80 ${isAdmin ? 'bg-gradient-to-t from-white to-transparent' : 'bg-gradient-to-t from-[#0d1117] to-transparent'}`}></div>
                <div className={`relative z-10 w-full h-full border-2 border-dashed rounded-2xl flex items-center justify-center font-black italic text-center text-xs p-4 ${isAdmin ? 'border-slate-200 text-slate-300' : 'border-white/10 text-slate-700'}`}>
                  PRODUCTO EGYVEN <br /> ASSET {i}
                </div>
              </div>

              <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Componente</span>
                    <h3 className={`text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>Model X-24{i}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${isAdmin ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-white/5'}`}>$450.00</span>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Optimizado para flujos de trabajo intensivos y gestión de datos en tiempo real.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => document.getElementById(`modal_producto_${i}`).showModal()}
                    className={`flex-grow py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border flex items-center justify-center gap-2 group/btn ${
                      isAdmin 
                        ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-white/5'
                    }`}
                  >
                    Detalles
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {user?.rol_id === 5 && (
                    <button
                      className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group/cart"
                      title="Agregar al carrito"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover/cart:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* MODAL */}
              <dialog 
                id={`modal_producto_${i}`} 
                className="fixed inset-0 m-auto bg-transparent border-none outline-none backdrop:bg-black/80 backdrop:backdrop-blur-sm"
              >
                <div className={`border-none outline-none rounded-[2.5rem] p-10 shadow-2xl max-w-lg w-full ${isAdmin ? 'bg-white' : 'bg-[#0d1117]'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest block mb-2">Especificaciones Técnicas</span>
                      <h3 className={`text-3xl font-black italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>Model X-24{i}</h3>
                    </div>
                    <form method="dialog">
                      <button className="text-slate-600 hover:text-blue-500 transition-colors text-xl font-black">✕</button>
                    </form>
                  </div>

                  <div className={`space-y-4 text-sm border-t pt-6 ${isAdmin ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-white/5'}`}>
                    <div className={`flex justify-between border-b pb-2 ${isAdmin ? 'border-slate-100' : 'border-white/5'}`}>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Voltaje de Operación</span>
                      <span className={`font-mono text-xs ${isAdmin ? 'text-slate-900' : 'text-white'}`}>240V AC / 50Hz</span>
                    </div>
                    {/* ... más specs ... */}
                  </div>

                  <p className="py-6 text-slate-500 italic text-xs leading-relaxed">
                    * Los activos de EGYVEN incluyen soporte técnico preventivo durante los primeros 12 meses.
                  </p>

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
      </main>
    </div>
  );
};

export default CatalogoView;
import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';

const CatalogoView = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', 'Periféricos', 'Componentes', 'Herramientas'];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans">
      
      {/* NAVBAR REUTILIZABLE */}
      <Navbar />

      {/* ESPACIADOR PARA EL NAVBAR FIXED */}
      <div className="h-20"></div>

      {/* HERO SECTION */}
      <header className="py-20 px-6 border-b border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Industrial Solutions</span>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-6">
            NUESTROS <span className="text-blue-500">PRODUCTOS</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Los mejores servicios y componentes electrónicos para el mercado venezolano.
          </p>
        </div>
      </header>

      {/* BARRA DE CATEGORÍAS */}
      <div className="sticky top-20 z-40 bg-[#05070a]/90 backdrop-blur-md border-b border-white/5 py-6">
        <div className="flex justify-center gap-3 overflow-x-auto px-4">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
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
            <div key={i} className="group bg-[#0d1117] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-2xl">
              <div className="aspect-square bg-slate-800/50 relative overflow-hidden flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-80"></div>
                {/* Marcador de posición para imagen técnica */}
                <div className="relative z-10 w-full h-full border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-700 font-black italic text-center text-xs p-4">
                  PRODUCTO EGYVEN <br/> HIGH-FIDELITY ASSET
                </div>
              </div>
              
              <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Componente</span>
                    <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors italic">Model X-240</h3>
                  </div>
                  <span className="bg-slate-900 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-white/5">$450.00</span>
                </div>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Optimizado para flujos de trabajo intensivos y gestión de datos en tiempo real bajo condiciones industriales.
                </p>
                
                <button className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 group/btn">
                  Detalles Técnicos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CatalogoView;
import React from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Contacto from './Contacto.jsx';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
  const navigate = useNavigate();

  const servicios = [
    { title: "Servicio Técnico", desc: "Reparación y mantenimiento especializado de hardware industrial.", icon: "🛠️" },
    { title: "Componentes", desc: "Venta de piezas electrónicas de alta fidelidad con garantía oficial.", icon: "🔌" },
    { title: "Servidores", desc: "Configuración y optimización de infraestructura de red y servidores.", icon: "🖥️" }
  ];

  const imagenesCarrusel = [
    { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=1000", label: "Servidores de Alta Densidad" },
    { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000", label: "Microprocesadores" },
    { url: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=1000", label: "Componentes SMD" }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">
      
      {/* NAVBAR REUTILIZABLE */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
                CALIDAD <br/> <span className="text-blue-500">ELECTRÓNICA</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
                Expertos en servicio técnico especializado y suministro de componentes industriales al mejor precio del mercado venezolano.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigate('/catalogo');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                >
                  Explorar Catálogo
                </button>
                <button
                  onClick={() => {
                    const contacto = document.getElementById('contacto');
                    if (contacto) contacto.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-white/10 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl hover:bg-white/5 transition-all"
                >
                  Contacto
                </button>
              </div>
            </div>
            
            {/* Carrusel Visual */}
            <div className="flex-1 w-full overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl bg-slate-900/50">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {imagenesCarrusel.map((img, idx) => (
                  <div key={idx} className="min-w-full h-[400px] snap-center relative">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute bottom-8 left-8">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-3 py-1 rounded">Asset {idx + 1}</span>
                      <h3 className="text-2xl font-bold text-white mt-2 italic">{img.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SERVICIOS */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {servicios.map((s, i) => (
          <div key={i} className="p-10 bg-[#0d1117] border border-white/5 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
            <div className="text-4xl mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-500 transition-colors">{s.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </section>
      <Contacto />
    </div>
  );
};

export default Inicio;
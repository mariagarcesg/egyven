import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-[10px] font-black uppercase tracking-widest transition-all ${
      isActive ? 'text-blue-500' : 'text-white hover:text-blue-400'
    }`;
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic">E</div>
          <span className="text-xl font-black tracking-tighter text-white">EGY<span className="text-blue-500">VEN</span></span>
        </div>
        {/* Links Centrales */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/')} className={getLinkClass('/')}>Inicio</button>
          <button onClick={() => navigate('/catalogo')} className={getLinkClass('/catalogo')}>Catálogo</button>
          <button onClick={() => navigate('/nosotros')} className={getLinkClass('/nosotros')}>Nosotros</button>
          <button
            className="text-[10px] font-black uppercase tracking-widest text-white hover:text-blue-400"
            onClick={() => {
              if (window.location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  const contacto = document.getElementById('contacto');
                  if (contacto) contacto.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              } else {
                const contacto = document.getElementById('contacto');
                if (contacto) contacto.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Contacto
          </button>
        </div>
        {/* Botones Derecha */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className={`px-4 ${getLinkClass('/login')}`}>Iniciar Sesión</button>
          <button onClick={() => navigate('/signup')} className="bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-white">Registrarse</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
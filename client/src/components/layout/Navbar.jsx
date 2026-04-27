import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]); // Se actualiza al cambiar de ruta para reflejar cambios en la sesión

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isAdmin = user?.rol_id === 1 || user?.rol_id === 4;

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (isAdmin) {
      return `text-[10px] font-black uppercase tracking-widest transition-all ${
        isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'
      }`;
    }
    return `text-[10px] font-black uppercase tracking-widest transition-all ${
      isActive ? 'text-blue-500' : 'text-white hover:text-blue-400'
    }`;
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] backdrop-blur-xl border-b transition-colors duration-500 ${isAdmin ? 'bg-white/90 border-slate-200' : 'bg-[#05070a]/80 border-white/5'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isAdmin ? '/principal' : '/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic">E</div>
          <span className={`text-xl font-black tracking-tighter ${isAdmin ? 'text-slate-900' : 'text-white'}`}>EGY<span className="text-blue-500">VEN</span></span>
        </div>
        {/* Links Centrales */}
        <div className="hidden md:flex items-center gap-8">
          {isAdmin ? (
            <button onClick={() => navigate('/principal')} className={getLinkClass('/principal')}>Módulos</button>
          ) : (
            <button onClick={() => navigate('/')} className={getLinkClass('/')}>Inicio</button>
          )}
          <button onClick={() => navigate('/catalogo')} className={getLinkClass('/catalogo')}>Catálogo</button>
          
          {!isAdmin && (
            <>
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
            </>
          )}
        </div>
        {/* Botones Derecha / Usuario */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-[10px] font-black italic">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
                  {user.username}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isAdmin ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-500'}`}
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className={`px-4 ${getLinkClass('/login')}`}>Iniciar Sesión</button>
              <button onClick={() => navigate('/signup')} className="bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-white">Registrarse</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
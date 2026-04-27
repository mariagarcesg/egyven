import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intento de login:', { email, password });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Cabecera con Botón y Logo alineados */}
        <div className="flex items-center justify-center gap-6 mb-10">
          {/* Botón de Regreso al lado del Logo */}
          <button
            onClick={() => navigate('/')}
            className="group flex flex-col items-center gap-1 transition-all"
            title="Volver al inicio"
          >
            <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-slate-400 group-hover:border-blue-500/50 group-hover:text-blue-500 group-hover:bg-blue-500/5 transition-all">
              <span className="text-xl">←</span>
            </div>
            <span className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
              Volver
            </span>
          </button>

          <div className="h-12 w-[1px] bg-white/10"></div> {/* Separador técnico */}

          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
              EGY<span className="text-blue-500">VEN</span>
            </h1>
            <p className="text-slate-500 text-[9px] mt-1 uppercase tracking-[0.3em] font-bold">
              Sistemas de Control
            </p>
          </div>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-[#0d1117]/80 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Acceso de Personal</h2>
          <p className="text-slate-400 text-sm mb-8">
            Ingresa tus credenciales para gestionar el inventario.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="usuario@egyven.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                  Contraseña
                </label>
                <a href="#" className="text-[10px] uppercase tracking-widest text-blue-500 font-black hover:text-blue-400">
                  ¿Olvidaste la clave?
                </a>
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-600 text-[10px] uppercase tracking-widest">
          © 2026 EGYVEN San Diego. Control de Activos.
        </p>
      </div>
    </div>
  );
};

export default Login;
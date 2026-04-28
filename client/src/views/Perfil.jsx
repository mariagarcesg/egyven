import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    cedula_rif: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        try {
          const response = await fetch(`http://localhost:5000/api/usuarios/${parsedUser.id}`);
          const data = await response.json();
          if (response.ok) {
            setFormData({
              username: data.username || '',
              password: '', // Por seguridad no mostramos el hash, si lo cambia se actualiza
              cedula_rif: data.cedula_rif || '',
              nombre: data.nombre || '',
              apellido: data.apellido || '',
              telefono: data.telefono || '',
              email: data.email || '',
              direccion: data.direccion || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Perfil actualizado exitosamente');
        setIsEditing(false);
        // Actualizamos el nombre y username en localStorage por si cambiaron
        const updatedUser = { ...user, username: formData.username, nombre: formData.nombre };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Disparamos evento storage para que Navbar u otros se enteren si es necesario
        window.dispatchEvent(new Event('storage'));
      } else {
        alert(result.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    }
  };

  const isAdmin = user?.rol_id === 1 || user?.rol_id === 4;

  if (loading) {
    return (
      <div className={`min-h-screen ${isAdmin ? 'bg-white' : 'bg-[#05070a]'} flex items-center justify-center font-sans`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isAdmin ? 'bg-white text-slate-900' : 'bg-[#05070a] text-slate-200'} font-sans`}>
      <Navbar />
      <div className="h-20"></div>

      <header className={`py-14 px-6 border-b ${isAdmin ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">User Settings</span>
            <h1 className={`text-5xl font-black tracking-tighter uppercase italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
              MI <span className="text-blue-600">PERFIL</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              isEditing 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className={`border rounded-[2rem] p-10 shadow-2xl transition-all ${isAdmin ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-white/5'}`}>
          <div className="flex items-center gap-6 mb-10 border-b pb-8 border-slate-200/20">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-4xl font-black italic">
              {(formData.username || formData.nombre || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-3xl font-black italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
                {formData.nombre || formData.username} {formData.apellido}
              </h2>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 block">
                {isAdmin ? 'Administrador / Empleado' : 'Cliente'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Usuario</label>
                <input 
                  type="text" name="username" value={formData.username} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Cédula / RIF</label>
                <input 
                  type="text" name="cedula_rif" value={formData.cedula_rif} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Nombre</label>
                <input 
                  type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Apellido</label>
                <input 
                  type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Teléfono</label>
                <input 
                  type="text" name="telefono" value={formData.telefono} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Dirección</label>
                <input 
                  type="text" name="direccion" value={formData.direccion} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 ml-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>Nueva Contraseña (Dejar en blanco para mantener actual)</label>
                <input 
                  type="password" name="password" value={formData.password} onChange={handleChange} disabled={!isEditing}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isAdmin 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 disabled:opacity-50 disabled:bg-slate-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-white disabled:opacity-50'
                  }`}
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-slate-200/20">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Perfil;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Notification from '../components/ui/Notification.jsx';

const Perfil = ({ userId = null, embedded = false, onClose = null, onSuccess = null }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    cedula_rif: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    status: 1
  });
  const [isEditing, setIsEditing] = useState(embedded ? true : false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let targetId = userId;
        if (!targetId) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            targetId = parsedUser.id;
            setUser(parsedUser);
          }
        }

        if (!targetId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/usuarios/${targetId}`);
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
            direccion: data.direccion || '',
            status: data.status !== undefined ? data.status : 1
          });
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, status: e.target.checked ? 1 : 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user && !userId) return;

    try {
      const targetId = userId || user.id;
      const response = await fetch(`http://localhost:5000/api/usuarios/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setIsEditing(false);
        // Si no estamos editando otro usuario, actualizamos localStorage
        if (!userId) {
          const updatedUser = { ...user, username: formData.username, nombre: formData.nombre };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage'));
        }
        // Prefer parent handler to show notification persistently
        if (onSuccess) {
          onSuccess({ message: 'Perfil actualizado exitosamente', type: 'success' });
        } else {
          setNotification({ message: 'Perfil actualizado exitosamente', type: 'success' });
        }
        if (onClose) onClose();
      } else {
        if (onSuccess) {
          onSuccess({ message: result.error || 'Error al actualizar el perfil', type: 'error' });
        } else {
          setNotification({ message: result.error || 'Error al actualizar el perfil', type: 'error' });
        }
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Error de conexión con el servidor', type: 'error' });
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

  const content = (
    <div className={`transition-colors duration-500 ${isAdmin ? 'bg-white text-slate-900' : 'bg-[#05070a] text-slate-200'} font-sans`}>
      <header className={`py-${embedded ? '3' : '6'} px-4 ${isAdmin ? 'bg-slate-50/50' : 'bg-transparent'}`}>
        <div className={`${embedded ? 'max-w-xl' : 'max-w-3xl'} mx-auto flex flex-col md:flex-row justify-between items-end gap-3`}> 
          <div>
            <h1 className={`text-${embedded ? 'lg' : '2xl'} font-black tracking-tighter ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
              PERFIL
            </h1>
          </div>
          {!embedded && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isEditing 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          )}
        </div>
      </header>

      <main className={`${embedded ? 'max-w-xl' : 'max-w-3xl'} mx-auto px-4 py-4`}> 
        <div className={`border rounded-lg ${embedded ? 'p-4' : 'rounded-[1.5rem] p-6'} shadow transition-all ${isAdmin ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-white/5'}`}>
          <div className="flex items-center gap-4 mb-4 border-b pb-4 border-slate-200/20">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-2xl font-black italic">
              {(formData.username || formData.nombre || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-${embedded ? 'lg' : '2xl'} font-black italic ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
                {formData.nombre || formData.username} {formData.apellido}
              </h2>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 block">
                {isAdmin ? 'Administrador / Empleado' : 'Cliente'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold mb-1">Usuario</label>
                <input name="username" value={formData.username} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-md px-2 py-1.5 text-sm ${isAdmin ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b1116] border-white/5 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Nombre</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-md px-2 py-1.5 text-sm ${isAdmin ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b1116] border-white/5 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Apellido</label>
                <input name="apellido" value={formData.apellido} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-md px-2 py-1.5 text-sm ${isAdmin ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b1116] border-white/5 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Email</label>
                <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-md px-2 py-1.5 text-sm ${isAdmin ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b1116] border-white/5 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={handleChange} disabled={!isEditing}
                  className={`w-full rounded-md px-2 py-1.5 text-sm ${isAdmin ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b1116] border-white/5 text-white'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">Nueva Contraseña (dejar en blanco para mantener)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} disabled={!isEditing}
                  className="w-full rounded-md px-2 py-1.5 text-sm bg-slate-50 border border-slate-200"
                />
              </div>

              {embedded && (
                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    id="status"
                    name="status"
                    type="checkbox"
                    checked={formData.status === 1 || formData.status === '1'}
                    onChange={handleCheckboxChange}
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  <label htmlFor="status" className="text-sm font-bold">Activo</label>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pt-2 pb-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-md">Guardar</button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );

  // Notification component (se muestra dentro del Perfil mientras esté montado)
  const notificationEl = (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={() => setNotification({ message: '', type: 'success' })}
    />
  );

  // Si estamos embebidos en un modal, devolvemos solo el contenido sin Navbar
  if (embedded) {
    return (
      <div className="max-w-3xl mx-auto relative">
        {notificationEl}
        {content}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isAdmin ? 'bg-white text-slate-900' : 'bg-[#05070a] text-slate-200'} font-sans`}>
      <Navbar />
      <div className="h-20"></div>
      {notificationEl}
      {content}
    </div>
  );

};

export default Perfil;


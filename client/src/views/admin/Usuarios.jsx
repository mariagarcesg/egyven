import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="h-20"></div>

      <header className="py-14 px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Staff Administration</span>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
            GESTIÓN DE <span className="text-indigo-600">USUARIOS</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold">Lista de Usuarios</h3>
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 italic text-sm">Cargando usuarios...</p>
              </div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="p-20 text-center text-slate-400 italic">
                {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No se encontraron usuarios registrados.'}
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-8 py-6 border-b border-slate-100">ID</th>
                    <th className="px-8 py-6 border-b border-slate-100">Usuario</th>
                    <th className="px-8 py-6 border-b border-slate-100">Nombre</th>
                    <th className="px-8 py-6 border-b border-slate-100">Apellido</th>
                    <th className="px-8 py-6 border-b border-slate-100 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsuarios.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-slate-400">#{user.id}</td>
                      <td className="px-8 py-4 font-bold text-slate-700">{user.username}</td>
                      <td className="px-8 py-4 text-slate-600">{user.nombre || '-'}</td>
                      <td className="px-8 py-4 text-slate-600">{user.apellido || '-'}</td>
                      <td className="px-8 py-4 text-center">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsuariosView;
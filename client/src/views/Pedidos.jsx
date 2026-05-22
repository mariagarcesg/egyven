import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';

const PedidosView = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchOrdenes();
        }
    }, [user?.id]);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/ordenes/usuario/${user.id}`);
            const data = await res.json();
            setOrdenes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener ordenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalles = async (orden) => {
        setSelectedOrden(orden);
        setIsModalOpen(true);
        setLoadingDetalles(true);
        try {
            const res = await fetch(`http://localhost:5000/api/ordenes/${orden.id}/detalles`);
            const data = await res.json();
            setDetalles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener detalles:', error);
        } finally {
            setLoadingDetalles(false);
        }
    };
    // Realizar compra (cliente)
    const handleRealizarCompra = async (ordenId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/ordenes/procesar/${ordenId}`, {
                method: 'PATCH'
            });
            if (!res.ok) {
                const err = await res.json();
                console.error('Error al realizar compra:', err);
                return;
            }
            // actualizar lista de órdenes del cliente
            fetchOrdenes();
        } catch (error) {
            console.error('Error al realizar compra:', error);
        }
    };
    const getStatusBadge = (estatus_id) => {
        switch (estatus_id) {
            case 1:
                return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>;
            case 2:
                return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">En Proceso</span>;
            case 3:
                return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pagado</span>;
            case 4:
                return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cancelado</span>;
            case 5:
                return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Finalizado</span>;
            default:
                return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Desconocido</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

            <Navbar />
            <div className="h-24"></div>

            <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <header className="mb-12">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Área de Usuario</span>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
                        MIS <span className="text-blue-500">PEDIDOS</span>
                    </h1>
                </header>

                <div className="bg-[#0d1117]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Orden</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500 italic">Cargando tus pedidos...</td>
                                    </tr>
                                ) : ordenes.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="text-slate-500 italic mb-4">Aún no has realizado ninguna compra.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    ordenes.map(orden => (
                                        <tr key={orden.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5 text-sm font-bold text-slate-300">#{orden.id}</td>
                                            <td className="px-6 py-5 text-sm text-slate-400">{new Date(orden.fecha_orden).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-sm font-bold text-blue-400">${Number(orden.total).toFixed(2)}</td>
                                            <td className="px-6 py-5">{getStatusBadge(orden.estatus_id)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleVerDetalles(orden)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-xl transition-all"
                                                >
                                                    Ver Detalles
                                                </button>
                                                {orden.estatus_id === 1 && (
                                                    <button 
                                                        onClick={() => handleRealizarCompra(orden.id)}
                                                        className="ml-2 text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-white bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 px-4 py-2 rounded-xl transition-all"
                                                    >
                                                        Realizar compra
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal de Detalles */}
            {isModalOpen && selectedOrden && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-white">Detalles del Pedido #{selectedOrden.id}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mt-1">
                                    {new Date(selectedOrden.fecha_orden).toLocaleDateString()}
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingDetalles ? (
                                <p className="text-center text-slate-500 italic py-12">Cargando detalles...</p>
                            ) : detalles.length === 0 ? (
                                <p className="text-center text-slate-500 italic py-12">No se encontraron detalles.</p>
                            ) : (
                                <div className="space-y-4">
                                    {detalles.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.02] items-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-white/5">
                                                <img 
                                                    src={`http://localhost:5000/${item.imagen?.replace(/\\/g, '/')}`} 
                                                    alt={item.nombre}
                                                    className="w-full h-full object-contain filter brightness-90"
                                                    onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22/%3E%3C/svg%3E'; }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white">{item.nombre}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">ID: {item.id_producto}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 text-xs font-bold mb-1">{item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}</div>
                                                <div className="text-blue-400 font-black">${Number(item.subtotal || (item.cantidad * item.precio_unitario)).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                            <span className="text-2xl font-black italic text-white">${Number(selectedOrden.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PedidosView;

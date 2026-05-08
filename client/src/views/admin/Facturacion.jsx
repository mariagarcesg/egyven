import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const FacturacionView = () => {
    const [activeTab, setActiveTab] = useState('ordenes');
    const [ordenes, setOrdenes] = useState([]);
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para modal de detalles de factura
    const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [facturaDetalles, setFacturaDetalles] = useState([]);
    const [loadingFacturaDetalles, setLoadingFacturaDetalles] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    useEffect(() => {
        if (activeTab === 'ordenes') {
            fetchOrdenes();
        } else if (activeTab === 'facturas') {
            fetchFacturas(); // <--- LLAMADA: Cargar facturas al cambiar de pestaña
        }
    }, [activeTab]);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/ordenes');
            const data = await res.json();
            setOrdenes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener ordenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacturas = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/facturas');
            const data = await res.json();
            setFacturas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
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

    const handleVerDetallesFactura = async (factura) => {
        setSelectedFactura(factura);
        setIsFacturaModalOpen(true);
        setLoadingFacturaDetalles(true);
        try {
            const res = await fetch(`http://localhost:5000/api/facturas/${factura.id}/detalles`);
            const data = await res.json();
            setFacturaDetalles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener detalles de factura:', error);
            setFacturaDetalles([]);
        } finally {
            setLoadingFacturaDetalles(false);
        }
    };

    // Procesar una orden: cambia el estado a "En Proceso"
    const handleProcesar = async (orden) => {
        const confirmar = window.confirm(`¿Desea convertir la Orden #${orden.id} en una Factura formal?`);
        console.log("CONTENIDO DE LA ORDEN SELECCIONADA:", orden);
        if (!confirmar) return;

        setLoading(true);
        try {
            // 1. Primero obtenemos los detalles actuales de la orden (para asegurar precisión)
            const resDetalles = await fetch(`http://localhost:5000/api/ordenes/${orden.id}/detalles`);
            const detallesOrden = await resDetalles.json();

            if (!detallesOrden || detallesOrden.length === 0) {
                alert("No se puede facturar una orden sin productos.");
                return;
            }

            // 2. Preparamos el objeto de la factura según tus campos
            // ... dentro de handleProcesar
// Dentro de handleProcesar en Facturacion.jsx
const nuevaFactura = {
    id_usuario: orden.id_usuario, // Asegúrate que tu SELECT de ordenes traiga id_usuario
    total: orden.total,
    total_pagado: orden.total,
    orden_id: orden.id,
    detalles: detallesOrden.map(d => ({
        producto_id: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.cantidad * d.precio_unitario
    }))
};      // 3. Enviamos la petición al endpoint de facturación
            const resFactura = await fetch('http://localhost:5000/api/facturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaFactura)
            });

            if (resFactura.ok) {
                alert(`Factura generada exitosamente para el cliente ${orden.nombre}`);
                // Refrescar los datos
                await fetchOrdenes();
                setActiveTab('facturas'); // Movemos al usuario a la vista de facturas
            } else {
                const errorData = await resFactura.json();
                throw new Error(errorData.message || "Error al crear la factura");
            }

        } catch (error) {
            console.error("Error en el proceso:", error);
            alert("Hubo un fallo: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    // Modificar la cantidad de un detalle de orden
    const handleModificarDetalle = async (detalleId) => {
        const nuevaCantidadStr = window.prompt('Ingrese la nueva cantidad (mínimo 1):', '1');
        const nuevaCantidad = parseInt(nuevaCantidadStr, 10);
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
            return; // No procede si es inválido
        }
        try {
            const res = await fetch(`http://localhost:5000/api/ordenes/detalle/${detalleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            });
            if (!res.ok) {
                const err = await res.json();
                console.error('Error al modificar detalle:', err);
                return;
            }
            // Si la modal está abierta, refrescar los detalles de la orden actual
            if (selectedOrden) {
                await handleVerDetalles(selectedOrden);
            }
        } catch (error) {
            console.error('Error al modificar detalle de orden:', error);
        }
    };

    const getStatusBadge = (estatus_id) => {
        switch (estatus_id) {
            case 1:
                return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>;
            case 2:
                return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">En Proceso</span>;
            case 3:
                return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pagado</span>;
            case 4:
                return <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cancelado</span>;
            case 5:
                return <span className="bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Finalizado</span>;
            default:
                return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Desconocido</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <div className="h-20"></div>

            <header className="py-14 px-6 border-b border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Módulo Administrativo</span>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
                            FACTURA<span className="text-blue-600">CIÓN</span>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4">
                    <button
                        onClick={() => setActiveTab('ordenes')}
                        className={`text-sm font-black uppercase tracking-widest transition-colors pb-4 -mb-4 border-b-2 ${activeTab === 'ordenes' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Órdenes de Compra
                    </button>
                    <button
                        onClick={() => setActiveTab('facturas')}
                        className={`text-sm font-black uppercase tracking-widest transition-colors pb-4 -mb-4 border-b-2 ${activeTab === 'facturas' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Facturas
                    </button>
                </div>

                {activeTab === 'ordenes' && (
                    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Orden</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                               <tbody>
    {loading ? (
        <tr>
            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Cargando órdenes...</td>
        </tr>
    ) : ordenes.length === 0 ? (
        <tr>
            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No hay órdenes registradas.</td>
        </tr>
    ) : (
        ordenes.map(orden => (
            <tr key={orden.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">#{orden.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{orden.nombre} {orden.apellido}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(orden.fecha_orden).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">${Number(orden.total).toFixed(2)}</td>
                <td className="px-6 py-4">{getStatusBadge(orden.estatus_id)}</td>
                
                {/* CELDA DE ACCIONES CORREGIDA */}
                <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => handleVerDetalles(orden)}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-all h-[32px] border border-slate-200"
                        >
                            Detalles
                        </button>

                        {orden.estatus_id === 1 && (
                            <button
                                disabled={loading}
                                onClick={() => handleProcesar(orden)}
                                className={`
                                    flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all duration-200 h-[32px]
                                    ${loading 
                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100' 
                                        : 'bg-slate-700 text-white hover:bg-slate-800 active:scale-95 shadow-sm border border-slate-600'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    'Procesar'
                                )}
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        ))
    )}
</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'facturas' && (
                    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Factura</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Venta</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pagado</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                            <tbody>
    {loading ? (
        <tr>
            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                Cargando facturas...
            </td>
        </tr>
    ) : facturas.length === 0 ? (
        <tr>
            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                No hay facturas generadas.
            </td>
        </tr>
    ) : (
        facturas.map((factura) => (
            <tr key={factura.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    #{factura.id}
                </td>
                
                {/* MOSTRAR NOMBRE DEL CLIENTE/USUARIO */}
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {factura.nombre_cliente || "Usuario no encontrado"}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(factura.fecha_venta).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    ${Number(factura.total).toFixed(2)}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${Number(factura.total_pagado).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                    <button
                        onClick={() => handleVerDetallesFactura(factura)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors border border-slate-200"
                    >
                        Detalles
                    </button>
                </td>
            </tr>
        ))
    )}
</tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Detalles */}
            {isModalOpen && selectedOrden && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-slate-900">Detalles de la Orden #{selectedOrden.id}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mt-1">
                                    Cliente: {selectedOrden.nombre} {selectedOrden.apellido}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {loadingDetalles ? (
                                <p className="text-center text-slate-400 italic py-12">Cargando detalles...</p>
                            ) : detalles.length === 0 ? (
                                <p className="text-center text-slate-400 italic py-12">No hay detalles para esta orden.</p>
                            ) : (
                                <div className="space-y-4">
                                    {detalles.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 items-center">
                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 p-2 border border-slate-100">
                                                <img
                                                    src={`http://localhost:5000/${item.imagen?.replace(/\\/g, '/')}`}
                                                    alt={item.nombre}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22/%3E%3C/svg%3E'; }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{item.nombre}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID Producto: {item.id_producto}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleModificarDetalle(item.id)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors border border-slate-200"
                                                >
                                                    Modificar
                                                </button>
                                                <div className="text-right">
                                                    <div className="text-slate-500 text-xs font-bold mb-1">{item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}</div>
                                                    <div className="text-blue-600 font-black">${Number(item.subtotal || (item.cantidad * item.precio_unitario)).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Orden</span>
                            <span className="text-2xl font-black italic text-slate-900">${Number(selectedOrden.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalles de Factura */}
            {isFacturaModalOpen && selectedFactura && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFacturaModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-slate-900">Detalles Factura #{selectedFactura.id}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mt-1">
                                    Cliente: {selectedFactura.nombre_cliente || `ID ${selectedFactura.id_usuario}`}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsFacturaModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {loadingFacturaDetalles ? (
                                <p className="text-center text-slate-400 italic py-12">Cargando detalles...</p>
                            ) : facturaDetalles.length === 0 ? (
                                <p className="text-center text-slate-400 italic py-12">No hay detalles para esta factura.</p>
                            ) : (
                                <div className="space-y-4">
                                    {facturaDetalles.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 items-center">
                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 p-2 border border-slate-100">
                                                <img
                                                    src={`http://localhost:5000/${item.imagen?.replace(/\\/g, '/')}`}
                                                    alt={item.nombre_producto}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22/%3E%3C/svg%3E'; }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{item.nombre_producto}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID Producto: {item.producto_id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <div className="text-slate-500 text-xs font-bold mb-1">{item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}</div>
                                                    <div className="text-blue-600 font-black">${Number(item.subtotal || (item.cantidad * item.precio_unitario)).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Factura</span>
                            <span className="text-2xl font-black italic text-slate-900">${Number(selectedFactura.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacturacionView;
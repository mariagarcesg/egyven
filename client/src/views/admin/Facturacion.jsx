import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import { useCart } from '../../context/CartContext.jsx';
import useTasaCambio from '../../hooks/useTasaCambio.js';

const FacturacionView = () => {
    const getInitialTab = () => {
        try {
            const t = localStorage.getItem('facturacion.activeTab');
            return t || 'ordenes';
        } catch (e) {
            return 'ordenes';
        }
    };
    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [ordenes, setOrdenes] = useState([]);
    const [facturas, setFacturas] = useState([]);
    const [tasas, setTasas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTasaModalOpen, setIsTasaModalOpen] = useState(false);
    const [tasaForm, setTasaForm] = useState({ moneda_origen: 'USD', moneda_destino: 'VES', tasa_cambio: '' });

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
    const [localCantidades, setLocalCantidades] = useState({});
    const [stockMap, setStockMap] = useState({});
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [orderToConfirm, setOrderToConfirm] = useState(null);
    const { showNotification } = useCart();
    const tasa = useTasaCambio();
    // Pago modal state
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [metodos, setMetodos] = useState([]);
    const [pagoFactura, setPagoFactura] = useState(null);
    const [pagoMonto, setPagoMonto] = useState('');
    const [pagoReferencia, setPagoReferencia] = useState('');
    const [pagoMetodoId, setPagoMetodoId] = useState(null);
    const [pagoFecha, setPagoFecha] = useState('');
    const [pagoMoneda, setPagoMoneda] = useState('USD');
    const [pendienteCalculado, setPendienteCalculado] = useState(null);
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [facturaToFinalize, setFacturaToFinalize] = useState(null);

    // Facturas sub-tab state
    const [facturaSubTab, setFacturaSubTab] = useState(() => {
        try { return localStorage.getItem('facturacion.facturaSubTab') || 'online'; } catch (e) { return 'online'; }
    });
    const [facturasCliente, setFacturasCliente] = useState([]);
    const [isDetalleFacturaClienteOpen, setIsDetalleFacturaClienteOpen] = useState(false);
    const [selectedFacturaCliente, setSelectedFacturaCliente] = useState(null);
    const [detallesFacturaCliente, setDetallesFacturaCliente] = useState([]);
    const [loadingDetallesFactura, setLoadingDetallesFactura] = useState(false);

    // Clientes tab state
    const [clientes, setClientes] = useState([]);
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clienteForm, setClienteForm] = useState({ nombre: '', documento_identidad: '', telefono: '', direccion: '' });

    // Orden Tienda state
    const [isOrdenTiendaModalOpen, setIsOrdenTiendaModalOpen] = useState(false);
    const [productosLista, setProductosLista] = useState([]);
    const [ordenItems, setOrdenItems] = useState([{ producto_id: '', precio: 0, cantidad: 1 }]);
    const [ordenClienteId, setOrdenClienteId] = useState('');
    const [clienteModalContext, setClienteModalContext] = useState('clientes');
    const [ordenesCliente, setOrdenesCliente] = useState([]);
    const [editOrdenId, setEditOrdenId] = useState(null);

    useEffect(() => {
        if (activeTab === 'ordenes') {
            fetchOrdenes();
        } else if (activeTab === 'facturas') {
            fetchFacturas();
        } else if (activeTab === 'tasas') {
            fetchTasas();
        } else if (activeTab === 'clientes') {
            fetchClientes();
        } else if (activeTab === 'ordenTienda') {
            fetchOrdenesCliente();
        }
    }, [activeTab]);

    // persist active tab so it survives page refresh
    useEffect(() => {
        try { localStorage.setItem('facturacion.activeTab', activeTab); } catch (e) {}
    }, [activeTab]);

    useEffect(() => {
        try { localStorage.setItem('facturacion.facturaSubTab', facturaSubTab); } catch (e) {}
    }, [facturaSubTab]);

    useEffect(() => {
        // precargar métodos de pago para el modal
        const fetchMetodos = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/facturas/metodos');
                if (!res.ok) return setMetodos([]);
                const data = await res.json();
                setMetodos(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error al obtener metodos de pago:', err);
                setMetodos([]);
            }
        };
        fetchMetodos();
    }, []);

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
            const [resOnline, resTienda] = await Promise.all([
                fetch('http://localhost:5000/api/facturas'),
                fetch('http://localhost:5000/api/orden-cliente/facturas')
            ]);
            const dataOnline = await resOnline.json();
            const dataTienda = await resTienda.json();
            setFacturas(Array.isArray(dataOnline) ? dataOnline : []);
            setFacturasCliente(Array.isArray(dataTienda) ? dataTienda : []);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasas = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/tasas');
            const data = await res.json();
            setTasas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener tasas de cambio:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/clientes');
            const data = await res.json();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdenesCliente = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/orden-cliente');
            const data = await res.json();
            setOrdenesCliente(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener órdenes de tienda:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirOrdenTienda = async () => {
        try {
            const fetches = [];
            if (productosLista.length === 0) fetches.push(fetch('http://localhost:5000/api/productos').then(r => r.json()));
            else fetches.push(Promise.resolve(null));
            if (clientes.length === 0) fetches.push(fetch('http://localhost:5000/api/clientes').then(r => r.json()));
            else fetches.push(Promise.resolve(null));
            const [prods, clts] = await Promise.all(fetches);
            if (prods) setProductosLista(Array.isArray(prods) ? prods : []);
            if (clts) setClientes(Array.isArray(clts) ? clts : []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
        }
        setEditOrdenId(null);
        setOrdenClienteId('');
        setOrdenItems([{ producto_id: '', precio: 0, cantidad: 1 }]);
        setIsOrdenTiendaModalOpen(true);
    };

    const handleEditarOrden = async (orden) => {
        try {
            const fetches = [];
            if (productosLista.length === 0) fetches.push(fetch('http://localhost:5000/api/productos').then(r => r.json()));
            else fetches.push(Promise.resolve(null));
            if (clientes.length === 0) fetches.push(fetch('http://localhost:5000/api/clientes').then(r => r.json()));
            else fetches.push(Promise.resolve(null));
            fetches.push(fetch(`http://localhost:5000/api/orden-cliente/${orden.id}/detalles`).then(r => r.json()));
            const [prods, clts, detalles] = await Promise.all(fetches);
            if (prods) setProductosLista(Array.isArray(prods) ? prods : []);
            if (clts) setClientes(Array.isArray(clts) ? clts : []);
            const items = (Array.isArray(detalles) ? detalles : []).map(d => ({
                producto_id: String(d.producto_id),
                precio: Number(d.precio_unitario),
                cantidad: d.cantidad
            }));
            setEditOrdenId(orden.id);
            setOrdenClienteId(String(orden.cliente_id));
            setOrdenItems(items.length > 0 ? items : [{ producto_id: '', precio: 0, cantidad: 1 }]);
            setIsOrdenTiendaModalOpen(true);
        } catch (err) {
            showNotification('Error al cargar la orden: ' + (err.message || ''), 'error');
        }
    };

    const handleOrdenProductoChange = (index, productoId) => {
        const prod = productosLista.find(p => String(p.id) === String(productoId));
        setOrdenItems(prev => prev.map((item, i) =>
            i === index
                ? { ...item, producto_id: productoId, precio: prod ? Number(prod.precio_venta) : 0 }
                : item
        ));
    };

    const handleOrdenCantidadChange = (index, value) => {
        setOrdenItems(prev => prev.map((item, i) =>
            i === index ? { ...item, cantidad: Math.max(1, Number(value) || 1) } : item
        ));
    };

    const handleAgregarItem = () => {
        setOrdenItems(prev => [...prev, { producto_id: '', precio: 0, cantidad: 1 }]);
    };

    const handleEliminarItem = (index) => {
        setOrdenItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleVerDetallesFacturaCliente = async (factura) => {
        setSelectedFacturaCliente(factura);
        setDetallesFacturaCliente([]);
        setIsDetalleFacturaClienteOpen(true);
        setLoadingDetallesFactura(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orden-cliente/facturas/${factura.id}/detalles`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener detalles');
            setDetallesFacturaCliente(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al obtener detalles:', err);
            showNotification('Error al cargar detalles: ' + (err.message || ''), 'error');
            setDetallesFacturaCliente([]);
        } finally {
            setLoadingDetallesFactura(false);
        }
    };

    const handleProcesarOrdenCliente = async (orden) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orden-cliente/${orden.id}/procesar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showNotification(`Orden #${orden.id} procesada correctamente`, 'success');
                await fetchOrdenesCliente();
            } else {
                const err = await res.json().catch(() => ({ error: 'Error al procesar' }));
                throw new Error(err.error || 'Error al procesar');
            }
        } catch (err) {
            showNotification('Error: ' + (err.message || ''), 'error');
        }
    };

    const handleGenerarOrden = async () => {
        if (!ordenClienteId) return showNotification('Seleccione un cliente', 'error');
        const itemsInvalidos = ordenItems.some(i => !i.producto_id || i.cantidad < 1);
        if (itemsInvalidos) return showNotification('Complete todos los productos antes de generar', 'error');

        const isEdit = editOrdenId !== null;
        const payload = {
            cliente_id: ordenClienteId,
            items: ordenItems.map(item => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
            }))
        };

        try {
            const res = await fetch(
                isEdit ? `http://localhost:5000/api/orden-cliente/${editOrdenId}` : 'http://localhost:5000/api/orden-cliente',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            if (res.ok) {
                const data = await res.json();
                showNotification(isEdit ? `Orden #${editOrdenId} actualizada` : `Orden #${data.orden_id} generada exitosamente`, 'success');
                setIsOrdenTiendaModalOpen(false);
                await fetchOrdenesCliente();
            } else {
                const err = await res.json().catch(() => ({ error: 'Error al guardar la orden' }));
                throw new Error(err.error || 'Error al guardar la orden');
            }
        } catch (err) {
            showNotification('Error: ' + (err.message || ''), 'error');
        }
    };

    const handleEditarCliente = (cliente) => {
        setSelectedCliente(cliente);
        setClienteForm({
            nombre: cliente.nombre || '',
            documento_identidad: cliente.documento_identidad || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || ''
        });
        setIsClienteModalOpen(true);
    };

    const handleNuevoCliente = (context = 'clientes') => {
        setClienteModalContext(context);
        setSelectedCliente(null);
        setClienteForm({ nombre: '', documento_identidad: '', telefono: '', direccion: '' });
        setIsClienteModalOpen(true);
    };

    const handleGuardarCliente = async () => {
        try {
            const isEdit = selectedCliente !== null;
            const url = isEdit
                ? `http://localhost:5000/api/clientes/${selectedCliente.id}`
                : 'http://localhost:5000/api/clientes';
            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteForm)
            });
            if (res.ok) {
                const data = await res.json();
                showNotification(isEdit ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente', 'success');
                setIsClienteModalOpen(false);
                await fetchClientes();
                if (!isEdit && clienteModalContext === 'ordenTienda' && data.cliente) {
                    setOrdenClienteId(String(data.cliente.id));
                }
            } else {
                const err = await res.json().catch(() => ({ error: 'Error al guardar' }));
                throw new Error(err.error || 'Error al guardar');
            }
        } catch (err) {
            showNotification('Error: ' + (err.message || ''), 'error');
        }
    };

    const handleVerDetalles = async (orden) => {
        setSelectedOrden(orden);
        setIsModalOpen(true);
        setLoadingDetalles(true);
        try {
            const [resDetalles, resProductos] = await Promise.all([
                fetch(`http://localhost:5000/api/ordenes/${orden.id}/detalles`),
                fetch('http://localhost:5000/api/productos')
            ]);
            const items = await resDetalles.json();
            const prods = await resProductos.json();
            const data = Array.isArray(items) ? items : [];
            setDetalles(data);
            const cantObj = {};
            data.forEach(d => { cantObj[d.id] = d.cantidad; });
            setLocalCantidades(cantObj);
            const sMap = {};
            (Array.isArray(prods) ? prods : []).forEach(p => { sMap[p.id] = p.stock_actual; });
            setStockMap(sMap);
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

    // Abrir modal de confirmación para convertir orden en factura
    const handleProcesar = (orden) => {
        setOrderToConfirm(orden);
        setConfirmModalOpen(true);
    };

    // Ejecutar la conversión (llamada al servidor)
    const performProcesar = async (orden) => {
        console.log("CONTENIDO DE LA ORDEN SELECCIONADA:", orden);
        setLoading(true);
        try {
            // 1. Primero obtenemos los detalles actuales de la orden (para asegurar precisión)
            const resDetalles = await fetch(`http://localhost:5000/api/ordenes/${orden.id}/detalles`);
            const detallesOrden = await resDetalles.json();

            if (!detallesOrden || detallesOrden.length === 0) {
                showNotification('No se puede facturar una orden sin productos.', 'error');
                return;
            }

            // 2. Preparamos el objeto de la factura según tus campos
            const nuevaFactura = {
                id_usuario: orden.id_usuario, // Asegúrate que tu SELECT de ordenes traiga id_usuario
                total: orden.total,
                total_pagado: 0, // La factura inicia con 0 pagado hasta registrar pagos
                orden_id: orden.id,
                detalles: detallesOrden.map(d => ({
                    producto_id: d.id_producto,
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario,
                    subtotal: d.cantidad * d.precio_unitario
                }))
            };

            // 3. Enviamos la petición al endpoint de facturación
            const resFactura = await fetch('http://localhost:5000/api/facturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaFactura)
            });

            if (resFactura.ok) {
                showNotification(`Factura generada exitosamente para el cliente ${orden.nombre}`, 'success');
                // Refrescar los datos
                await fetchOrdenes();
                setActiveTab('facturas'); // Movemos al usuario a la vista de facturas
            } else {
                const errorData = await resFactura.json();
                throw new Error(errorData.message || "Error al crear la factura");
            }

        } catch (error) {
            console.error("Error en el proceso:", error);
            showNotification('Hubo un fallo: ' + (error.message || ''), 'error');
        } finally {
            setLoading(false);
        }
    };
    const handleCantidadChange = async (detalleId, productoId, nuevaCantidad) => {
        const stock = stockMap[productoId] ?? Infinity;
        const clamped = Math.min(Math.max(1, nuevaCantidad), stock);
        setLocalCantidades(prev => ({ ...prev, [detalleId]: clamped }));
        try {
            await fetch(`http://localhost:5000/api/ordenes/detalle/${detalleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: clamped })
            });
            setDetalles(prev => prev.map(d => d.id === detalleId ? { ...d, cantidad: clamped, subtotal: clamped * d.precio_unitario } : d));
        } catch (error) {
            console.error('Error al modificar detalle:', error);
        }
    };

    const handleImprimirFactura = async (factura) => {
        try {
            const [resUsuario, resDetalles] = await Promise.all([
                fetch(`http://localhost:5000/api/usuarios/${factura.id_usuario}`),
                fetch(`http://localhost:5000/api/facturas/${factura.id}/detalles`)
            ]);
            const cliente = await resUsuario.json();
            const detalles = await resDetalles.json();

            const filas = (Array.isArray(detalles) ? detalles : []).map(d => `
                <tr>
                    <td>${d.nombre_producto || '-'}</td>
                    <td style="text-align:center">${d.cantidad}</td>
                    <td style="text-align:right">$${Number(d.precio_unitario).toFixed(2)}</td>
                    <td style="text-align:right">$${Number(d.subtotal || d.cantidad * d.precio_unitario).toFixed(2)}</td>
                </tr>
            `).join('');

            const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"/>
    <title>Factura #${factura.id}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; margin: 40px; }
        h1 { font-size: 22px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #2563eb; padding-bottom: 16px; }
        .brand span { color: #2563eb; }
        .meta { text-align: right; font-size: 11px; color: #64748b; }
        .meta strong { display: block; font-size: 14px; color: #1e293b; }
        .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin: 20px 0 6px; }
        .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
        .client-grid div { font-size: 12px; } .client-grid span { color: #64748b; font-size: 10px; display: block; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead tr { background: #f1f5f9; }
        th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        .footer { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; text-align: right; }
        .footer .total { font-size: 20px; font-weight: 900; color: #2563eb; }
        .footer .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand"><h1>TECNO<span>VA</span></h1><div style="font-size:10px;color:#64748b;margin-top:4px">Comprobante de Pago</div></div>
        <div class="meta"><strong>Factura #${factura.id}</strong><span>Fecha: ${new Date(factura.fecha_venta).toLocaleDateString('es-VE')}</span></div>
    </div>

    <div class="section-title">Datos del Cliente</div>
    <div class="client-grid">
        <div><span>Cédula / RIF</span>${cliente.cedula_rif || '-'}</div>
        <div><span>Nombre</span>${cliente.nombre || '-'} ${cliente.apellido || ''}</div>
        <div><span>Teléfono</span>${cliente.telefono || '-'}</div>
        <div><span>Dirección</span>${cliente.direccion || '-'}</div>
    </div>

    <div class="section-title">Detalle de Productos</div>
    <table>
        <thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>${filas}</tbody>
    </table>

    <div class="footer">
        <div class="label">Total Factura</div>
        <div class="total">$${Number(factura.total).toFixed(2)}</div>
    </div>
    <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();

            const res = await fetch(`http://localhost:5000/api/facturas/${factura.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estatus_id: 5 })
            });
            if (res.ok) {
                await fetchFacturas();
            }
        } catch (err) {
            console.error('Error al generar PDF:', err);
            showNotification('Error al generar la factura', 'error');
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
                    <button
                        onClick={() => setActiveTab('tasas')}
                        className={`text-sm font-black uppercase tracking-widest transition-colors pb-4 -mb-4 border-b-2 ${activeTab === 'tasas' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Tasas
                    </button>
                    <button
                        onClick={() => setActiveTab('clientes')}
                        className={`text-sm font-black uppercase tracking-widest transition-colors pb-4 -mb-4 border-b-2 ${activeTab === 'clientes' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('ordenTienda')}
                        className={`text-sm font-black uppercase tracking-widest transition-colors pb-4 -mb-4 border-b-2 ${activeTab === 'ordenTienda' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Orden Tienda
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
                <td className="px-6 py-4 text-sm font-bold text-slate-900 bg-blue-200">{orden.nombre} {orden.apellido}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(orden.fecha_orden).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 bg-green-100">
                        <div>${Number(orden.total).toFixed(2)}</div>
                        {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(orden.total) * tasa).toFixed(2)}</div>}
                    </td>
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
                    <div>
                        {/* Sub-tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setFacturaSubTab('online')}
                                className={`text-xs font-black uppercase tracking-widest px-5 py-2 rounded-xl border-2 transition-colors ${facturaSubTab === 'online' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                            >
                                Online
                            </button>
                            <button
                                onClick={() => setFacturaSubTab('tienda')}
                                className={`text-xs font-black uppercase tracking-widest px-5 py-2 rounded-xl border-2 transition-colors ${facturaSubTab === 'tienda' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'}`}
                            >
                                Tienda
                            </button>
                        </div>

                    {facturaSubTab === 'online' && (
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
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendiente</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
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
                <td className="px-6 py-4 text-sm font-bold text-slate-700 bg-slate-100">
                    #{factura.id}
                </td>

                {/* MOSTRAR NOMBRE DEL CLIENTE/USUARIO */}
                <td className="px-6 py-4 text-sm font-bold text-slate-900 bg-slate-100">
                    {factura.nombre_cliente || "Usuario no encontrado"}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(factura.fecha_venta).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    <div>${Number(factura.total).toFixed(2)}</div>
                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(factura.total) * tasa).toFixed(2)}</div>}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-green-600 bg-green-100">
                    <div>${Number(factura.total_pagado).toFixed(2)}</div>
                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(factura.total_pagado) * tasa).toFixed(2)}</div>}
                </td>
                <td className={`px-6 py-4 text-sm font-bold ${(Number(factura.total) - Number(factura.total_pagado)) === 0 ? 'text-slate-400 bg-slate-100' : 'text-orange-600 bg-orange-50'}`}>
                    <div>${(Number(factura.total) - Number(factura.total_pagado)).toFixed(2)}</div>
                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {((Number(factura.total) - Number(factura.total_pagado)) * tasa).toFixed(2)}</div>}
                </td>
                <td className="px-6 py-4">{getStatusBadge(factura.estatus_id)}</td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => handleVerDetallesFactura(factura)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors border border-slate-200"
                        >
                            Detalles
                        </button>

                        <button
                            disabled={factura.estatus_id === 5}
                            onClick={() => {
                                if (factura.estatus_id === 5) return;
                                if (factura.estatus_id === 3) {
                                    handleImprimirFactura(factura);
                                    return;
                                }
                                setPagoFactura(factura);
                                setPagoMonto('');
                                setPagoReferencia('');
                                setPagoMetodoId(null);
                                setPagoMoneda('USD');
                                setPendienteCalculado(null);
                                setIsPagoModalOpen(true);
                            }}
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors border ${factura.estatus_id === 5 ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : factura.estatus_id === 3 ? 'text-white bg-blue-600 hover:bg-blue-700 border-blue-700' : 'text-white bg-green-600 hover:bg-green-700 border-green-700'}`}
                            title={factura.estatus_id === 5 ? 'Factura finalizada' : factura.estatus_id === 3 ? 'Imprimir factura' : 'Registrar pago'}
                        >
                            {factura.estatus_id === 3 ? 'Imprimir' : 'Pago'}
                        </button>
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

                    {facturaSubTab === 'tienda' && (
                        <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('http://localhost:5000/api/orden-cliente/facturas/reparar', { method: 'POST' });
                                        const data = await res.json();
                                        showNotification(data.message, res.ok ? 'success' : 'error');
                                        if (res.ok && data.reparadas > 0) await fetchFacturas();
                                    } catch (err) {
                                        showNotification('Error al reparar: ' + (err.message || ''), 'error');
                                    }
                                }}
                                className="text-xs font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                            >
                                Reparar Detalles
                            </button>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-[2rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-blue-100 border-b border-blue-200">
                                            <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Nro Factura</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Cliente</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-blue-400 italic">Cargando facturas...</td></tr>
                                        ) : facturasCliente.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-blue-400 italic">No hay facturas de tienda registradas.</td></tr>
                                        ) : (
                                            facturasCliente.map(f => (
                                                <tr key={f.id} className="border-b border-blue-100 hover:bg-blue-100/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-blue-800">#{f.numero_factura}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{f.nombre_cliente}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-blue-700">
                                                        <div>${Number(f.total).toFixed(2)}</div>
                                                        {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(f.total) * tasa).toFixed(2)}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {f.estatus_pago
                                                            ? <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{f.estatus_pago}</span>
                                                            : <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleVerDetallesFacturaCliente(f)}
                                                                className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                                                            >
                                                                Detalles
                                                            </button>
                                                            <button
                                                                className="text-[10px] font-black uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Pago
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </div>
                    )}
                    </div>
                )}

                {activeTab === 'tasas' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setTasaForm({ moneda_origen: 'USD', moneda_destino: 'VES', tasa_cambio: '' });
                                    setIsTasaModalOpen(true);
                                }}
                                className="text-sm font-black uppercase tracking-widest bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Actualizar
                            </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Moneda Origen</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Moneda Destino</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasa</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Cargando tasas...</td>
                                            </tr>
                                        ) : tasas.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No hay tasas de cambio registradas.</td>
                                            </tr>
                                        ) : (
                                            tasas.map((tasa, index) => (
                                                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{tasa.moneda_origen}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{tasa.moneda_destino}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">
                                                    <span className="flex items-center gap-1">
                                                        {Number(tasa.tasa_cambio).toFixed(2)}
                                                        {index > 0 && Number(tasa.tasa_cambio) > Number(tasas[index - 1].tasa_cambio) && (
                                                            <span className="text-green-500 text-base leading-none">↑</span>
                                                        )}
                                                        {index > 0 && Number(tasa.tasa_cambio) < Number(tasas[index - 1].tasa_cambio) && (
                                                            <span className="text-red-500 text-base leading-none">↓</span>
                                                        )}
                                                    </span>
                                                </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(tasa.fecha_registro).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'clientes' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleNuevoCliente}
                                className="text-sm font-black uppercase tracking-widest bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Nuevo Cliente
                            </button>
                        </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Documento</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Teléfono</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dirección</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Cargando clientes...</td>
                                        </tr>
                                    ) : clientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No hay clientes registrados.</td>
                                        </tr>
                                    ) : (
                                        clientes.map(cliente => (
                                            <tr key={cliente.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">{cliente.nombre}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{cliente.documento_identidad || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{cliente.telefono || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{cliente.direccion || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleEditarCliente(cliente)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'ordenTienda' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleAbrirOrdenTienda}
                                className="text-sm font-black uppercase tracking-widest bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Generar Orden
                            </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo Venta</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">Cargando órdenes...</td>
                                            </tr>
                                        ) : ordenesCliente.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No hay órdenes de tienda registradas.</td>
                                            </tr>
                                        ) : (
                                            ordenesCliente.map(orden => (
                                                <tr key={orden.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">#{orden.id}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{orden.nombre_cliente}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{orden.tipo_venta}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">
                                                        <div>${Number(orden.total).toFixed(2)}</div>
                                                        {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(orden.total) * tasa).toFixed(2)}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {orden.estatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {new Date(orden.fecha_creacion).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditarOrden(orden)}
                                                                className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleProcesarOrdenCliente(orden)}
                                                                disabled={orden.estatus === 'Procesada'}
                                                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${orden.estatus === 'Procesada' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-white bg-slate-700 hover:bg-slate-800'}`}
                                                            >
                                                                Procesar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Pago */}
                {isPagoModalOpen && pagoFactura && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPagoModalOpen(false)}></div>
                        <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-md z-10 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black">Registrar Pago - Factura #{pagoFactura.id}</h3>
                                <button onClick={() => setIsPagoModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Número Factura</label>
                                    <div className="mt-2 text-sm font-bold">#{pagoFactura.id}</div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Moneda</label>
                                    <select value={pagoMoneda} onChange={e => setPagoMoneda(e.target.value)} className="w-full mt-2 p-2 border rounded-md">
                                        <option value="USD">USD</option>
                                        <option value="VES">VES</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Método de Pago</label>
                                    <select value={pagoMetodoId || ''} onChange={e => setPagoMetodoId(e.target.value)} className="w-full mt-2 p-2 border rounded-md">
                                        <option value="">-- Seleccione --</option>
                                        {metodos.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre || m.descripcion || `#${m.id}`}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Monto</label>
                                    <input type="number" step="0.01" value={pagoMonto} onChange={e => setPagoMonto(e.target.value)} className="w-full mt-2 p-2 border rounded-md" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Referencia</label>
                                    <input type="text" value={pagoReferencia} onChange={e => setPagoReferencia(e.target.value)} className="w-full mt-2 p-2 border rounded-md" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Fecha de Pago</label>
                                    <input type="date" value={pagoFecha} onChange={e => setPagoFecha(e.target.value)} className="w-full mt-2 p-2 border rounded-md" />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={async () => {
                                            if (!pagoMetodoId) return showNotification('Seleccione un método de pago', 'error');
                                            const montoNum = Number(pagoMonto);
                                            if (!montoNum || montoNum <= 0) return showNotification('Ingrese un monto válido', 'error');

                                            let montoAGuardar;
                                            if (pagoMoneda === 'VES' && tasa) {
                                                if (pendienteCalculado === null) return showNotification('Presione Calcular antes de aplicar el pago en VES', 'error');
                                                montoAGuardar = Number(pagoFactura.total) - pendienteCalculado;
                                            } else {
                                                montoAGuardar = montoNum;
                                            }

                                            try {
                                                const payload = {
                                                    factura_id: pagoFactura.id,
                                                    id_metodo: pagoMetodoId,
                                                    monto: montoAGuardar,
                                                    referencia: pagoReferencia,
                                                    fecha_pago: pagoFecha || undefined
                                                };

                                                const res = await fetch('http://localhost:5000/api/facturas/pagos', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                });

                                                if (res.ok) {
                                                    showNotification('Pago registrado correctamente', 'success');
                                                    setIsPagoModalOpen(false);
                                                    await fetchFacturas();
                                                } else {
                                                    const err = await res.json().catch(() => ({ message: 'Error al guardar pago' }));
                                                    throw new Error(err.message || 'Error al guardar pago');
                                                }
                                            } catch (err) {
                                                console.error('Error al aplicar pago:', err);
                                                showNotification('Error al aplicar pago: ' + (err.message || ''), 'error');
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white font-black py-2 rounded-md"
                                    >Aplicar</button>
                                </div>
                            </div>
                            <div className="p-4 border-t bg-slate-50">
                                <div className="text-sm text-slate-600 text-right">Total factura: <span className="font-black text-slate-800">${Number(pagoFactura.total).toFixed(2)}</span>{tasa && <span className="text-xs text-slate-400 ml-1">/ Bs. {(Number(pagoFactura.total) * tasa).toFixed(2)}</span>}</div>
                                <div className="text-sm text-slate-600 text-right">Pagado: <span className="font-black text-green-600">${Number(pagoFactura.total_pagado).toFixed(2)}</span>{tasa && <span className="text-xs text-slate-400 ml-1">/ Bs. {(Number(pagoFactura.total_pagado) * tasa).toFixed(2)}</span>}</div>
                                <div className="text-sm text-right">
                                    Pendiente:{' '}
                                    {pendienteCalculado !== null
                                        ? <span className={`font-black ${pendienteCalculado <= 0 ? 'text-green-600' : 'text-blue-600'}`}>${pendienteCalculado.toFixed(2)}</span>
                                        : <span className="font-black text-blue-600">${Number(pagoFactura.total - pagoFactura.total_pagado).toFixed(2)}</span>
                                    }
                                </div>
                                <button
                                    onClick={() => {
                                        const montoNum = Number(pagoMonto) || 0;
                                        const base = Number(pagoFactura.total) - Number(pagoFactura.total_pagado);
                                        const descuento = pagoMoneda === 'VES' && tasa ? montoNum / tasa : montoNum;
                                        setPendienteCalculado(base - descuento);
                                    }}
                                    className="mt-3 w-full border border-slate-300 text-slate-700 font-black text-[11px] uppercase tracking-widest py-2 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    Calcular
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal de Finalizar factura (cuando ya está pagada) */}
                {isFinalizeModalOpen && facturaToFinalize && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFinalizeModalOpen(false)}></div>
                        <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-md z-10 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black">Esta factura ya fue pagada</h3>
                                <button onClick={() => setIsFinalizeModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300">✕</button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-600">¿Desea marcar esta factura como <strong>Finalizada</strong>?</p>
                                <div className="mt-6 flex gap-3 justify-end">
                                    <button onClick={() => setIsFinalizeModalOpen(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
                                    <button onClick={async () => {
                                        try {
                                            const res = await fetch(`http://localhost:5000/api/facturas/${facturaToFinalize.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ estatus_id: 5 })
                                            });
                                            if (res.ok) {
                                                showNotification('Factura marcada como Finalizada', 'success');
                                                setIsFinalizeModalOpen(false);
                                                await fetchFacturas();
                                            } else {
                                                const err = await res.json().catch(() => ({ message: 'Error al actualizar factura' }));
                                                throw new Error(err.message || 'Error al actualizar factura');
                                            }
                                        } catch (err) {
                                            console.error('Error finalizando factura:', err);
                                            showNotification('Error al finalizar factura: ' + (err.message || ''), 'error');
                                        }
                                    }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Finalizar</button>
                                </div>
                            </div>
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
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => handleCantidadChange(item.id, item.id_producto, (localCantidades[item.id] ?? item.cantidad) - 1)}
                                                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors disabled:opacity-30"
                                                        disabled={(localCantidades[item.id] ?? item.cantidad) <= 1}
                                                    >−</button>
                                                    <span className="px-3 py-1 text-sm font-bold text-slate-800 min-w-[2rem] text-center border-x border-slate-200">
                                                        {localCantidades[item.id] ?? item.cantidad}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCantidadChange(item.id, item.id_producto, (localCantidades[item.id] ?? item.cantidad) + 1)}
                                                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors disabled:opacity-30"
                                                        disabled={(localCantidades[item.id] ?? item.cantidad) >= (stockMap[item.id_producto] ?? Infinity)}
                                                    >+</button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-slate-500 text-xs font-bold mb-1">x ${Number(item.precio_unitario).toFixed(2)}</div>
                                                    <div className="text-blue-600 font-black">${((localCantidades[item.id] ?? item.cantidad) * Number(item.precio_unitario)).toFixed(2)}</div>
                                                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {((localCantidades[item.id] ?? item.cantidad) * Number(item.precio_unitario) * tasa).toFixed(2)}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <button
                                onClick={async () => {
                                    setIsModalOpen(false);
                                    await fetchOrdenes();
                                    showNotification('Orden actualizada correctamente', 'success');
                                }}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm"
                            >
                                Guardar
                            </button>
                            <div className="text-right">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Total Orden</span>
                                <div className="text-2xl font-black italic text-slate-900">
                                    ${detalles.reduce((acc, d) => acc + (localCantidades[d.id] ?? d.cantidad) * Number(d.precio_unitario), 0).toFixed(2)}
                                </div>
                                {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(detalles.reduce((acc, d) => acc + (localCantidades[d.id] ?? d.cantidad) * Number(d.precio_unitario), 0) * tasa).toFixed(2)}</div>}
                            </div>
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
                                                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(item.subtotal || (item.cantidad * item.precio_unitario)) * tasa).toFixed(2)}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Factura</span>
                            <div className="text-right">
                                <div className="text-2xl font-black italic text-slate-900">${Number(selectedFactura.total).toFixed(2)}</div>
                                {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(selectedFactura.total) * tasa).toFixed(2)}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Nueva Tasa de Cambio */}
            {isTasaModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsTasaModalOpen(false)}></div>
                    <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-md z-10 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black">Nueva Tasa de Cambio</h3>
                            <button onClick={() => setIsTasaModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Moneda Origen</label>
                                <select
                                    value={tasaForm.moneda_origen}
                                    onChange={e => setTasaForm(f => ({ ...f, moneda_origen: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Moneda Destino</label>
                                <select
                                    value={tasaForm.moneda_destino}
                                    onChange={e => setTasaForm(f => ({ ...f, moneda_destino: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                >
                                    <option value="VES">VES</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Tasa</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tasaForm.tasa_cambio}
                                    onChange={e => setTasaForm(f => ({ ...f, tasa_cambio: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Fecha</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={new Date().toLocaleString()}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={async () => {
                                        if (!tasaForm.tasa_cambio || Number(tasaForm.tasa_cambio) <= 0) {
                                            return showNotification('Ingrese una tasa válida', 'error');
                                        }
                                        try {
                                            const today = new Date();
                                            const fecha = today.toISOString().slice(0, 19).replace('T', ' ');
                                            const res = await fetch('http://localhost:5000/api/tasas', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    moneda_origen: tasaForm.moneda_origen,
                                                    moneda_destino: tasaForm.moneda_destino,
                                                    tasa_cambio: Number(tasaForm.tasa_cambio),
                                                    fecha_registro: fecha
                                                })
                                            });
                                            if (res.ok) {
                                                showNotification('Tasa registrada correctamente', 'success');
                                                setIsTasaModalOpen(false);
                                                await fetchTasas();
                                            } else {
                                                const err = await res.json().catch(() => ({ message: 'Error al guardar' }));
                                                throw new Error(err.message);
                                            }
                                        } catch (err) {
                                            showNotification('Error: ' + (err.message || ''), 'error');
                                        }
                                    }}
                                    className="w-full bg-blue-600 text-white font-black py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalles Factura Cliente (Tienda) */}
            {isDetalleFacturaClienteOpen && selectedFacturaCliente && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetalleFacturaClienteOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-blue-50">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-slate-900">Factura #{selectedFacturaCliente.numero_factura}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mt-1">
                                    Cliente: {selectedFacturaCliente.nombre_cliente}
                                </span>
                            </div>
                            <button onClick={() => setIsDetalleFacturaClienteOpen(false)} className="w-10 h-10 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-700 transition-colors">✕</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {loadingDetallesFactura ? (
                                <p className="text-center text-slate-400 italic py-12">Cargando detalles...</p>
                            ) : detallesFacturaCliente.length === 0 ? (
                                <p className="text-center text-slate-400 italic py-12">No hay detalles para esta factura.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-blue-50 border-b border-blue-100">
                                            <th className="px-6 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest">Producto</th>
                                            <th className="px-6 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">Cantidad</th>
                                            <th className="px-6 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-right">Precio Unit.</th>
                                            <th className="px-6 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">Impuesto</th>
                                            <th className="px-6 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detallesFacturaCliente.map(d => (
                                            <tr key={d.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{d.nombre_producto}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 text-center">{d.cantidad}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 text-right">${Number(d.precio_unitario).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 text-center">{Number(d.impuesto_aplicado * 100).toFixed(0)}%</td>
                                                <td className="px-6 py-4 text-sm font-bold text-blue-700 text-right">
                                                    <div>${Number(d.subtotal).toFixed(2)}</div>
                                                    {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(d.subtotal) * tasa).toFixed(2)}</div>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-6 border-t border-blue-100 bg-blue-50 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500">Total Factura</span>
                            <div className="text-right">
                                <div className="text-2xl font-black text-slate-900">${Number(selectedFacturaCliente.total).toFixed(2)}</div>
                                {tasa && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(selectedFacturaCliente.total) * tasa).toFixed(2)}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Generar Orden Tienda */}
            {isOrdenTiendaModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOrdenTiendaModalOpen(false)}></div>
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-black uppercase tracking-tight">{editOrdenId ? `Editar Orden #${editOrdenId}` : 'Generar Orden de Tienda'}</h3>
                            <button onClick={() => setIsOrdenTiendaModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600">✕</button>
                        </div>

                        {/* Items */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-3">
                            {/* Cliente */}
                            <div className="mb-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Cliente</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={ordenClienteId}
                                        onChange={e => setOrdenClienteId(e.target.value)}
                                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Seleccionar cliente --</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleNuevoCliente('ordenTienda')}
                                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors font-black text-lg leading-none"
                                        title="Crear nuevo cliente"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Column headers */}
                            <div className="grid grid-cols-[1fr_80px_110px_110px_32px] gap-3 px-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Producto</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cant.</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Precio</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subtotal</span>
                                <span></span>
                            </div>

                            {ordenItems.map((item, index) => {
                                const subtotal = item.precio * item.cantidad;
                                return (
                                    <div key={index} className="grid grid-cols-[1fr_80px_110px_110px_32px] gap-3 items-center">
                                        {/* Producto */}
                                        <select
                                            value={item.producto_id}
                                            onChange={e => handleOrdenProductoChange(index, e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {productosLista.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>

                                        {/* Cantidad */}
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={e => handleOrdenCantidadChange(index, e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        {/* Precio */}
                                        <input
                                            type="text"
                                            readOnly
                                            value={`$${Number(item.precio).toFixed(2)}`}
                                            className="w-full p-2 border border-slate-100 rounded-lg text-sm text-right bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />

                                        {/* Subtotal */}
                                        <input
                                            type="text"
                                            readOnly
                                            value={`$${subtotal.toFixed(2)}`}
                                            className="w-full p-2 border border-slate-100 rounded-lg text-sm text-right bg-slate-50 font-bold text-blue-600 cursor-not-allowed"
                                        />

                                        {/* Eliminar */}
                                        <button
                                            onClick={() => handleEliminarItem(index)}
                                            disabled={ordenItems.length === 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                            title="Eliminar fila"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Botón agregar producto */}
                            <button
                                onClick={handleAgregarItem}
                                className="mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <span className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center font-black text-base leading-none">+</span>
                                Agregar producto
                            </button>
                        </div>

                        {/* Footer con total */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Total Orden</div>
                                <div className="text-2xl font-black text-slate-900">
                                    ${ordenItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0).toFixed(2)}
                                </div>
                            </div>
                            <button
                                onClick={handleGenerarOrden}
                                className="text-sm font-black uppercase tracking-widest bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                            >
                                {editOrdenId ? 'Guardar' : 'Generar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Cliente */}
            {isClienteModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsClienteModalOpen(false)}></div>
                    <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-md z-10 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black">{selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                            <button onClick={() => setIsClienteModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={clienteForm.nombre}
                                    onChange={e => setClienteForm(f => ({ ...f, nombre: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Documento</label>
                                <input
                                    type="text"
                                    value={clienteForm.documento_identidad}
                                    onChange={e => setClienteForm(f => ({ ...f, documento_identidad: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    value={clienteForm.telefono}
                                    onChange={e => setClienteForm(f => ({ ...f, telefono: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={clienteForm.direccion}
                                    onChange={e => setClienteForm(f => ({ ...f, direccion: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={handleGuardarCliente}
                                    className="w-full bg-blue-600 text-white font-black py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para convertir Orden a Factura */}
            {confirmModalOpen && orderToConfirm && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => { setConfirmModalOpen(false); setOrderToConfirm(null); }}></div>
                    <div className="bg-white rounded-xl p-6 z-10 w-full max-w-sm">
                        <h3 className="text-lg font-bold">Confirmar conversión</h3>
                        <p className="mt-2 text-sm">¿Desea convertir la Orden #{orderToConfirm.id} en una factura?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setConfirmModalOpen(false); setOrderToConfirm(null); }} className="px-4 py-2 border rounded-md">Cancelar</button>
                            <button onClick={async () => { setConfirmModalOpen(false); await performProcesar(orderToConfirm); setOrderToConfirm(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacturacionView;
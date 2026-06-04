import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const ServicioTecnico = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const getInitialTab = () => {
    try {
      const t = localStorage.getItem('servicioTecnico.activeTab');
      return t || 'clientes';
    } catch (e) {
      return 'clientes';
    }
  };

  const fetchTecnicos = async () => {
    try {
      const res = await fetch('/api/servicio-tecnico/tecnicos');
      if (!res.ok) throw new Error('Error al obtener técnicos');
      const data = await res.json();
      setTecnicos(data || []);
    } catch (err) {
      // fallback to general usuarios endpoint and try to filter by role if possible
      try {
        const r2 = await fetch('/api/usuarios');
        if (r2.ok) {
          const all = await r2.json();
          const filtered = (Array.isArray(all) ? all : []).filter(u => u.rol_id === 2 || u.role === 2 || u.rol === 2);
          setTecnicos(filtered);
        } else {
          setTecnicos([]);
        }
      } catch (e) {
        setTecnicos([]);
      }
    }
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [repuestos, setRepuestos] = useState([]);
  const [loadingRepuestos, setLoadingRepuestos] = useState(false);
  const [repuestosError, setRepuestosError] = useState(null);
  const [productos, setProductos] = useState([]);
  const [isRepuestoOpen, setIsRepuestoOpen] = useState(false);
  const [isEditingRepuesto, setIsEditingRepuesto] = useState(false);
  const [editingRepuestoId, setEditingRepuestoId] = useState(null);
  const [repuestoForm, setRepuestoForm] = useState({ orden_servicio_id: '', producto_id: '', cantidad: 1, precio_venta_momento: 0 });
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [orderForm, setOrderForm] = useState({ equipo_id: '', tecnico_id: '', fecha_ingreso: '', diagnostico_interno: '', estado: 'Recibido', mano_obra: 0, costo_repuestos: 0, total: 0 });
  const [equipos, setEquipos] = useState([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [equiposError, setEquiposError] = useState(null);
  const [isEditingEquip, setIsEditingEquip] = useState(false);
  const [editingEquipoId, setEditingEquipoId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEquipOpen, setIsEquipOpen] = useState(false);
  const [equipForm, setEquipForm] = useState({ cliente_id: '', categoria: 'Periféricos', marca: '', modelo: '', numero_serie: '', detalles_ingreso: '', fecha: '' });
  const [editForm, setEditForm] = useState({ id: null, cedulaTipo: 'V', cedula: '', nombre: '', apellido: '', telefono: '', correo: '', fecha: '' });
  const { showNotification } = useCart();

  const fetchClients = async () => {
    setLoadingClients(true);
    setClientsError(null);
    try {
      const res = await fetch('/api/servicio-tecnico/clientes');
      if (!res.ok) throw new Error('Error al obtener clientes');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setClientsError(err.message || 'Error');
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'clientes') fetchClients();
    if (activeTab === 'servicios') {
      fetchOrders();
      fetchTecnicos();
      // ensure equipos available for select
      fetchEquipos();
    }
    if (activeTab === 'equipos') fetchEquipos();
    if (activeTab === 'repuestos') {
      fetchRepuestos();
      fetchProductos();
      // ensure orders present for select
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      // filter categoria_id === 4
      const prods = Array.isArray(data) ? data.filter(p => Number(p.categoria_id) === 4) : [];
      setProductos(prods);
    } catch (err) {
      setProductos([]);
    }
  };

  // persist active tab so it survives page refresh
  useEffect(() => {
    try {
      localStorage.setItem('servicioTecnico.activeTab', activeTab);
    } catch (e) {
      // ignore storage errors
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await fetch('/api/servicio-tecnico/ordenes');
      if (!res.ok) throw new Error('Error al obtener órdenes');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message || 'Error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchEquipos = async () => {
    setLoadingEquipos(true);
    setEquiposError(null);
    try {
      const res = await fetch('/api/servicio-tecnico/equipos');
      if (!res.ok) throw new Error('Error al obtener equipos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setEquiposError(err.message || 'Error');
    } finally {
      setLoadingEquipos(false);
    }
  };

  const fetchRepuestos = async () => {
    setLoadingRepuestos(true);
    setRepuestosError(null);
    try {
      const res = await fetch('/api/servicio-tecnico/repuestos');
      if (!res.ok) throw new Error('Error al obtener repuestos');
      const data = await res.json();
      setRepuestos(data);
    } catch (err) {
      setRepuestosError(err.message || 'Error');
    } finally {
      setLoadingRepuestos(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar cliente? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`/api/servicio-tecnico/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setClients(prev => prev.filter(c => c.id !== id));
      showNotification('Cliente eliminado', 'success');
    } catch (err) {
      alert('No se pudo eliminar: ' + (err.message || 'error'));
    }
  };

  const openEditModal = (client) => {
    // parse cedula to separate tipo and number (accept formats like V-123, V 123, V123)
    let cedulaTipo = 'V';
    let cedulaNum = '';
    if (client.cedula) {
      const m = String(client.cedula).trim().match(/^\s*([VvJjGg])[-\s]?(.*)$/);
      if (m) {
        cedulaTipo = m[1].toUpperCase();
        cedulaNum = m[2] || '';
      } else {
        cedulaNum = client.cedula;
      }
    }

    setEditForm({
      id: client.id,
      cedulaTipo,
      cedula: cedulaNum,
      nombre: client.nombre || '',
      apellido: client.apellido || '',
      telefono: client.telefono || '',
      correo: client.correo || '',
      fecha: client.fecha_registro || ''
    });
    setIsCreating(false);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setIsCreating(false);
    setEditForm({ id: null, cedulaTipo: 'V', cedula: '', nombre: '', apellido: '', telefono: '', correo: '', fecha: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { id, cedulaTipo, cedula, nombre, apellido, telefono, correo } = editForm;
    try {
      const fullCedula = `${cedulaTipo}-${cedula}`;
      const res = await fetch(`/api/servicio-tecnico/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: fullCedula, nombre, apellido, telefono, correo })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      const updated = await res.json();
      setClients(prev => prev.map(p => (p.id === id ? updated : p)));
      showNotification('Cliente actualizado', 'success');
      closeEditModal();
    } catch (err) {
      alert('No se pudo actualizar: ' + (err.message || 'error'));
    }

  };

  const openCreateModal = () => {
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
    setEditForm({ id: null, cedulaTipo: 'V', cedula: '', nombre: '', apellido: '', telefono: '', correo: '', fecha: isoDate });
    setIsCreating(true);
    setIsEditOpen(true);
  };

  const openEquipModal = async () => {
    // ensure clients loaded for select
    if (!clients || clients.length === 0) await fetchClients();
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10);
    // open with empty fields (for new registration) and auto-filled date
    setEquipForm({ cliente_id: '', categoria: 'Periféricos', marca: '', modelo: '', numero_serie: '', detalles_ingreso: '', fecha: isoDate, estado: 1 });
    setIsEquipOpen(true);
    setIsEditingEquip(false);
    setEditingEquipoId(null);
  };

  const openEditEquipo = (equipo) => {
    setEquipForm({
      cliente_id: equipo.cliente_id || '',
      categoria: equipo.categoria || 'Periféricos',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      numero_serie: equipo.numero_serie || '',
      detalles_ingreso: equipo.detalles_ingreso || '',
      fecha: equipo.fecha_registro || '',
      estado: equipo.estado != null ? Number(equipo.estado) : 0
    });
    setIsEditingEquip(true);
    setEditingEquipoId(equipo.id);
    setIsEquipOpen(true);
  };

  const closeEquipModal = () => {
    setIsEquipOpen(false);
    setEquipForm({ cliente_id: '', categoria: 'Periféricos', marca: '', modelo: '', numero_serie: '', detalles_ingreso: '', fecha: '' });
  };

  const openCreateOrderModal = async () => {
    // ensure equipos and tecnicos loaded
    if (!equipos || equipos.length === 0) await fetchEquipos();
    if (!tecnicos || tecnicos.length === 0) await fetchTecnicos();
    const today = new Date().toISOString().slice(0, 10);
    setOrderForm({ equipo_id: '', tecnico_id: '', fecha_ingreso: today, diagnostico_interno: '', estado: 'Recibido', mano_obra: 0, costo_repuestos: 0, total: 0 });
    setIsEditingOrder(false);
    setEditingOrderId(null);
    setIsCreateOrderOpen(true);
  };

  const openEditOrderModal = async (order) => {
    // ensure equipos and tecnicos loaded
    if (!equipos || equipos.length === 0) await fetchEquipos();
    if (!tecnicos || tecnicos.length === 0) await fetchTecnicos();
    setOrderForm({
      equipo_id: order.equipo_id || '',
      tecnico_id: order.tecnico_id || '',
      fecha_ingreso: order.fecha_ingreso || new Date().toISOString().slice(0,10),
      diagnostico_interno: order.diagnostico_interno || '',
      estado: order.estado || 'Recibido',
      mano_obra: order.mano_obra || 0,
      costo_repuestos: order.costo_repuestos || 0,
      total: order.total || ((order.mano_obra || 0) + (order.costo_repuestos || 0))
    });
    setIsEditingOrder(true);
    setEditingOrderId(order.id);
    setIsCreateOrderOpen(true);
  };

  const closeCreateOrderModal = () => {
    setIsCreateOrderOpen(false);
    setOrderForm({ equipo_id: '', tecnico_id: '', fecha_ingreso: '', diagnostico_interno: '', estado: 'Recibido', mano_obra: 0, costo_repuestos: 0, total: 0 });
    setIsEditingOrder(false);
    setEditingOrderId(null);
  };

  const handleCreateEquipo = async (e) => {
    e.preventDefault();
    try {
      if (isEditingEquip && editingEquipoId) {
        const res = await fetch(`/api/servicio-tecnico/equipos/${editingEquipoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipForm)
        });
        if (!res.ok) throw new Error('Error al actualizar equipo');
        const updated = await res.json();
        setEquipos(prev => prev.map(eq => (eq.id === updated.id ? updated : eq)));
        showNotification('Equipo actualizado', 'success');
        closeEquipModal();
      } else {
        const res = await fetch('/api/servicio-tecnico/equipos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipForm)
        });
        if (!res.ok) throw new Error('Error al crear equipo');
        const created = await res.json();
        setEquipos(prev => [created, ...prev]);
        showNotification('Equipo creado con éxito', 'success');
        closeEquipModal();
      }
    } catch (err) {
      alert('No se pudo crear equipo: ' + (err.message || 'error'));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const mano = Number(orderForm.mano_obra) || 0;
      const repuestos = Number(orderForm.costo_repuestos) || 0;
      const total = mano + repuestos;
      const payload = { ...orderForm, mano_obra: mano, costo_repuestos: repuestos, total };
      const res = await fetch('/api/servicio-tecnico/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al crear orden');
      }
      const created = await res.json();
      setOrders(prev => [created, ...prev]);
      showNotification('Orden creada con éxito', 'success');
      closeCreateOrderModal();
    } catch (err) {
      alert('No se pudo crear orden: ' + (err.message || 'error'));
    }
  };
  
  const handleSaveOrder = async (e) => {
    e.preventDefault();
    try {
      const mano = Number(orderForm.mano_obra) || 0;
      const repuestos = Number(orderForm.costo_repuestos) || 0;
      const total = mano + repuestos;
      const payload = { ...orderForm, mano_obra: mano, costo_repuestos: repuestos, total };
      let res;
      if (isEditingOrder && editingOrderId) {
        // do not send fecha_ingreso when updating an existing order
        const payloadToSend = { ...payload };
        if (payloadToSend.hasOwnProperty('fecha_ingreso')) delete payloadToSend.fecha_ingreso;
        res = await fetch(`/api/servicio-tecnico/ordenes/${editingOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error al actualizar orden');
        }
        const updated = await res.json();
        // refresh list from server to ensure freshest data
        await fetchOrders();
        showNotification('Orden actualizada', 'success');
      } else {
        res = await fetch('/api/servicio-tecnico/ordenes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error al crear orden');
        }
        const created = await res.json();
        // refresh list from server to ensure freshest data
        await fetchOrders();
        showNotification('Orden creada con éxito', 'success');
      }
      closeCreateOrderModal();
    } catch (err) {
      alert((isEditingOrder ? 'No se pudo actualizar orden: ' : 'No se pudo crear orden: ') + (err.message || 'error'));
    }
  };

  const handleDeleteEquipo = async (id) => {
    if (!confirm('¿Eliminar equipo? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/servicio-tecnico/equipos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar equipo');
      setEquipos(prev => prev.filter(e => e.id !== id));
      showNotification('Equipo eliminado', 'success');
    } catch (err) {
      alert('No se pudo eliminar equipo: ' + (err.message || 'error'));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { cedulaTipo, cedula, nombre, apellido, telefono, correo, fecha } = editForm;
    try {
      const fullCedula = `${cedulaTipo}-${cedula}`;
      const res = await fetch('/api/servicio-tecnico/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: fullCedula, nombre, apellido, telefono, correo, fecha })
      });
      if (!res.ok) throw new Error('Error al crear');
      const created = await res.json();
      setClients(prev => [created, ...prev]);
      showNotification('Cliente creado con éxito', 'success');
      closeEditModal();
    } catch (err) {
      alert('No se pudo crear: ' + (err.message || 'error'));
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const renderEstadoBadge = (estado) => {
    const e = (estado || '').toString().trim().toLowerCase();
    // Map exact DB enum literals and common frontend labels to distinct colored badges
    if (e === 'recibido' || e === 'pendiente') {
      return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recibido</span>;
    }
    if (e === 'en revision' || e === 'en proceso') {
      return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">En Revisión</span>;
    }
    if (e === 'esperando repuesto' || e.includes('esperando')) {
      return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Esperando Repuesto</span>;
    }
    // handle possible leading-space literal in DB
    if (e === 'listo para entrega' || e === ' listo para entrega') {
      return <span className="bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Listo para Entrega</span>;
    }
    if (e === 'entregado') {
      return <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Entregado</span>;
    }
    if (e === 'no reparable' || e === 'noreparable') {
      return <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">No Reparable</span>;
    }
    // fallback: show raw label with neutral styling
    return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{estado}</span>;
  };

  const openCreateRepuestoModal = async () => {
    if (!productos || productos.length === 0) await fetchProductos();
    if (!orders || orders.length === 0) await fetchOrders();
    setRepuestoForm({ orden_servicio_id: '', producto_id: '', cantidad: 1, precio_venta_momento: 0 });
    setIsEditingRepuesto(false);
    setEditingRepuestoId(null);
    setIsRepuestoOpen(true);
  };

  const openEditRepuesto = (r) => {
    setRepuestoForm({ orden_servicio_id: r.orden_servicio_id || '', producto_id: r.producto_id || '', cantidad: r.cantidad || 1, precio_venta_momento: r.precio_venta_momento || 0 });
    setIsEditingRepuesto(true);
    setEditingRepuestoId(r.id);
    setIsRepuestoOpen(true);
  };

  const closeRepuestoModal = () => {
    setIsRepuestoOpen(false);
    setIsEditingRepuesto(false);
    setEditingRepuestoId(null);
    setRepuestoForm({ orden_servicio_id: '', producto_id: '', cantidad: 1, precio_venta_momento: 0 });
  };

  const handleSaveRepuesto = async (e) => {
    e.preventDefault();
    try {
      const payload = { orden_servicio_id: repuestoForm.orden_servicio_id, producto_id: repuestoForm.producto_id, cantidad: Number(repuestoForm.cantidad) || 0 };
      let res;
      if (isEditingRepuesto && editingRepuestoId) {
        // do not allow modifying precio_venta_momento on edit
        res = await fetch(`/api/servicio-tecnico/repuestos/${editingRepuestoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al actualizar repuesto');
        showNotification('Repuesto actualizado', 'success');
      } else {
        const body = { ...payload, precio_venta_momento: Number(repuestoForm.precio_venta_momento) || 0 };
        res = await fetch('/api/servicio-tecnico/repuestos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error al crear repuesto');
        }
        showNotification('Repuesto creado', 'success');
      }
      await fetchRepuestos();
      closeRepuestoModal();
    } catch (err) {
      alert('No se pudo guardar repuesto: ' + (err.message || 'error'));
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="h-20"></div>

      <header className="py-14 px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Servicio Técnico</span>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
              PANEL DE <span className="text-blue-600">SERVICIO TÉCNICO</span>
            </h1>
          </div>
          <button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            + Nuevo cliente
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-[1rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('clientes')}
                className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'clientes' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                Clientes
              </button>
              <button
                onClick={() => setActiveTab('servicios')}
                className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'servicios' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                Servicios
              </button>
              <button
                onClick={() => setActiveTab('equipos')}
                className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'equipos' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                Equipos
              </button>
              <button
                onClick={() => setActiveTab('repuestos')}
                className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'repuestos' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                Repuestos
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Buscar..." className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'clientes' && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Clientes</h2>
                {loadingClients && <p className="text-slate-600">Cargando clientes...</p>}
                {clientsError && <p className="text-red-600">{clientsError}</p>}

                {!loadingClients && !clientsError && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                          <th className="px-8 py-6 border-b border-slate-100">Cédula</th>
                          <th className="px-8 py-6 border-b border-slate-100">Nombre</th>
                          <th className="px-8 py-6 border-b border-slate-100">Apellido</th>
                          <th className="px-8 py-6 border-b border-slate-100">Teléfono</th>
                          <th className="px-8 py-6 border-b border-slate-100">Correo</th>
                          <th className="px-8 py-6 border-b border-slate-100 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 font-mono text-slate-400">{c.cedula}</td>
                            <td className="px-8 py-4 font-bold text-slate-700 bg-blue-50">{c.nombre || '-'}</td>
                            <td className="px-8 py-4 text-slate-600 bg-blue-50">{c.apellido || '-'}</td>
                            <td className="px-8 py-4 text-slate-600">{c.telefono || '-'}</td>
                            <td className="px-8 py-4 text-slate-600">{c.correo || '-'}</td>
                            <td className="px-8 py-4 text-center">
                              <button onClick={() => openEditModal(c)} className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'servicios' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Servicios</h2>
                  <button onClick={openCreateOrderModal} className="bg-green-600 text-white px-4 py-2 rounded-lg">+ Crear Orden</button>
                </div>
                {loadingOrders && <p className="text-slate-600">Cargando órdenes...</p>}
                {ordersError && <p className="text-red-600">{ordersError}</p>}

                {!loadingOrders && !ordersError && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                          <th className="px-8 py-6 border-b border-slate-100">Nro</th>
                          <th className="px-8 py-6 border-b border-slate-100">Equipo</th>
                          <th className="px-8 py-6 border-b border-slate-100">Técnico</th>
                          <th className="px-8 py-6 border-b border-slate-100">Fecha de Ingreso</th>
                          <th className="px-8 py-6 border-b border-slate-100">Estado</th>
                            <th className="px-8 py-6 border-b border-slate-100">Entrega</th>
                          <th className="px-8 py-6 border-b border-slate-100 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 font-mono text-slate-400">{o.id}</td>
                            <td className="px-8 py-4 text-slate-700 bg-slate-200">{o.equipo_nombre || o.equipo_id}</td>
                            <td className="px-8 py-4 text-slate-700">{o.tecnico_nombre || o.tecnico_id}</td>
                            <td className="px-8 py-4 text-slate-600">{o.fecha_ingreso}</td>
                            <td className="px-8 py-4 text-slate-600">{renderEstadoBadge(o.estado)}</td>
                            <td className="px-8 py-4 text-slate-700 bg-blue-50">{o.fecha_entrega ? o.fecha_entrega : 'En Espera'}</td>
                            <td className="px-8 py-4 text-center">
                              <button onClick={() => openEditOrderModal(o)} className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors mr-2">Editar</button>
                              <button onClick={() => showNotification('Eliminar orden no implementado', 'info')} className="text-red-600 hover:text-red-800 font-bold text-[10px] uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {activeTab === 'equipos' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Equipos</h2>
                  <button onClick={openEquipModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Nuevo equipo</button>
                </div>
                {loadingEquipos && <p className="text-slate-600">Cargando equipos...</p>}
                {equiposError && <p className="text-red-600">{equiposError}</p>}

                {!loadingEquipos && !equiposError && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                          <th className="px-6 py-4 border-b">Nombre del Cliente</th>
                          <th className="px-6 py-4 border-b">Categoría</th>
                          <th className="px-6 py-4 border-b">Marca</th>
                          <th className="px-6 py-4 border-b">Modelo</th>
                          <th className="px-6 py-4 border-b">Detalles</th>
                          <th className="px-6 py-4 border-b">Fecha</th>
                          <th className="px-6 py-4 border-b">Status</th>
                          <th className="px-6 py-4 border-b text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {equipos.map(eq => (
                          <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3 bg-blue-50">{(eq.cliente_nombre ? eq.cliente_nombre : '-')}</td>
                            <td className="px-6 py-3">{eq.categoria}</td>
                            <td className="px-6 py-3">{eq.marca}</td>
                            <td className="px-6 py-3">{eq.modelo}</td>
                            <td className="px-6 py-3 bg-blue-50">{eq.detalles_ingreso}</td>
                            <td className="px-6 py-3">{eq.fecha_registro}</td>
                            <td className="px-6 py-3 text-center">
                              {Number(eq.estado) === 1 ? (
                                <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Activo</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Inactivo</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button onClick={() => openEditEquipo(eq)} className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors mr-2">Editar</button>
                              <button onClick={() => handleDeleteEquipo(eq.id)} className="text-red-600 hover:text-red-800 font-bold text-[10px] uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {activeTab === 'repuestos' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Repuestos y Órdenes</h2>
                  <button onClick={openCreateRepuestoModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Repuesto +</button>
                </div>
                {loadingRepuestos && <p className="text-slate-600">Cargando repuestos...</p>}
                {repuestosError && <p className="text-red-600">{repuestosError}</p>}

                {!loadingRepuestos && !repuestosError && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                          <th className="px-8 py-6 border-b border-slate-100">Nro Servicio</th>
                          <th className="px-8 py-6 border-b border-slate-100">Descripcion</th>
                          <th className="px-8 py-6 border-b border-slate-100">Repuesto utilizado</th>
                          <th className="px-8 py-6 border-b border-slate-100">Cantidad</th>
                          <th className="px-8 py-6 border-b border-slate-100">Precio de Venta</th>
                          <th className="px-8 py-6 border-b border-slate-100 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {repuestos.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 font-mono text-slate-400">{r.orden_servicio_id}</td>
                            <td className="px-8 py-4 text-slate-700 bg-slate-200">{r.equipo_nombre ? `${r.equipo_id} — ${r.equipo_nombre}` : (r.equipo_id ? `#${r.equipo_id}` : '-')}</td>
                            <td className="px-8 py-4 font-bold text-slate-700 bg-blue-200">{r.producto_nombre || `#${r.producto_id}`}</td>
                            <td className="px-8 py-4 text-slate-600">{r.cantidad}</td>
                            <td className="px-8 py-4 text-slate-600">{r.precio_venta_momento}</td>
                            <td className="px-8 py-4 text-center">
                              <button onClick={() => openEditRepuesto(r)} className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors">Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
      {isEditOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={closeEditModal} />

          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-8">
            <form onSubmit={isCreating ? handleCreate : handleSaveEdit} className="mt-8 w-full max-w-2xl bg-white rounded-2xl overflow-auto p-4 sm:p-6 max-h-[90vh]">
              <div className="p-4 pb-6 relative border-b">
                <h3 className="text-xl font-bold">{isCreating ? 'Nuevo Cliente' : 'Editar Cliente'}</h3>
                <button type="button" onClick={closeEditModal} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200">✕</button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Cédula</label>
                  <div className="flex gap-2">
                    <select
                      value={editForm.cedulaTipo}
                      onChange={(e) => setEditForm(prev => ({ ...prev, cedulaTipo: e.target.value }))}
                      className="px-3 py-2 border rounded bg-white"
                    >
                      <option value="V">V</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                    </select>
                    <input className="flex-1 px-3 py-2 border rounded" value={editForm.cedula} onChange={(e) => setEditForm(prev => ({...prev, cedula: e.target.value}))} />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Nombre</label>
                  <input className="px-3 py-2 border rounded" value={editForm.nombre} onChange={(e) => setEditForm(prev => ({...prev, nombre: e.target.value}))} />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Apellido</label>
                  <input className="px-3 py-2 border rounded" value={editForm.apellido} onChange={(e) => setEditForm(prev => ({...prev, apellido: e.target.value}))} />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                  <input className="px-3 py-2 border rounded" value={editForm.telefono} onChange={(e) => setEditForm(prev => ({...prev, telefono: e.target.value}))} />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Correo</label>
                  <input className="px-3 py-2 border rounded w-full" value={editForm.correo} onChange={(e) => setEditForm(prev => ({...prev, correo: e.target.value}))} />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input readOnly className="px-3 py-2 border rounded w-full bg-slate-50" value={editForm.fecha} />
                </div>
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{isCreating ? 'Crear' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </>
      )}
      {isEquipOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={closeEquipModal} />
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-8">
            <form onSubmit={handleCreateEquipo} className="mt-8 w-full max-w-xl bg-white rounded-2xl overflow-y-auto p-6 sm:p-8 max-h-[92vh]">
              <div className="p-4 pb-6 relative border-b">
                <h3 className="text-xl font-bold">Crear Equipo</h3>
                <button type="button" onClick={closeEquipModal} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Cliente</label>
                  <select value={equipForm.cliente_id} onChange={(e) => setEquipForm(prev => ({...prev, cliente_id: e.target.value}))} className="px-3 py-2 border rounded w-full">
                    <option value="">Seleccione cliente...</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Categoría</label>
                  <select value={equipForm.categoria} onChange={(e) => setEquipForm(prev => ({...prev, categoria: e.target.value}))} className="px-3 py-2 border rounded w-full">
                    <option>Periféricos</option>
                    <option>Hardware Base</option>
                    <option>Almacenamiento</option>
                    <option>Equipos de Impresión</option>
                    <option>Red</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Marca</label>
                  <input value={equipForm.marca} onChange={(e) => setEquipForm(prev => ({...prev, marca: e.target.value}))} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Modelo</label>
                  <input value={equipForm.modelo} onChange={(e) => setEquipForm(prev => ({...prev, modelo: e.target.value}))} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Nro de Serie</label>
                  <input value={equipForm.numero_serie} onChange={(e) => setEquipForm(prev => ({...prev, numero_serie: e.target.value}))} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={Number(equipForm.estado) === 1} onChange={() => setEquipForm(prev => ({...prev, estado: prev.estado === 1 ? 0 : 1}))} className="w-4 h-4" />
                    <span className="text-sm font-medium text-slate-600">Estado (activo)</span>
                  </label>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Detalles</label>
                  <textarea value={equipForm.detalles_ingreso} onChange={(e) => setEquipForm(prev => ({...prev, detalles_ingreso: e.target.value}))} className="px-3 py-2 border rounded w-full" rows={4} />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input readOnly value={equipForm.fecha} className="px-3 py-2 border rounded w-full bg-slate-50" />
                </div>
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b">
                <button type="button" onClick={closeEquipModal} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Crear Equipo</button>
              </div>
            </form>
          </div>
        </>
      )}
      {isCreateOrderOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={closeCreateOrderModal} />
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-8">
            <form onSubmit={handleSaveOrder} className="mt-8 w-full max-w-xl bg-white rounded-2xl overflow-y-auto p-6 sm:p-8 max-h-[92vh]">
              <div className="p-4 pb-6 relative border-b">
                <h3 className="text-xl font-bold">Crear Orden de Servicio</h3>
                <button type="button" onClick={closeCreateOrderModal} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Equipo</label>
                  <select value={orderForm.equipo_id} onChange={(e) => setOrderForm(prev => ({...prev, equipo_id: e.target.value}))} className="px-3 py-2 border rounded w-full">
                    <option value="">Seleccione equipo...</option>
                    {equipos.filter(eq => Number(eq.estado) === 1).map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.cliente_nombre ? `${eq.cliente_nombre} — ` : ''}{eq.marca} {eq.modelo}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Técnico</label>
                  <select value={orderForm.tecnico_id} onChange={(e) => setOrderForm(prev => ({...prev, tecnico_id: e.target.value}))} className="px-3 py-2 border rounded w-full">
                    <option value="">Seleccione técnico...</option>
                    {tecnicos.map(t => (<option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Fecha de Ingreso</label>
                  <input readOnly value={orderForm.fecha_ingreso} className="px-3 py-2 border rounded w-full bg-slate-50" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Detalles (Diagnóstico interno)</label>
                  <textarea value={orderForm.diagnostico_interno} onChange={(e) => setOrderForm(prev => ({...prev, diagnostico_interno: e.target.value}))} className="px-3 py-2 border rounded w-full" rows={4} />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Estado</label>
                  <select value={orderForm.estado} onChange={(e) => setOrderForm(prev => ({...prev, estado: e.target.value}))} className="px-3 py-2 border rounded w-full">
                    <option value="Recibido">Recibido</option>
                    <option value="En Revision">En Revision</option>
                    <option value="Esperando Repuesto">Esperando Repuesto</option>
                    <option value=" Listo para entrega"> Listo para entrega</option>
                    <option value="Entregado">Entregado</option>
                    <option value="No Reparable">No Reparable</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Precio Mano de Obra</label>
                  <input type="number" min="0" step="0.01" value={orderForm.mano_obra} onChange={(e) => {
                    const val = e.target.value;
                    const mano = Number(val) || 0;
                    setOrderForm(prev => ({...prev, mano_obra: mano, total: mano + Number(prev.costo_repuestos || 0)}));
                  }} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Costo Repuestos</label>
                  <input type="number" min="0" step="0.01" value={orderForm.costo_repuestos} onChange={(e) => {
                    const val = e.target.value;
                    const rep = Number(val) || 0;
                    setOrderForm(prev => ({...prev, costo_repuestos: rep, total: rep + Number(prev.mano_obra || 0)}));
                  }} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Total a pagar</label>
                  <input readOnly value={orderForm.total} className="px-3 py-2 border rounded w-full bg-slate-50" />
                </div>
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b">
                <button type="button" onClick={closeCreateOrderModal} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">{isEditingOrder ? 'Guardar' : 'Crear Orden'}</button>
              </div>
            </form>
          </div>
        </>
      )}
      {isRepuestoOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={closeRepuestoModal} />
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-8">
            <form onSubmit={handleSaveRepuesto} className="mt-8 w-full max-w-lg bg-white rounded-2xl overflow-y-auto p-6 sm:p-8 max-h-[92vh]">
              <div className="p-4 pb-6 relative border-b">
                <h3 className="text-xl font-bold">{isEditingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h3>
                <button type="button" onClick={closeRepuestoModal} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Nro Servicio</label>
                  <select disabled={isEditingRepuesto} value={repuestoForm.orden_servicio_id} onChange={(e) => setRepuestoForm(prev => ({...prev, orden_servicio_id: e.target.value}))} className="px-3 py-2 border rounded w-full" >
                    <option value="">Seleccione servicio...</option>
                    {orders.filter(o => {
                      const s = (o.estado || '').toString().trim().toLowerCase();
                      return s !== 'listo para entrega' && s !== 'entregado';
                    }).map(o => (<option key={o.id} value={o.id}>{`#${o.id} ${o.equipo_nombre ? '— ' + o.equipo_nombre : ''}`}</option>))}
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 mb-1">Producto</label>
                  <select value={repuestoForm.producto_id} onChange={(e) => {
                    const pid = e.target.value;
                    const prod = productos.find(p => String(p.id) === String(pid));
                    setRepuestoForm(prev => ({...prev, producto_id: pid, precio_venta_momento: (prod ? prod.precio_venta : prev.precio_venta_momento)}));
                  }} className="px-3 py-2 border rounded w-full">
                    <option value="">Seleccione producto...</option>
                    {productos.map(p => (<option key={p.id} value={p.id}>{p.nombre} — {p.precio_venta}</option>))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Cantidad</label>
                  <input type="number" min="1" value={repuestoForm.cantidad} onChange={(e) => setRepuestoForm(prev => ({...prev, cantidad: Number(e.target.value) || 1}))} className="px-3 py-2 border rounded" />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-600 mb-1">Precio</label>
                  <input type="number" step="0.01" min="0" value={repuestoForm.precio_venta_momento} onChange={(e) => setRepuestoForm(prev => ({...prev, precio_venta_momento: Number(e.target.value) || 0}))} className="px-3 py-2 border rounded" readOnly={isEditingRepuesto} />
                </div>
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b">
                <button type="button" onClick={closeRepuestoModal} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{isEditingRepuesto ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ServicioTecnico;

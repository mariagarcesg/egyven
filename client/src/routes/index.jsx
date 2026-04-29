import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones
import CatalogoView from '../views/CatalogoView.jsx';
import Inicio from '../views/Inicio.jsx';
import Nosotros from '../views/Nosotros.jsx';
import Login from '../views/Login.jsx';
import SignUp from '../views/SignUp.jsx';
import Perfil from '../views/Perfil.jsx';

// Context
import { CartProvider } from '../context/CartContext.jsx';
import CartModal from '../components/cart/CartModal.jsx';

// Vistas Administrativas
import Principal from '../views/admin/Principal.jsx';
import InventarioView from '../views/admin/Inventario.jsx';
import FacturacionView from '../views/admin/Facturacion.jsx';
import UsuariosView from '../views/admin/Usuarios.jsx';
import ComparadorView from '../views/admin/Comparador.jsx';
import PedidosView from '../views/Pedidos.jsx';

// Componente simple para proteger rutas (Opcional pero recomendado)
const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.rol_id)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  return (
    <CartProvider>
      <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<CatalogoView />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rutas de Gestión (Admin y Técnico) */}
        <Route
          path="/principal"
          element={
            <PrivateRoute allowedRoles={[1, 4]}>
              <Principal />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/inventario"
          element={
            <PrivateRoute allowedRoles={[1, 4]}>
              <InventarioView />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/facturacion"
          element={
            <PrivateRoute allowedRoles={[1, 4]}>
              <FacturacionView />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/comparador"
          element={
            <PrivateRoute allowedRoles={[1, 4]}>
              <ComparadorView />
            </PrivateRoute>
          }
        />

        {/* Ruta exclusiva para el ID=1 (Súper Admin / Rafael) */}
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <UsuariosView />
            </PrivateRoute>
          }
        />

        {/* Ruta para el perfil de usuario */}
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />

        {/* Ruta para pedidos del cliente */}
        <Route
          path="/pedidos"
          element={
            <PrivateRoute allowedRoles={[5]}>
              <PedidosView />
            </PrivateRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CartModal />
      </BrowserRouter>
    </CartProvider>
  );
};

export default AppRoutes;
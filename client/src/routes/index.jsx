import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones corregidas hacia la carpeta views
import CatalogoView from '../views/CatalogoView.jsx';
import Inicio from '../views/Inicio.jsx';
import Nosotros from '../views/Nosotros.jsx';
import Login from '../views/Login.jsx';
import SignUp from '../views/SignUp.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Inicio />} />
        {/* Ruta Catálogo */}
        <Route path="/catalogo" element={<CatalogoView />} />
        {/* Ruta Nosotros */}
        <Route path="/nosotros" element={<Nosotros />} />
        {/* Ruta Login */}
        <Route path="/login" element={<Login />} />
        {/* Ruta SignUp */}
        <Route path="/signup" element={<SignUp />} />

        {/* Si escriben cualquier otra cosa, redirigir al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
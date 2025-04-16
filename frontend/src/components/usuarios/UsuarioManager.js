import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UsuarioList from './UsuarioList';
import UsuarioForm from './UsuarioForm';
import UsuarioView from './UsuarioView';

const UsuarioManager = () => {
  return (
    <Routes>
      <Route index element={<UsuarioList />} />
      <Route path="new" element={<UsuarioForm />} />
      <Route path="edit/:id" element={<UsuarioForm isEdit />} />
      <Route path="view/:id" element={<UsuarioView />} />
      <Route path="me" element={<UsuarioView isCurrentUser />} />
    </Routes>
  );
};

export default UsuarioManager;
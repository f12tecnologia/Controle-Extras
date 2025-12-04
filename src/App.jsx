import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Login from '@/pages/Login.jsx';
import SignUp from '@/pages/SignUp.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import ExtrasForm from '@/pages/ExtrasForm.jsx';
import Reports from '@/pages/Reports.jsx';
import Employees from '@/pages/Employees.jsx';
import Receipts from '@/pages/Receipts.jsx';
import MyExtras from '@/pages/MyExtras.jsx';
import Companies from '@/pages/Companies.jsx';
import Users from '@/pages/Users.jsx';
import Profile from '@/pages/Profile.jsx';
import Layout from '@/components/Layout';
import AuthorizedCompanies from '@/pages/AuthorizedCompanies.jsx';
import ForgotPassword from '@/pages/ForgotPassword.jsx';
import ResetPassword from '@/pages/ResetPassword.jsx';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.user_metadata?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
      <Router>
        <Helmet>
          <title>Sistema de Cadastro de Extras</title>
          <meta name="description" content="Sistema completo para gerenciamento de extras com controle de acesso e relatórios" />
          <meta property="og:title" content="Sistema de Cadastro de Extras" />
          <meta property="og:description" content="Sistema completo para gerenciamento de extras com controle de acesso e relatórios" />
        </Helmet>
        
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/extras/new"
              element={
                <ProtectedRoute allowedRoles={['lançador']}>
                  <Layout>
                    <ExtrasForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/extras/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['lançador']}>
                  <Layout>
                    <ExtrasForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/my-extras"
              element={
                <ProtectedRoute allowedRoles={['lançador']}>
                  <Layout>
                    <MyExtras />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['gestor', 'lançador', 'admin']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['lançador', 'gestor', 'admin']}>
                  <Layout>
                    <Employees />
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/companies"
              element={
                <ProtectedRoute allowedRoles={['gestor', 'admin']}>
                  <Layout>
                    <Companies />
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/authorized-companies"
              element={
                <ProtectedRoute allowedRoles={['lançador']}>
                  <Layout>
                    <AuthorizedCompanies />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/receipts"
              element={
                <ProtectedRoute allowedRoles={['lançador', 'gestor', 'admin']}>
                  <Layout>
                    <Receipts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['gestor', 'admin']}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
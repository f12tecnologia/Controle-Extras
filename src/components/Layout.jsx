import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ReplitAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, BarChart3, Home, Users, Receipt, ListChecks, Building, CheckSquare, Settings, UserCog, UserCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getMenuItems = (role) => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
    ];

    const commonSettings = [
       { type: 'divider', label: 'Configurações' },
       { path: '/profile', label: 'Meu Cadastro', icon: UserCircle },
    ];

    if (role === 'lançador') {
      return [
        ...baseItems,
        { path: '/extras/new', label: 'Novo Extra', icon: Plus },
        { path: '/my-extras', label: 'Meus Extras', icon: ListChecks },
        { path: '/employees', label: 'Funcionários', icon: Users },
        { path: '/receipts', label: 'Recibos', icon: Receipt },
        { path: '/reports', label: 'Relatórios', icon: BarChart3 }, // Relatórios para Lançador
        ...commonSettings,
        { path: '/authorized-companies', label: 'Empresas Autorizadas', icon: Building },
      ];
    }

    if (role === 'gestor') {
      return [
        ...baseItems,
        { path: '/receipts', label: 'Aprovações', icon: CheckSquare },
        { path: '/employees', label: 'Funcionários', icon: Users },
        { path: '/companies', label: 'Empresas', icon: Building },
        { path: '/reports', label: 'Relatórios', icon: BarChart3 },
        ...commonSettings,
        { path: '/users', label: 'Usuários', icon: UserCog },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseItems,
        { path: '/receipts', label: 'Aprovações', icon: CheckSquare },
        { path: '/employees', label: 'Funcionários', icon: Users },
        { path: '/companies', label: 'Empresas', icon: Building },
        { path: '/reports', label: 'Relatórios', icon: BarChart3 },
        ...commonSettings,
        { path: '/users', label: 'Usuários', icon: UserCog },
      ];
    }
    
    return [...baseItems, ...commonSettings];
  };

  const userRole = user?.role || user?.user_metadata?.role;
  const userName = user?.name || user?.user_metadata?.name || user?.email;
  const menuItems = getMenuItems(userRole);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 glass-effect border-r border-white/20 p-6 flex flex-col"
      >
        <div>
            <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">Sistema Extras</h1>
            <p className="text-sm text-gray-300 mt-1">Gestão Inteligente</p>
            </div>

            <div className="mb-8">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                <p className="font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-300 capitalize">{userRole}</p>
                </div>
            </div>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={index} className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center space-x-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
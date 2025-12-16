import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ReplitAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, DollarSign, Clock, Building, Users, UserPlus, CheckSquare, UserCog, Inbox, FileText } from 'lucide-react';
import { replitDb } from '@/lib/replitDbClient';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExtras: 0,
    totalValue: 0,
    employeesCount: 0,
    companiesCount: 0,
  });
  const [inboxItems, setInboxItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userRole = user?.role;
  const userName = user?.name || user?.email;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        if (userRole === 'gestor' || userRole === 'admin') {
          const extrasData = await replitDb.getAllExtras();
          const employeesData = await replitDb.getAllEmployees();
          const companiesData = await replitDb.getAllCompanies();

          const totalValue = extrasData.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
          setStats({
            totalExtras: extrasData.length,
            totalValue: totalValue,
            employeesCount: employeesData.length,
            companiesCount: companiesData.length,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      
      setLoading(false);
    };

    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);

  const renderLancadorDashboard = () => (
    <>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-300 mt-1">Gerencie seus extras e lançamentos</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/extras/new')} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Extra</span>
          </Button>
          <Button onClick={() => navigate('/employees')} variant="outline" className="btn-outline-primary flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Funcionários</span>
          </Button>
        </div>
      </div>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">Bem-vindo, {userName}!</h2>
        <p className="text-gray-400 mt-2">Use o menu à esquerda para navegar pelo sistema.</p>
      </div>
    </>
  );

  const renderManagerDashboard = () => (
     <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard do {userRole === 'admin' ? 'Admin' : 'Gestor'}</h1>
          <p className="text-gray-300 mt-1">Visão geral e atalhos do sistema</p>
        </div>
         <div className="flex space-x-2">
            {userRole === 'admin' && (
              <Button onClick={() => navigate('/users')} className="btn-primary flex items-center space-x-2">
                <UserCog className="w-4 h-4" />
                <span>Gerenciar Usuários</span>
              </Button>
            )}
            <Button onClick={() => navigate('/receipts')} className="btn-primary flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>Gerenciar Aprovações</span>
            </Button>
            <Button onClick={() => navigate('/companies')} variant="outline" className="btn-outline-primary flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Empresas</span>
            </Button>
          </div>
      </div>
       {loading ? (
        <div className="text-center text-white">Carregando estatísticas...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/20 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Lançamentos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalExtras}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/20 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Valor Total Geral</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/20 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Funcionários</p>
                  <p className="text-2xl font-bold text-white">{stats.employeesCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-effect border-white/20 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Empresas</p>
                  <p className="text-2xl font-bold text-white">{stats.companiesCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-effect border-white/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                    <Inbox className="text-purple-400"/>
                    Caixa de Entrada de Aprovações
                </CardTitle>
                <CardDescription>Extras recentes aguardando sua ação.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-gray-300">Carregando...</p> : 
                inboxItems.length > 0 ? (
                    <div className="space-y-4">
                        {inboxItems.slice(0, 5).map(item => (
                            <Link to="/receipts" key={item.id} className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                        <p className="font-semibold text-white">{item.employee_name}</p>
                                        <p className="text-sm text-gray-400">{item.company_name}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-purple-400">{formatCurrency(item.total)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                                        </div>
                                        <Badge className="bg-amber-500/80 text-white hidden sm:inline-flex">Pendente</Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4">Sua caixa de entrada está vazia. Bom trabalho! ✨</p>
                )}
                 {inboxItems.length > 5 && (
                    <div className="text-center mt-4">
                        <Button variant="link" onClick={() => navigate('/receipts')}>Ver todos ({inboxItems.length})</Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </motion.div>
    </>
  );

  const renderDashboard = () => {
    switch(userRole) {
      case 'gestor':
      case 'admin':
        return renderManagerDashboard();
      case 'lançador':
        return renderLancadorDashboard();
      default:
        return <div className="text-center text-white">Carregando dashboard...</div>;
    }
  }

  return (
    <div className="space-y-8">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
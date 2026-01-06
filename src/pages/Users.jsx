import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, UserPlus, Users, Edit, Trash2, RefreshCw } from 'lucide-react';
import UserForm from '@/components/Users/UserForm';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { replitDb } from '@/lib/replitDbClient';

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await replitDb.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFormSubmit = () => {
    loadUsers();
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (email) => {
    try {
      await replitDb.deleteUser(email);
      loadUsers();
      toast({
        title: "Usuário excluído",
        description: "O registro do usuário foi removido com sucesso.",
      });
    } catch (error) {
       toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-500/80',
      gestor: 'bg-purple-500/80',
      lançador: 'bg-blue-500/80',
    };
    return <Badge className={roleStyles[role] || 'bg-gray-500/80'}>{role}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Usuários</h1>
          <p className="text-gray-300 mt-1">Gerencie os usuários da plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadUsers}
            variant="outline"
            className="btn-outline-primary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsFormOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </Button>
        </div>
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={handleFormSubmit}
        user={selectedUser}
      />

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Lista de Usuários</CardTitle>
          <CardDescription className="text-gray-300">
            {users.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-12 text-white">Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhum usuário cadastrado</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2"/>
                Cadastrar Primeiro Usuário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-white text-lg">{user.name || user.email}</h3>
                        {getRoleBadge(user.role)}
                        <Badge variant="success">Ativo</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">Email: </span>
                          <span className="text-white">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Setor: </span>
                          <span className="text-white">{user.setor || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        disabled={user.role === 'admin'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-white/20 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o usuário.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-white border-white/20 hover:bg-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.email)} className="bg-red-600 hover:bg-red-700">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;

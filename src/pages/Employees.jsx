import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, UserPlus, Users, Edit, Trash2, RefreshCw } from 'lucide-react';
import EmployeeForm from '@/components/Employees/EmployeeForm';
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

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await replitDb.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      toast({ title: "Erro ao carregar funcionários", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleFormSubmit = () => {
    loadEmployees();
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await replitDb.deleteEmployee(id);
      toast({
        title: "Funcionário excluído",
        description: "O registro do funcionário foi removido com sucesso.",
      });
      loadEmployees();
    } catch (error) {
      toast({ title: "Erro ao excluir funcionário", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Funcionários</h1>
          <p className="text-gray-300 mt-1">Gerencie os funcionários da sua equipe</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadEmployees} variant="outline" className="btn-outline-primary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setIsFormOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Funcionário</span>
          </Button>
        </div>
      </div>

      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={handleFormSubmit}
        employee={selectedEmployee}
      />

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Lista de Funcionários</CardTitle>
          <CardDescription className="text-gray-300">
            {employees.length} funcionário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-white">Carregando funcionários...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhum funcionário cadastrado</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2"/>
                Cadastrar Primeiro Funcionário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-white text-lg">{employee.name}</h3>
                        <Badge variant={employee.ativo ? "success" : "destructive"}>
                          {employee.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">CPF:</span>
                          <p className="text-white">{employee.cpf || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Telefone:</span>
                          <p className="text-white">{employee.telefone || 'N/A'}</p>
                        </div>
                         <div>
                          <span className="text-gray-400">Banco:</span>
                          <p className="text-white">{employee.banco || 'N/A'}</p>
                        </div>
                      </div>
                       <div className="mt-2 text-sm">
                          <span className="text-gray-400">Chave PIX:</span>
                          <p className="text-white">{employee.pix_key || employee.chavePix || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(employee)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
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
                              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o funcionário.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-white border-white/20 hover:bg-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(employee.id)} className="bg-red-600 hover:bg-red-700">
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

export default Employees;

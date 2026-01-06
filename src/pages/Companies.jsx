import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import CompanyForm from '@/components/Companies/CompanyForm';
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
} from "@/components/ui/alert-dialog";
import { replitDb } from '@/lib/replitDbClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/ReplitAuthContext';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const userRole = user?.role;
  const canManage = userRole === 'gestor' || userRole === 'admin';

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await replitDb.getAllCompanies();
      setCompanies(data.sort((a, b) => a.name?.localeCompare(b.name)));
    } catch (error) {
      toast({ title: "Erro ao carregar empresas", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleDelete = async (id) => {
    try {
      await replitDb.deleteCompany(id);
      toast({ title: "Empresa excluída!", description: "O registro foi removido com sucesso." });
      loadCompanies();
    } catch (error) {
      toast({ title: "Erro ao excluir empresa", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gerenciar Empresas</h1>
          <p className="text-gray-300 mt-1">Cadastre e gerencie as empresas parceiras.</p>
        </div>
        {canManage && (
          <div className="flex items-center space-x-2">
            <Button onClick={loadCompanies} variant="outline" className="btn-outline-primary" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <CompanyForm onSave={loadCompanies}>
              <Button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nova Empresa</span>
              </Button>
            </CompanyForm>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12 text-white">Carregando empresas...</div>
        ) : companies.length > 0 ? companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Building className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-white">{company.name}</h3>
                      <Badge className={company.ativa ? 'bg-green-500/80' : 'bg-red-500/80'}>
                        {company.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">CNPJ: {company.cnpj || 'Não informado'}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex space-x-2">
                    <CompanyForm company={company} onSave={loadCompanies}>
                      <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </CompanyForm>
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a empresa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-white border-white/20 hover:bg-white/10">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(company.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )) : (
          <Card className="glass-effect border-white/20 text-center py-12">
            <CardContent>
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Nenhuma empresa cadastrada</h3>
              <p className="text-gray-400 mt-2">Comece cadastrando a primeira empresa.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Companies;

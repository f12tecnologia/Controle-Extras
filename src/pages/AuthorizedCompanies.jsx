import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ReplitAuthContext';
import { replitDb } from '@/lib/replitDbClient';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AuthorizedCompanies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authorizedCompanies, setAuthorizedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuthorizedCompanies = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const allCompanies = await replitDb.getAllCompanies();
      
      const authorizedIds = user.authorized_company_ids ? 
        (typeof user.authorized_company_ids === 'string' ? JSON.parse(user.authorized_company_ids) : user.authorized_company_ids) 
        : [];
      
      const authorized = allCompanies.filter(company => 
        authorizedIds.includes(company.id) || authorizedIds.includes(company.id?.toString())
      );
      
      setAuthorizedCompanies(authorized);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar empresas",
        description: "Não foi possível buscar suas empresas autorizadas.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAuthorizedCompanies();
  }, [fetchAuthorizedCompanies]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Empresas Autorizadas</h1>
        <p className="text-gray-300 mt-1">
          Estas são as empresas para as quais você tem permissão para lançar extras.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {authorizedCompanies.length > 0 ? (
          authorizedCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-effect border-white/20 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="p-4 bg-green-500/20 rounded-lg mb-4">
                    <Building className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">{company.name}</h3>
                  <p className="text-sm text-gray-400">CNPJ: {company.cnpj || 'N/A'}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="glass-effect border-white/20 text-center py-12">
              <CardContent>
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white">Nenhuma empresa autorizada</h3>
                <p className="text-gray-400 mt-2">
                  Você ainda não foi autorizado a lançar extras para nenhuma empresa.
                </p>
                <p className="text-gray-400 mt-1">
                  Por favor, entre em contato com um gestor.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorizedCompanies;

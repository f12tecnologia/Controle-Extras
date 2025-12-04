import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

const ReportsList = ({ filteredExtras, formatCurrency, users = [] }) => {
  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00').toLocaleDateString('pt-BR');
  };
  
  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : `ID: ${userId?.substring(0, 8)}...`;
  }

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Resultados do Relatório</CardTitle>
        <CardDescription className="text-gray-300">
          {filteredExtras.length} registro(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredExtras.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum resultado encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Ajuste os filtros para visualizar os dados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExtras.map((extra, index) => (
              <motion.div
                key={extra.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-white">{extra.nomeExtra || 'Nome não disponível'}</h3>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {extra.setor}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {getUserEmail(extra.userId)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-400">Data:</span>
                        <p className="text-white">{formatDate(extra.data)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Vaga:</span>
                        <p className="text-white">{extra.vaga}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Horário:</span>
                        <p className="text-white">{extra.horario}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Empresa:</span>
                        <p className="text-white">{extra.empresa}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Valor:</span>
                        <p className="text-green-400 font-semibold">{formatCurrency(parseFloat(extra.valor))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsList;
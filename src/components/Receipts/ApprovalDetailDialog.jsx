import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check, Info } from 'lucide-react';

const ApprovalDetailDialog = ({ isOpen, onClose, data, onBulkUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data || !data.employee) {
    return null;
  }

  const { employee, company, requester, details } = data;

  const totalValue = details.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
  const extraIds = details.map(item => item.id);

  const handleAction = async (status) => {
    setIsSubmitting(true);
    await onBulkUpdate(extraIds, status);
    setIsSubmitting(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const formatTime = (time) => time || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-slate-900 border-white/20 text-white p-0">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle>Extra - {employee.name}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4 h-8 w-8 rounded-full p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-400">Funcionário</p>
              <p className="font-medium">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Empresa</p>
              <p className="font-medium">{company?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Solicitante</p>
              <p className="font-medium">{requester?.user_metadata?.name || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Detalhes das Datas</h3>
            <div className="space-y-3">
              {details.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm items-center">
                    <div>
                      <p className="text-xs text-gray-400">Data</p>
                      <p className="font-medium">{formatDate(item.data_evento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Atração</p>
                      <p className="font-medium">{item.setor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cargo</p>
                      <p className="font-medium">{item.vaga}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Horário</p>
                      <p className="font-medium">{formatTime(item.hora_entrada)} - {formatTime(item.hora_saida)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Valor</p>
                      <p className="font-semibold text-lg text-purple-400">{formatCurrency(parseFloat(item.valor || 0))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center bg-slate-900/50 gap-4">
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-200 mr-2">Valor Total:</p>
            <p className="text-2xl font-bold gradient-text">{formatCurrency(totalValue)}</p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleAction('ciente')} disabled={isSubmitting}>
              <Info className="w-4 h-4 mr-2" /> {isSubmitting ? 'Processando...' : 'Ciente'}
            </Button>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleAction('aprovado')} disabled={isSubmitting}>
              <Check className="w-4 h-4 mr-2" /> {isSubmitting ? 'Processando...' : 'Aprovar'}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleAction('rejeitado')} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> {isSubmitting ? 'Processando...' : 'Rejeitar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetailDialog;
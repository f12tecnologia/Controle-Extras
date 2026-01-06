import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { replitDb } from '@/lib/replitDbClient';

const EmployeeForm = ({ isOpen, onClose, onSubmitSuccess, employee }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    telefone: '',
    pix_key: '',
    banco: '',
    ativo: true,
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!employee;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: employee.name || '',
        cpf: employee.cpf || '',
        telefone: employee.telefone || '',
        pix_key: employee.pix_key || employee.chavePix || '',
        banco: employee.banco || '',
        ativo: employee.ativo !== undefined ? employee.ativo : true,
      });
    } else {
      setFormData({
        name: '',
        cpf: '',
        telefone: '',
        pix_key: '',
        banco: '',
        ativo: true,
      });
    }
  }, [employee, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };
  
  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await replitDb.updateEmployee(employee.id, formData);
      } else {
        await replitDb.createEmployee(formData);
      }

      toast({
        title: `Funcionário ${isEditing ? 'atualizado' : 'cadastrado'}!`,
        description: "Os dados foram salvos com sucesso.",
      });
      onSubmitSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao salvar o funcionário: ${error.message}`,
        variant: "destructive",
      });
    }
    setLoading(false);
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha os dados para {isEditing ? 'atualizar' : 'cadastrar'} um funcionário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                className="input-glow bg-white/10 border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="input-glow bg-white/10 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', formatTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="input-glow bg-white/10 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input
                id="pix_key"
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                placeholder="email@exemplo.com ou chave"
                className="input-glow bg-white/10 border-white/20"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                value={formData.banco}
                onChange={(e) => handleInputChange('banco', e.target.value)}
                placeholder="Nome do banco"
                className="input-glow bg-white/10 border-white/20"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
              <Label htmlFor="ativo">Funcionário ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="text-white border-white/20 hover:bg-white/10">
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Funcionário')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { replitDb } from '@/lib/replitDbClient';

const CompanyForm = ({ company, onSave, children }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    ativa: true,
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isEditing = !!company;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          name: company.name || '',
          cnpj: company.cnpj || '',
          ativa: company.ativa !== undefined ? company.ativa : true,
        });
      } else {
        setFormData({ name: '', cnpj: '', ativa: true });
      }
    }
  }, [company, open, isEditing]);

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCnpjChange = (e) => {
    setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = { 
        name: formData.name,
        cnpj: formData.cnpj || null,
        ativa: formData.ativa
      };

      if (isEditing) {
        await replitDb.updateCompany(company.id, dataToSave);
      } else {
        await replitDb.createCompany(dataToSave);
      }

      toast({ title: `Empresa ${isEditing ? 'atualizada' : 'cadastrada'}!`, description: "Os dados foram salvos com sucesso." });
      onSave();
      setOpen(false);
    } catch (error) {
      toast({ title: "Erro ao salvar empresa", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados para {isEditing ? 'editar a' : 'cadastrar uma nova'} empresa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-left">Nome da Empresa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-glow bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-left">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={handleCnpjChange}
                className="input-glow bg-slate-800 border-slate-700"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativa"
                checked={formData.ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
              />
              <Label htmlFor="ativa">Empresa ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Empresa')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyForm;

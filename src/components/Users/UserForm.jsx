import React, { useState, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { replitDb } from '@/lib/replitDbClient';
import { useAuth } from '@/contexts/ReplitAuthContext';

const UserForm = ({ isOpen, onClose, onSubmitSuccess, user }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lançador',
    setor: '',
    authorizedCompanyIds: [],
    active: true,
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!user;
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  const fetchInitialData = useCallback(async () => {
    try {
      const companiesData = await replitDb.getAllCompanies();
      setCompanies(companiesData.filter(c => c.ativa) || []);
    } catch (error) {
      toast({ title: "Erro ao buscar empresas", description: error.message, variant: "destructive" });
    }

    if (isEditing) {
      const authorizedIds = user.authorized_company_ids ? 
        (typeof user.authorized_company_ids === 'string' ? JSON.parse(user.authorized_company_ids) : user.authorized_company_ids) 
        : [];

      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'lançador',
        setor: user.setor || '',
        authorizedCompanyIds: authorizedIds,
        active: true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'lançador',
        setor: '',
        authorizedCompanyIds: [],
        active: true,
      });
    }
  }, [user, isEditing, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, fetchInitialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (companyId) => {
    setFormData(prev => {
      const newAuthorizedCompanyIds = prev.authorizedCompanyIds.includes(companyId)
        ? prev.authorizedCompanyIds.filter(id => id !== companyId)
        : [...prev.authorizedCompanyIds, companyId];
      return { ...prev, authorizedCompanyIds: newAuthorizedCompanyIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await replitDb.updateUser(user.email, {
          name: formData.name,
          role: formData.role,
          setor: formData.setor,
          authorizedCompanyIds: formData.authorizedCompanyIds,
        });
        toast({ title: "Usuário atualizado!", description: "Os dados foram salvos." });
      } else {
        await replitDb.createUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          setor: formData.setor,
          authorizedCompanyIds: formData.authorizedCompanyIds,
        });
        toast({ title: "Usuário cadastrado!", description: "O novo usuário foi adicionado." });
      }
      onSubmitSuccess();
    } catch (error) {
      toast({
        title: "Erro ao salvar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha os dados para {isEditing ? 'editar o' : 'criar um novo'} usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="input-glow" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="input-glow" required disabled={isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="input-glow" required={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuário</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="input-glow">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lançador">Lançador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  {isCurrentUserAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input id="setor" value={formData.setor} onChange={(e) => handleInputChange('setor', e.target.value)} placeholder="Ex: Gerência Financeiro, RH, etc." className="input-glow" />
            </div>
            {(formData.role === 'lançador' || formData.role === 'gestor') && (
              <>
                <div className="space-y-2">
                  <Label>Empresas Autorizadas</Label>
                  <div className="space-y-2 p-3 rounded-md bg-slate-800/50 max-h-32 overflow-y-auto">
                    {companies.map(company => (
                      <div key={company.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`company-${company.id}`}
                          checked={formData.authorizedCompanyIds.includes(company.id)}
                          onCheckedChange={() => handleCompanyChange(company.id)}
                        />
                        <Label htmlFor={`company-${company.id}`} className="font-normal">{company.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleInputChange('active', checked)} />
              <Label htmlFor="active">Usuário ativo</Label>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="text-white border-white/20 hover:bg-white/10">
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Usuário')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;

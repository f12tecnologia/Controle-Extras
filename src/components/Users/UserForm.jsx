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
import { supabase } from '@/lib/customSupabaseClient';
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
  const isCurrentUserAdmin = currentUser?.user_metadata?.role === 'admin';

  const fetchInitialData = useCallback(async () => {
    // Fetch all companies for the form
    const { data: companiesData, error: companiesError } = await supabase.from('companies_view').select('id, name').eq('ativa', true);
    if (companiesError) {
      toast({ title: "Erro ao buscar empresas", description: companiesError.message, variant: "destructive" });
    } else {
      setCompanies(companiesData || []);
    }

    // If editing, fetch the user's current authorized companies
    if (isEditing) {
      const { data: authData, error: authError } = await supabase
        .from('user_empresas')
        .select('company_id')
        .eq('user_id', user.id);
      
      const authorizedIds = authError ? [] : authData.map(item => item.company_id);

      setFormData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        password: '',
        role: user.user_metadata?.role || 'lançador',
        setor: user.user_metadata?.setor || '',
        authorizedCompanyIds: authorizedIds,
        active: !user.banned_until,
      });
    } else {
      // Reset for new user
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
        const body = {
          userId: user.id,
          role: formData.role,
          name: formData.name,
          setor: formData.setor,
          active: formData.active,
          authorizedCompanyIds: formData.authorizedCompanyIds,
        };
        if (formData.password) {
          body.password = formData.password;
        }

        const { error } = await supabase.functions.invoke('update-user-role', { body });

        if (error) throw new Error(error.message);

        toast({ title: "Usuário atualizado!", description: "Os dados foram salvos." });
      } else {
        // For new users, create the user first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
              setor: formData.setor,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        // Then, link companies to the new user
        const newUserId = signUpData.user.id;
        if (formData.authorizedCompanyIds.length > 0) {
            const companyLinks = formData.authorizedCompanyIds.map(companyId => ({
                user_id: newUserId,
                company_id: companyId
            }));
            const { error: linkError } = await supabase.from('user_empresas').insert(companyLinks);
            if (linkError) throw linkError;
        }

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
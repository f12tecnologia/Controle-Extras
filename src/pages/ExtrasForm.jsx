import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ReplitAuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

const initialExtraState = {
  data_evento: new Date().toISOString().split('T')[0],
  hora_entrada: '00:00',
  hora_saida: '00:00',
  setor: '',
  vaga: '',
  valor: 0
};

const ExtrasForm = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    id
  } = useParams(); // ID is for a single extra, so multi-add is disabled in edit mode
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [extras, setExtras] = useState([initialExtraState]);
  const totalValue = extras.reduce((acc, extra) => acc + parseFloat(extra.valor || 0), 0);
  const handleExtraChange = (index, field, value) => {
    const newExtras = [...extras];
    newExtras[index][field] = value;
    setExtras(newExtras);
  };
  const addExtra = () => {
    setExtras([...extras, {
      ...initialExtraState
    }]);
  };
  const removeExtra = index => {
    if (extras.length > 1) {
      const newExtras = extras.filter((_, i) => i !== index);
      setExtras(newExtras);
    }
  };
  const fetchDropdownData = useCallback(async () => {
    if (!user) return;
    try {
      const {
        data: employeesData,
        error: employeesError
      } = await supabase.from('employees').select('id, name');
      if (employeesError) throw employeesError;
      setEmployees(employeesData);

      // Use the new RPC to get authorized companies
      const {
        data: companiesData,
        error: companiesError
      } = await supabase.rpc('get_my_companies');
      if (companiesError) throw companiesError;
      setCompanies(companiesData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar funcionários ou empresas autorizadas."
      });
    }
  }, [toast, user]);
  const loadExtraForEdit = useCallback(async extraId => {
    if (!user) return;
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('extras').select('*').eq('id', extraId).eq('user_id', user.id).single();
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar extra",
          description: "Você não tem permissão para editar este extra ou ele não existe."
        });
        navigate('/my-extras');
        return;
      }
      setEmployeeId(data.employee_id.toString());
      setCompanyId(data.company_id.toString());
      setExtras([{
        data_evento: data.data_evento,
        hora_entrada: data.hora_entrada,
        hora_saida: data.hora_saida,
        setor: data.setor,
        vaga: data.vaga,
        valor: data.valor
      }]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os dados do extra."
      });
    } finally {
      setLoading(false);
    }
  }, [user, navigate, toast]);
  useEffect(() => {
    fetchDropdownData();
    if (id) {
      loadExtraForEdit(id);
    }
  }, [id, fetchDropdownData, loadExtraForEdit]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!user || !employeeId || !companyId) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, selecione um funcionário e uma empresa."
      });
      return;
    }
    setLoading(true);
    try {
      if (id) {
        // Edit mode (single extra)
        const payload = {
          ...extras[0],
          employee_id: employeeId,
          company_id: companyId,
          user_id: user.id,
          status: 'pendente'
        };
        const {
          error
        } = await supabase.from('extras').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        // Create mode (multiple extras)
        const payloads = extras.map(extra => ({
          ...extra,
          employee_id: employeeId,
          company_id: companyId,
          user_id: user.id,
          status: 'pendente'
        }));
        const {
          error
        } = await supabase.from('extras').insert(payloads);
        if (error) throw error;
      }
      toast({
        title: `Extras ${id ? 'atualizados' : 'cadastrados'}!`,
        description: `Os lançamentos foram salvos com sucesso.`
      });
      navigate('/my-extras');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: `Ocorreu um erro: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">{id ? 'Editar Extra' : 'Cadastrar Extras'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-effect border-white/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employee_id" className="text-white">Funcionário *</Label>
                <Select required value={employeeId} onValueChange={setEmployeeId} disabled={!!id}>
                  <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white"><SelectValue placeholder="Selecione um funcionário" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">{employees.map(emp => <SelectItem key={emp.id} value={emp.id.toString()} className="text-white hover:bg-white/10">{emp.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id" className="text-white">Empresa *</Label>
                <Select required value={companyId} onValueChange={setCompanyId} disabled={!!id}>
                  <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white"><SelectValue placeholder="Selecione a empresa autorizada" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">{companies.length > 0 ? companies.map(company => <SelectItem key={company.id} value={company.id.toString()} className="text-white hover:bg-white/10">{company.name}</SelectItem>) : <div className="text-sm text-gray-400 p-2">Nenhuma empresa autorizada.</div>}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {extras.map((extra, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
              <Card className="glass-effect border-white/20 relative">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Lançamento #{index + 1}</CardTitle>
                   {!id && <Button type="button" variant="ghost" size="icon" onClick={() => removeExtra(index)} disabled={extras.length <= 1} className="absolute top-4 right-4 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </Button>}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2 lg:col-span-3">
                      <Label htmlFor={`data_evento-${index}`} className="text-white">Data *</Label>
                      <Input id={`data_evento-${index}`} type="date" value={extra.data_evento} onChange={e => handleExtraChange(index, 'data_evento', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hora_entrada-${index}`} className="text-white">Hora de Entrada *</Label>
                      <Input id={`hora_entrada-${index}`} type="time" value={extra.hora_entrada} onChange={e => handleExtraChange(index, 'hora_entrada', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hora_saida-${index}`} className="text-white">Hora de Saída *</Label>
                      <Input id={`hora_saida-${index}`} type="time" value={extra.hora_saida} onChange={e => handleExtraChange(index, 'hora_saida', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`valor-${index}`} className="text-white">Valor (R$) *</Label>
                      <Input id={`valor-${index}`} type="number" step="0.01" min="0" value={extra.valor} onChange={e => handleExtraChange(index, 'valor', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="0.00" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`setor-${index}`} className="text-white">Atração</Label>
                      <Input id={`setor-${index}`} value={extra.setor} onChange={e => handleExtraChange(index, 'setor', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="Ex: Palco Principal" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`vaga-${index}`} className="text-white">Cargo</Label>
                      <Input id={`vaga-${index}`} value={extra.vaga} onChange={e => handleExtraChange(index, 'vaga', e.target.value)} className="input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="Ex: Técnico de Som" required />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>

        {!id && <Button type="button" variant="outline" size="sm" onClick={addExtra} className="w-full border-dashed border-white/30 text-gray-300 hover:bg-white/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Lançamento
          </Button>}

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-white text-lg">
            <span className="font-semibold">Valor Total:</span>
            <span className="ml-2 font-bold text-purple-400">R$ {totalValue.toFixed(2)}</span>
          </div>
          <Button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : `Salvar ${id ? 'Alterações' : `${extras.length} Extra(s)`}`}</span>
          </Button>
        </div>
      </form>
    </div>;
};
export default ExtrasForm;
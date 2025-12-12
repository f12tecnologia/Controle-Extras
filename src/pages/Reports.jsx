import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/ReplitAuthContext';
import ReportsFilters from '@/components/Reports/ReportsFilters.jsx';
import ReportsStats from '@/components/Reports/ReportsStats.jsx';
import ReportsList from '@/components/Reports/ReportsList.jsx';

const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [extras, setExtras] = useState([]);
  const [filteredExtras, setFilteredExtras] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    setor: '',
    company_id: '',
    user_id: ''
  });

  const [reportType, setReportType] = useState('daily');

  const loadInitialData = useCallback(async () => {
    // Fetch companies
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    } else {
      setCompanies(companiesData);
    }

    // Fetch users (only gestor can see all users)
    if (user?.user_metadata?.role === 'gestor') {
       const { data: usersData , error: usersError } = await supabase.functions.invoke('list-users');
        if (usersError) {
            console.error('Error fetching users:', usersError);
        } else {
            setUsers(usersData.map(u => ({ id: u.id, email: u.email, name: u.user_metadata?.name })));
        }
    }
  }, [user]);

  const loadExtras = useCallback(async () => {
    let query = supabase.from('extras').select(`
      *,
      companies (name),
      employees (name)
    `);

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Erro ao carregar extras",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    const formattedData = data.map(d => ({
        ...d,
        empresa: d.companies?.name,
        nomeExtra: d.employees?.name,
        userId: d.user_id,
    }));

    setExtras(formattedData);
  }, [toast]);

  useEffect(() => {
    loadInitialData();
    loadExtras();
  }, [loadInitialData, loadExtras]);

  const applyFilters = useCallback(() => {
    let filtered = [...extras];

    if (filters.startDate) {
      filtered = filtered.filter(extra => extra.data_evento >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(extra => extra.data_evento <= filters.endDate);
    }

    if (filters.setor) {
      filtered = filtered.filter(extra => extra.setor === filters.setor);
    }

    if (filters.company_id) {
        filtered = filtered.filter(extra => extra.company_id === parseInt(filters.company_id));
    }

    if (filters.user_id) {
        filtered = filtered.filter(extra => extra.user_id === filters.user_id);
    }

    if (reportType === 'daily' && filters.startDate) {
      filtered = filtered.filter(extra => extra.data_evento === filters.startDate);
    } else if (reportType === 'monthly' && filters.startDate) {
      const selectedDate = new Date(filters.startDate + 'T00:00:00');
      const month = selectedDate.getMonth();
      const year = selectedDate.getFullYear();
      filtered = filtered.filter(extra => {
        const extraDate = new Date(extra.data_evento + 'T00:00:00');
        return extraDate.getMonth() === month && extraDate.getFullYear() === year;
      });
    }

    setFilteredExtras(filtered);
  }, [extras, filters, reportType]);
  
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      setor: '',
      company_id: '',
      user_id: ''
    });
  };

  const exportToExcel = () => {
    if (filteredExtras.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Aplique filtros para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    const exportData = filteredExtras.map(extra => ({
      'Data': new Date(extra.data_evento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
      'Nome do Extra': extra.nomeExtra,
      'Atração': extra.setor,
      'Vaga': extra.vaga,
      'Horário': `${extra.hora_entrada} - ${extra.hora_saida}`,
      'Valor': parseFloat(extra.valor),
      'Empresa': extra.empresa,
      'Usuário': users.find(u => u.id === extra.userId)?.name || users.find(u => u.id === extra.userId)?.email || extra.userId
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
     worksheet['!cols'] = [
        { wch: 12 }, // Data
        { wch: 25 }, // Nome do Extra
        { wch: 15 }, // Atração
        { wch: 15 }, // Vaga
        { wch: 15 }, // Horário
        { wch: 15 }, // Valor
        { wch: 20 }, // Empresa
        { wch: 25 }, // Usuário
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Extras');

    const fileName = `relatorio_resumo_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Relatório Resumo exportado!",
      description: `Arquivo ${fileName} foi baixado com sucesso.`,
    });
  };
  
  const exportDetailedReportToExcel = () => {
    if (filteredExtras.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Aplique filtros para gerar o relatório detalhado.",
        variant: "destructive",
      });
      return;
    }

    const exportData = filteredExtras.map(extra => ({
      'Nome': extra.nomeExtra,
      'Data(s)': new Date(extra.data_evento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
      'Horário': `${extra.hora_entrada} - ${extra.hora_saida}`,
      'Atração': extra.setor,
      'Vaga': extra.vaga,
      'Valor Total': parseFloat(extra.valor),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet['!cols'] = [
        { wch: 25 }, // Nome
        { wch: 12 }, // Data(s)
        { wch: 15 }, // Horário
        { wch: 15 }, // Atração
        { wch: 15 }, // Vaga
        { wch: 15 }, // Valor Total
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Detalhado');

    const fileName = `relatorio_detalhado_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Relatório Detalhado exportado!",
      description: `Arquivo ${fileName} foi baixado com sucesso.`,
    });
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUniqueValues = (field) => {
    return [...new Set(extras.map(extra => extra[field]))].filter(Boolean);
  };

  const getStats = () => {
    const totalExtras = filteredExtras.length;
    const totalValue = filteredExtras.reduce((sum, extra) => sum + parseFloat(extra.valor), 0);
    const uniqueUsers = new Set(filteredExtras.map(extra => extra.user_id)).size;
    const uniqueSectors = new Set(filteredExtras.map(extra => extra.setor)).size;

    return { totalExtras, totalValue, uniqueUsers, uniqueSectors };
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Relatórios</h1>
          <p className="text-gray-300 mt-1">Análise completa dos extras cadastrados</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={exportToExcel}
            className="btn-primary-outline flex items-center space-x-2"
            disabled={filteredExtras.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Exportar Resumo</span>
          </Button>
          <Button
            onClick={exportDetailedReportToExcel}
            className="btn-primary flex items-center space-x-2"
            disabled={filteredExtras.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Relatório Detalhado</span>
          </Button>
        </div>
      </div>

      <ReportsStats stats={stats} formatCurrency={formatCurrency} />
      <ReportsFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        reportType={reportType}
        setReportType={setReportType}
        getUniqueValues={getUniqueValues}
        companies={companies}
        users={users}
        currentUser={user}
      />
      <ReportsList filteredExtras={filteredExtras} formatCurrency={formatCurrency} users={users} />
    </div>
  );
};

export default Reports;
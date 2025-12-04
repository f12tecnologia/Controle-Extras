import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const ReportsFilters = ({ filters, handleFilterChange, clearFilters, reportType, setReportType, getUniqueValues, companies, users, currentUser }) => {
  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
        <CardDescription className="text-gray-300">
          Configure os filtros para gerar relatórios personalizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="daily" className="text-white hover:bg-white/10">Diário</SelectItem>
                  <SelectItem value="monthly" className="text-white hover:bg-white/10">Mensal</SelectItem>
                  <SelectItem value="custom" className="text-white hover:bg-white/10">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                {reportType === 'daily' ? 'Data' : reportType === 'monthly' ? 'Mês/Ano' : 'Data Inicial'}
              </Label>
              <Input
                type={reportType === 'monthly' ? 'month' : 'date'}
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-glow bg-white/10 border-white/20 text-white"
              />
            </div>

            {reportType === 'custom' && (
              <div className="space-y-2">
                <Label className="text-white">Data Final</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input-glow bg-white/10 border-white/20 text-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Atração</Label>
              <Select value={filters.setor} onValueChange={(value) => handleFilterChange('setor', value === 'all' ? '' : value)}>
                <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todas as atrações" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">Todas as atrações</SelectItem>
                  {getUniqueValues('setor').map((setor) => (
                    <SelectItem key={setor} value={setor} className="text-white hover:bg-white/10">
                      {setor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Empresa</Label>
              <Select value={filters.company_id} onValueChange={(value) => handleFilterChange('company_id', value === 'all' ? '' : value)}>
                <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">Todas as empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()} className="text-white hover:bg-white/10">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentUser?.user_metadata?.role === 'gestor' && (
              <div className="space-y-2">
                <Label className="text-white">Usuário</Label>
                <Select value={filters.user_id} onValueChange={(value) => handleFilterChange('user_id', value === 'all' ? '' : value)}>
                  <SelectTrigger className="input-glow bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-white/10">Todos os usuários</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-white hover:bg-white/10">
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Button onClick={clearFilters} variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;
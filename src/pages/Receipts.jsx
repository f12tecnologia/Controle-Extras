import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileDown, User, Calendar, CircleDollarSign, Eye, Info, Trash2, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { onCiente, onAprovar, onRejeitar, onDownload, onDeleteReceipt } from '@/helpers/receiptActions';
import ApprovalDetailDialog from '@/components/Receipts/ApprovalDetailDialog';

const Receipts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [extras, setExtras] = useState([]);
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [selectedExtraForDetail, setSelectedExtraForDetail] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [downloadingIds, setDownloadingIds] = useState(new Set());

    const loadData = useCallback(async () => {
        setLoadingExtras(true);
        const { data, error } = await supabase.from('extras').select('*, employees(*), companies(name)');
        
        if (error) {
            toast({ title: "Erro ao carregar extras", description: error.message, variant: "destructive" });
        } else {
            setExtras(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }

        try {
            const { data: usersData, error: usersError } = await supabase.functions.invoke('list-users');
            if (usersError) throw usersError;
            setUsersList(usersData || []);
        } catch (e) {
            toast({ title: "Erro ao buscar usuários", description: e.message, variant: "destructive" });
        }
        
        setLoadingExtras(false);
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAction = async (extraId, actionType) => {
        try {
            switch(actionType) {
                case 'aprovado': 
                    await onAprovar(extraId, usersList);
                    break;
                case 'ciente': 
                    await onCiente(extraId);
                    break;
                case 'rejeitado': 
                    await onRejeitar(extraId);
                    break;
                default: return;
            }
            toast({ title: "Sucesso!", description: `O extra foi marcado como ${actionType}.` });
            loadData();
        } catch (error) {
            toast({ title: `Erro ao ${actionType}`, description: error.message, variant: "destructive" });
        }
    };
    
    const handleBulkAction = async (extraIds, actionType) => {
        if (!extraIds || extraIds.length === 0) return;
        
        let successCount = 0;
        for (const extraId of extraIds) {
            try {
                await handleAction(extraId, actionType);
                successCount++;
            } catch (error) {
                // Error toast is shown in handleAction
            }
        }
        
        if (successCount > 0) {
            toast({ title: "Ação em massa concluída!", description: `${successCount} de ${extraIds.length} extra(s) foram atualizados.` });
            loadData();
        }
    };

    const handleOpenDetailModal = (clickedExtra) => {
        const employeeExtras = extras.filter(e => 
            e.employee_id === clickedExtra.employee_id && 
            (e.status || 'pendente').toLowerCase() === 'pendente'
        );

        if (employeeExtras.length === 0) {
            employeeExtras.push(clickedExtra);
        }

        const firstExtra = employeeExtras[0];
        const requester = usersList.find(u => u.id === firstExtra.user_id);
        
        const aggregatedData = {
            employee: firstExtra.employees,
            company: firstExtra.companies,
            requester: requester,
            details: employeeExtras.map(e => ({
                id: e.id,
                data_evento: e.data_evento,
                hora_entrada: e.hora_entrada,
                hora_saida: e.hora_saida,
                setor: e.setor,
                vaga: e.vaga,
                valor: e.valor,
            })),
        };
        
        setSelectedExtraForDetail(aggregatedData);
        setIsDetailModalOpen(true);
    };

    const handleDownloadPDF = async (extraId) => {
        console.log('🔍 Iniciando download do recibo para extra ID:', extraId);
        
        setDownloadingIds(prev => new Set(prev).add(extraId));
        
        try {
            console.log('📥 Buscando URL do PDF...');
            const pdfUrl = await onDownload(extraId);
            
            if (pdfUrl) {
                console.log('✅ URL do PDF encontrada:', pdfUrl);
                
                // Tentar abrir em nova aba
                const newWindow = window.open(pdfUrl, '_blank');
                
                if (newWindow) {
                    console.log('✅ PDF aberto em nova aba');
                    toast({ 
                        title: "Recibo aberto!", 
                        description: "O recibo foi aberto em uma nova aba." 
                    });
                } else {
                    // Se bloqueado por popup blocker, tentar download direto
                    console.log('⚠️ Popup bloqueado, tentando download direto...');
                    
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `recibo-${extraId}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast({ 
                        title: "Download iniciado!", 
                        description: "O recibo está sendo baixado." 
                    });
                }
            } else {
                console.log('❌ Recibo não encontrado no banco de dados');
                toast({ 
                    title: "Recibo não encontrado", 
                    description: "O recibo para este extra ainda não foi gerado. Tente aprovar novamente.", 
                    variant: "destructive" 
                });
            }
        } catch (error) {
            console.error('❌ Erro ao baixar PDF:', error);
            toast({ 
                title: "Erro ao baixar recibo", 
                description: error.message || "Ocorreu um erro ao tentar baixar o recibo.", 
                variant: "destructive" 
            });
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(extraId);
                return newSet;
            });
        }
    };

    const handleDeleteReceipt = async (extraId) => {
        if (window.confirm("Tem certeza que deseja excluir este recibo? Esta ação é irreversível.")) {
            try {
                await onDeleteReceipt(extraId);
                toast({ title: "Sucesso!", description: "Recibo excluído com sucesso." });
                loadData();
            } catch (error) {
                toast({ title: "Erro ao excluir recibo", description: error.message, variant: "destructive" });
            }
        }
    };

    const getStatusBadge = (status) => {
        const lowerCaseStatus = (status || 'pendente').toLowerCase();
        switch (lowerCaseStatus) {
            case 'aprovado':
                return <Badge className="bg-green-500/80 text-white">Aprovado</Badge>;
            case 'rejeitado':
                return <Badge variant="destructive">Rejeitado</Badge>;
            case 'ciente':
                return <Badge className="bg-blue-500/80 text-white">Ciente</Badge>;
            case 'pendente':
            default:
                return <Badge className="bg-amber-500/80 text-white">Pendente</Badge>;
        }
    };
    
    const isGestor = user?.user_metadata?.role === 'gestor';
    const isAdmin = user?.user_metadata?.role === 'admin';

    const filteredExtras = extras;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Recibos e Aprovações</h1>
                    <p className="text-gray-300 mt-1">
                        {isGestor || isAdmin ? 'Aprove, rejeite ou marque como ciente os lançamentos para liberar os recibos.' : 'Visualize os recibos dos seus extras.'}
                    </p>
                </div>
            </div>

            {loadingExtras ? (
                 <Card className="glass-effect border-white/20 text-center py-12">
                     <CardContent><p className="text-white">Carregando recibos...</p></CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {filteredExtras.length > 0 ? 
                     filteredExtras.map((extra, index) => (
                        <motion.div
                            key={extra.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="glass-effect border-white/20">
                                <CardHeader className="flex flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-white flex items-center gap-2"><User size={16} />{extra.employees?.name || 'Funcionário não encontrado'}</CardTitle>
                                        <CardDescription className="text-gray-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="flex items-center gap-1"><Calendar size={14}/>Criado em: {new Date(extra.created_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1"><CircleDollarSign size={14}/>Total: R$ {(extra.valor || 0).toFixed(2)}</span>
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(extra.status)}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" size="sm" className="btn-outline-primary" onClick={() => handleOpenDetailModal(extra)}>
                                            <Eye className="w-4 h-4 mr-2" /> Detalhar
                                        </Button>
                                        
                                        {(isGestor || isAdmin) && (extra.status || 'pendente').toLowerCase() === 'pendente' && (
                                            <>
                                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleAction(extra.id, 'ciente')}>
                                                    <Info className="w-4 h-4 mr-2" /> Ciente
                                                </Button>
                                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleAction(extra.id, 'aprovado')}>
                                                    <Check className="w-4 h-4 mr-2" /> Aprovar
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleAction(extra.id, 'rejeitado')}>
                                                    <X className="w-4 h-4 mr-2" /> Rejeitar
                                                </Button>
                                            </>
                                        )}

                                        {((extra.status || '').toLowerCase() === 'aprovado' || (extra.status || '').toLowerCase() === 'ciente') && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    className="btn-primary" 
                                                    onClick={() => handleDownloadPDF(extra.id)}
                                                    disabled={downloadingIds.has(extra.id)}
                                                >
                                                    {downloadingIds.has(extra.id) ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Baixando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileDown className="w-4 h-4 mr-2" />
                                                            Baixar Recibo (PDF)
                                                        </>
                                                    )}
                                                </Button>
                                                {(isGestor || isAdmin) && (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteReceipt(extra.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )) : (
                         <Card className="glass-effect border-white/20 text-center py-12">
                             <CardContent>
                                <h3 className="text-xl font-semibold text-white">Nenhum item disponível</h3>
                                <p className="text-gray-400 mt-2">
                                    {isGestor || isAdmin ? 'Não há lançamentos para exibir.' : 'Não há extras disponíveis para as empresas que você tem acesso.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
            
            {selectedExtraForDetail && <ApprovalDetailDialog
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={selectedExtraForDetail}
                onBulkUpdate={handleBulkAction}
            />}
        </div>
    );
};

export default Receipts;
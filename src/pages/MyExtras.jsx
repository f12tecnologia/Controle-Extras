import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, FileDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { onDownload } from '@/helpers/receiptActions';

const MyExtras = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [extras, setExtras] = useState([]);
    const [loadingExtras, setLoadingExtras] = useState(true);

    const loadMyExtras = useCallback(async () => {
        if (!user) return;
        setLoadingExtras(true);
        const { data, error } = await supabase
            .from('extras')
            .select('*, companies(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: "Erro ao carregar extras", description: error.message, variant: "destructive" });
        } else {
            setExtras(data);
        }
        setLoadingExtras(false);
    }, [user, toast]);

    useEffect(() => {
        loadMyExtras();
    }, [loadMyExtras]);
    
    const handleDownloadPDF = async (extraId) => {
        try {
            const pdfUrl = await onDownload(extraId);
            if (pdfUrl) {
                window.open(pdfUrl, '_blank');
            } else {
                toast({ title: "Recibo não encontrado", description: "O recibo para este extra ainda não foi gerado ou você não tem permissão para vê-lo.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Erro ao baixar PDF", description: error.message, variant: "destructive" });
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Meus Lançamentos</h1>
                    <p className="text-gray-300 mt-1">Visualize e gerencie seus lançamentos de horas extras.</p>
                </div>
                <Link to="/extras/new">
                    <Button className="btn-primary flex items-center gap-2">
                        <Plus size={18} /> Novo Lançamento
                    </Button>
                </Link>
            </div>

            {loadingExtras ? (
                 <Card className="glass-effect border-white/20 text-center py-12">
                     <CardContent><p className="text-white">Carregando seus lançamentos...</p></CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {extras.length > 0 ? extras.map((extra, index) => (
                        <motion.div
                            key={extra.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="glass-effect border-white/20">
                                <CardHeader className="flex flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-white">
                                            {extra.companies?.name || 'Empresa não encontrada'}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400 mt-1">
                                            Data: {new Date(extra.data_evento).toLocaleDateString('pt-BR')} - R$ {(extra.valor || 0).toFixed(2)}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(extra.status)}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end space-x-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                            onClick={() => navigate(`/extras/edit/${extra.id}`)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" /> Editar
                                        </Button>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                        </Button>
                                         {((extra.status || '').toLowerCase() === 'aprovado' || (extra.status || '').toLowerCase() === 'ciente') && (
                                            <Button size="sm" className="btn-primary" onClick={() => handleDownloadPDF(extra.id)}>
                                                <FileDown className="w-4 h-4 mr-2" /> Baixar Recibo (PDF)
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )) : (
                         <Card className="glass-effect border-white/20 text-center py-12">
                             <CardContent>
                                <h3 className="text-xl font-semibold text-white">Nenhum lançamento encontrado</h3>
                                <p className="text-gray-400 mt-2">Você ainda não cadastrou nenhuma hora extra.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyExtras;
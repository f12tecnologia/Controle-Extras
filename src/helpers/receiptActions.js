import { supabase } from '@/lib/customSupabaseClient';
import { buildReceiptPDF } from '@/helpers/pdf';

async function fetchExtraForReceipt(extraId, usersList) {
  console.log('📋 Buscando dados do extra:', extraId);
  
  const { data: ex, error: exErr } = await supabase
    .from('ex')
    .select('id, setor, atr, eid, fid, approved_by, aprovado_em, cie, ciem')
    .eq('id', extraId)
    .maybeSingle();
  
  if (exErr) {
    console.error('❌ Erro ao buscar extra:', exErr);
    throw exErr;
  }
  
  if (!ex) {
    console.error('❌ Extra não encontrado');
    throw new Error('Extra não encontrado');
  }
  
  console.log('✅ Extra encontrado:', ex);

  const [{ data: company }, { data: employee }, { data: items }] = await Promise.all([
    supabase.from('companies').select('id, name').eq('id', ex.eid).maybeSingle(),
    supabase.from('fu').select('id, nome, cpf, pix, banco_label').eq('id', ex.fid).maybeSingle(),
    supabase.from('xi').select('d, ein, eout, v').eq('xid', extraId),
  ]);

  console.log('📊 Dados carregados - Empresa:', company, 'Funcionário:', employee, 'Items:', items);

  if (!company || !employee || !items || items.length === 0) {
    console.error('❌ Dados incompletos:', { company, employee, items });
    throw new Error('Dados incompletos para recibo');
  }

  const total = (items || []).reduce((s, i) => s + Number(i.v || 0), 0);

  const getName = (uid) => {
    if (!uid || !usersList) return undefined;
    const user = usersList.find(u => u.id === uid);
    return user?.user_metadata?.name;
  };

  const approverName = getName(ex.approved_by);
  const cienteName = getName(ex.cie);

  return {
    extra: {
        ...ex,
        vaga: ex.atr,
        aprovado_em: ex.aprovado_em,
        acknowledged_at: ex.ciem
    },
    company,
    employee: { 
        id: employee.id,
        name: employee.nome, 
        cpf: employee.cpf, 
        chavePix: employee.pix, 
        banco: employee.banco_label 
    },
    items: items.map(i => ({
      d: i.d,
      ein: i.ein ?? undefined,
      eout: i.eout ?? undefined,
      v: Number(i.v || 0),
    })),
    total,
    approver: approverName ? { name: approverName } : undefined,
    acknowledger: cienteName ? { name: cienteName } : undefined,
  };
}

async function createReceipt(extraId, usersList) {
  console.log('📝 Criando recibo para extra:', extraId);
  
  const data = await fetchExtraForReceipt(extraId, usersList);
  console.log('✅ Dados do recibo preparados');
  
  const blob = buildReceiptPDF(data);
  console.log('✅ PDF gerado, tamanho:', blob.size, 'bytes');

  const filePath = `recibos/${extraId}.pdf`;
  console.log('📤 Fazendo upload para:', filePath);
  
  const { error: upErr } = await supabase.storage.from('recibos').upload(filePath, blob, {
    upsert: true,
    contentType: 'application/pdf',
  });
  
  if (upErr) {
    console.error('❌ Erro no upload:', upErr);
    throw upErr;
  }
  
  console.log('✅ Upload concluído');

  const { data: pub } = supabase.storage.from('recibos').getPublicUrl(filePath);
  const pdfUrl = pub?.publicUrl;
  
  console.log('🔗 URL pública gerada:', pdfUrl);

  const total = data.total;

  const { error: insErr } = await supabase
    .from('recibos')
    .upsert({ extra_id: extraId, pdf_url: pdfUrl, total }, { onConflict: 'extra_id' });
  
  if (insErr) {
    console.error('❌ Erro ao salvar registro do recibo:', insErr);
    throw insErr;
  }
  
  console.log('✅ Registro do recibo salvo no banco de dados');

  return pdfUrl;
}

export async function onCiente(extraId) {
  console.log('ℹ️ Marcando extra como ciente:', extraId);
  const { error } = await supabase.rpc('ex_mark_ciente', { p_extra_id: extraId });
  if (error) {
    console.error('❌ Erro ao marcar como ciente:', error);
    throw error;
  }
  console.log('✅ Extra marcado como ciente');
}

export async function onAprovar(extraId, usersList) {
  console.log('✅ Aprovando extra:', extraId);
  const { error } = await supabase.rpc('ex_approve', { p_extra_id: extraId });
  if (error) {
    console.error('❌ Erro ao aprovar:', error);
    throw error;
  }
  console.log('✅ Extra aprovado, gerando recibo...');

  await createReceipt(extraId, usersList);
  console.log('✅ Processo de aprovação concluído');
}

export async function onRejeitar(extraId) {
  console.log('❌ Rejeitando extra:', extraId);
  const { error } = await supabase.rpc('ex_reject', { p_extra_id: extraId });
  if (error) {
    console.error('❌ Erro ao rejeitar:', error);
    throw error;
  }
  console.log('✅ Extra rejeitado');
}

export async function onDownload(extraId) {
    console.log('📥 Buscando recibo para download:', extraId);
    
    const { data, error } = await supabase
        .from('recibos')
        .select('pdf_url')
        .eq('extra_id', extraId)
        .maybeSingle();

    if (error) {
        console.error('❌ Erro ao buscar recibo:', error);
        throw error;
    }
    
    if (data && data.pdf_url) {
        console.log('✅ Recibo encontrado:', data.pdf_url);
        return data.pdf_url;
    }
    
    console.log('⚠️ Recibo não encontrado no banco de dados');
    return null;
}

export async function onDeleteReceipt(extraId) {
    console.log('🗑️ Excluindo recibo:', extraId);
    
    // 1. Get the PDF URL to delete the file from storage
    const { data: receiptData, error: fetchError } = await supabase
        .from('recibos')
        .select('pdf_url')
        .eq('extra_id', extraId)
        .maybeSingle();

    if (fetchError) {
        console.error('❌ Erro ao buscar recibo para exclusão:', fetchError);
        throw fetchError;
    }

    if (receiptData && receiptData.pdf_url) {
        console.log('📄 URL do recibo:', receiptData.pdf_url);
        
        // Extract file path from URL
        const urlParts = receiptData.pdf_url.split('/');
        const filePathIndex = urlParts.indexOf('recibos');
        
        if (filePathIndex !== -1) {
            const filePath = urlParts.slice(filePathIndex).join('/');
            console.log('🗂️ Caminho do arquivo:', filePath);

            // 2. Delete the file from Supabase Storage
            const { error: storageError } = await supabase.storage.from('recibos').remove([filePath]);
            if (storageError) {
                console.error('⚠️ Erro ao excluir arquivo do storage:', storageError.message);
            } else {
                console.log('✅ Arquivo excluído do storage');
            }
        }
    }

    // 3. Delete the record from the 'recibos' table
    const { error: deleteError } = await supabase
        .from('recibos')
        .delete()
        .eq('extra_id', extraId);

    if (deleteError) {
        console.error('❌ Erro ao excluir registro do recibo:', deleteError);
        throw deleteError;
    }
    
    console.log('✅ Registro do recibo excluído do banco de dados');
}
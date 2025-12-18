import { replitDb } from '@/lib/replitDbClient';
import { buildReceiptPDF } from '@/helpers/pdf';

async function fetchExtraForReceipt(extraId) {
  console.log('📋 Buscando dados do extra:', extraId);
  
  try {
    const response = await fetch(`http://localhost:3001/api/extras/${extraId}`);
    if (!response.ok) throw new Error('Extra não encontrado');
    const extra = await response.json();
    
    if (!extra) throw new Error('Extra não encontrado');
    console.log('✅ Extra encontrado:', extra);
    
    const [employee, company] = await Promise.all([
      fetch(`http://localhost:3001/api/employees/${extra.employee_id}`).then(r => r.json()),
      fetch(`http://localhost:3001/api/companies/${extra.company_id}`).then(r => r.json())
    ]);
    
    if (!company || !employee) {
      throw new Error('Dados incompletos para recibo');
    }
    
    return {
      extra: {
        ...extra,
        vaga: extra.vaga,
        aprovado_em: extra.created_at
      },
      company: { id: company.id, name: company.name },
      employee: { 
        id: employee.id,
        name: employee.name, 
        cpf: employee.cpf, 
        chavePix: employee.pix_key || '', 
        banco: employee.banco || '' 
      },
      items: [{
        d: extra.data_evento,
        ein: extra.hora_entrada,
        eout: extra.hora_saida,
        v: parseFloat(extra.valor || 0),
      }],
      total: parseFloat(extra.valor || 0),
      approver: { name: 'Gestor' },
      acknowledger: undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar extra:', error);
    throw error;
  }
}

async function createReceipt(extraId, usersList) {
  console.log('📝 Criando recibo para extra:', extraId);
  
  try {
    const data = await fetchExtraForReceipt(extraId);
    console.log('✅ Dados do recibo preparados');
    
    const blob = buildReceiptPDF(data);
    console.log('✅ PDF gerado, tamanho:', blob.size, 'bytes');
    
    // Converter blob para data URL
    const reader = new FileReader();
    const pdfUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    console.log('✅ PDF convertido para data URL');
    const total = data.total;
    
    // Salvar no backend
    const response = await fetch('http://localhost:3001/api/recibos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extra_id: extraId, pdf_url: pdfUrl, total })
    });
    
    if (!response.ok) throw new Error('Erro ao salvar recibo');
    console.log('✅ Recibo salvo no banco de dados');
    
    return pdfUrl;
  } catch (error) {
    console.error('❌ Erro ao criar recibo:', error);
    throw error;
  }
}

export async function onCiente(extraId) {
  console.log('ℹ️ Marcando extra como ciente:', extraId);
  try {
    const response = await fetch(`http://localhost:3001/api/extras/${extraId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ciente' })
    });
    if (!response.ok) throw new Error('Erro ao marcar como ciente');
    console.log('✅ Extra marcado como ciente');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

export async function onAprovar(extraId, usersList) {
  console.log('✅ Aprovando extra:', extraId);
  try {
    const response = await fetch(`http://localhost:3001/api/extras/${extraId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aprovado' })
    });
    if (!response.ok) throw new Error('Erro ao aprovar');
    console.log('✅ Extra aprovado, gerando recibo...');
    
    await createReceipt(extraId, usersList);
    console.log('✅ Processo de aprovação concluído');
  } catch (error) {
    console.error('❌ Erro ao aprovar:', error);
    throw error;
  }
}

export async function onRejeitar(extraId) {
  console.log('❌ Rejeitando extra:', extraId);
  try {
    const response = await fetch(`http://localhost:3001/api/extras/${extraId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejeitado' })
    });
    if (!response.ok) throw new Error('Erro ao rejeitar');
    console.log('✅ Extra rejeitado');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

export async function onDownload(extraId) {
  console.log('📥 Buscando recibo para download:', extraId);
  
  try {
    const response = await fetch(`http://localhost:3001/api/recibos/${extraId}`);
    
    if (!response.ok || response.status === 404) {
      console.log('⚠️ Recibo não encontrado no banco de dados');
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.pdf_url) {
      console.log('✅ Recibo encontrado');
      return data.pdf_url;
    }
    
    console.log('⚠️ Recibo não encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar recibo:', error);
    throw error;
  }
}

export async function onDeleteReceipt(extraId) {
  console.log('🗑️ Excluindo recibo:', extraId);
  
  try {
    const response = await fetch(`http://localhost:3001/api/recibos/${extraId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erro ao excluir recibo');
    console.log('✅ Recibo excluído');
  } catch (error) {
    console.error('❌ Erro ao excluir:', error);
    throw error;
  }
}

import { buildReceiptPDF } from '@/helpers/pdf';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
  }
  return '/api';
};

async function fetchExtraForReceipt(extraId) {
  const API_URL = getApiUrl();
  console.log('📋 Buscando dados do extra:', extraId, 'usando API:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/extras/${extraId}`);
    if (!response.ok) throw new Error('Extra não encontrado');
    const extra = await response.json();
    
    if (!extra) throw new Error('Extra não encontrado');
    console.log('✅ Extra encontrado:', extra);
    
    const [employee, company] = await Promise.all([
      fetch(`${API_URL}/employees/${extra.employee_id}`).then(r => r.json()),
      fetch(`${API_URL}/companies/${extra.company_id}`).then(r => r.json())
    ]);
    
    if (!company || !employee) {
      throw new Error('Dados incompletos para recibo');
    }
    
    return {
      extra: {
        ...extra,
        vaga: extra.vaga,
        setor: extra.setor,
        aprovado_em: new Date().toISOString()
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
  const API_URL = getApiUrl();
  console.log('📝 Criando recibo para extra:', extraId);
  
  try {
    const data = await fetchExtraForReceipt(extraId);
    console.log('✅ Dados do recibo preparados:', data);
    
    const blob = buildReceiptPDF(data);
    console.log('✅ PDF gerado, tamanho:', blob.size, 'bytes');
    
    const reader = new FileReader();
    const pdfUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    console.log('✅ PDF convertido para data URL (tamanho:', pdfUrl.length, 'caracteres)');
    const total = data.total;
    
    const response = await fetch(`${API_URL}/recibos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extra_id: extraId, pdf_url: pdfUrl, total })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao salvar recibo:', errorText);
      throw new Error('Erro ao salvar recibo: ' + errorText);
    }
    
    console.log('✅ Recibo salvo no banco de dados');
    return pdfUrl;
  } catch (error) {
    console.error('❌ Erro ao criar recibo:', error);
    throw error;
  }
}

export async function onCiente(extraId) {
  const API_URL = getApiUrl();
  console.log('ℹ️ Marcando extra como ciente:', extraId);
  try {
    const response = await fetch(`${API_URL}/extras/${extraId}/status`, {
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
  const API_URL = getApiUrl();
  console.log('✅ Aprovando extra:', extraId, 'usando API:', API_URL);
  try {
    const response = await fetch(`${API_URL}/extras/${extraId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aprovado' })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Erro ao aprovar: ' + errorText);
    }
    console.log('✅ Extra aprovado, gerando recibo...');
    
    await createReceipt(extraId, usersList);
    console.log('✅ Processo de aprovação concluído');
  } catch (error) {
    console.error('❌ Erro ao aprovar:', error);
    throw error;
  }
}

export async function onRejeitar(extraId) {
  const API_URL = getApiUrl();
  console.log('❌ Rejeitando extra:', extraId);
  try {
    const response = await fetch(`${API_URL}/extras/${extraId}/status`, {
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
  const API_URL = getApiUrl();
  console.log('📥 Buscando recibo para download:', extraId, 'usando API:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/recibos/${extraId}`);
    
    if (!response.ok || response.status === 404) {
      console.log('⚠️ Recibo não encontrado, tentando gerar...');
      
      try {
        const pdfUrl = await createReceipt(extraId, []);
        console.log('✅ Recibo gerado com sucesso');
        return pdfUrl;
      } catch (genError) {
        console.error('❌ Erro ao gerar recibo:', genError);
        return null;
      }
    }
    
    const data = await response.json();
    
    if (data && data.pdf_url) {
      console.log('✅ Recibo encontrado, tamanho da URL:', data.pdf_url?.length || 0);
      return data.pdf_url;
    }
    
    console.log('⚠️ Recibo não encontrado, tentando gerar...');
    try {
      const pdfUrl = await createReceipt(extraId, []);
      console.log('✅ Recibo gerado com sucesso');
      return pdfUrl;
    } catch (genError) {
      console.error('❌ Erro ao gerar recibo:', genError);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar recibo:', error);
    throw error;
  }
}

export async function onDeleteReceipt(extraId) {
  const API_URL = getApiUrl();
  console.log('🗑️ Excluindo recibo:', extraId);
  
  try {
    const response = await fetch(`${API_URL}/recibos/${extraId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erro ao excluir recibo');
    console.log('✅ Recibo excluído');
  } catch (error) {
    console.error('❌ Erro ao excluir:', error);
    throw error;
  }
}

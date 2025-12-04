import jsPDF from 'jspdf';

function totalBRL(n) {
  return (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function buildReceiptPDF(params) {
  const doc = new jsPDF();

  const {
    extra,
    employee,
    company,
    items,
    total,
    approver,
    acknowledger
  } = params;

  let y = 18;
  doc.setFontSize(16);
  doc.text('Recibo de Pagamento de Extra', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(11);
  doc.text(`Empresa: ${company?.name || 'N/A'}`, 14, y); y += 6;
  doc.text(`Setor: ${extra.setor || 'N/A'}`, 14, y); y += 6;
  doc.text(`Atração/Vaga: ${extra.vaga || 'N/A'}`, 14, y); y += 8;

  doc.text(`Funcionário: ${employee.name || 'N/A'}`, 14, y); y += 6;
  doc.text(`CPF: ${employee.cpf || 'N/A'}`, 14, y); y += 6;
  if (employee.chavePix) { doc.text(`PIX: ${employee.chavePix}`, 14, y); y += 6; }
  if (employee.banco) { doc.text(`Banco: ${employee.banco}`, 14, y); y += 8; }
  
  doc.line(14, y, 196, y); y += 6;

  // Cabeçalho da tabela
  doc.text('Data', 14, y);
  doc.text('Entrada', 60, y);
  doc.text('Saída', 90, y);
  doc.text('Valor (R$)', 150, y, { align: 'right' });
  y += 4; doc.line(14, y, 196, y); y += 6;

  items.forEach(it => {
    doc.text(formatDate(it.d), 14, y);
    doc.text(it.ein || '-', 60, y);
    doc.text(it.eout || '-', 90, y);
    doc.text(totalBRL(it.v), 150, y, { align: 'right' });
    y += 7;
  });

  doc.line(14, y, 196, y); y += 8;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${totalBRL(total)}`, 14, y);
  y += 10;

  doc.setFontSize(10);
  if (approver) {
    doc.text(`Aprovado por: ${approver.name || 'N/A'} em ${formatDate(extra.aprovado_em) ?? '-'}`, 14, y); y += 6;
  }
  if (acknowledger) {
    doc.text(`Ciência por: ${acknowledger.name || 'N/A'} em ${formatDate(extra.acknowledged_at) ?? '-'}`, 14, y); y += 8;
  }
  
  y += 20;
  doc.text('___________________________________', 14, y); y += 6;
  doc.text('Assinatura do Gestor', 14, y);

  return doc.output('blob'); // Blob do PDF
}
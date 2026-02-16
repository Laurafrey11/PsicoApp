import jsPDF from 'jspdf';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Exporta una conversación de chat como PDF.
 */
export function exportChatAsPDF(messages: ChatMessage[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Título
  doc.setFontSize(18);
  doc.setTextColor(8, 145, 178); // cyan-500
  doc.text('Ego-Core - Historial de Conversación', margin, y);
  y += 10;

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // zinc-400
  doc.text(
    `Exportado: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
    margin,
    y
  );
  y += 5;

  // Línea separadora
  doc.setDrawColor(63, 63, 70); // zinc-700
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Mensajes
  for (const message of messages) {
    const isUser = message.role === 'user';
    const label = isUser ? 'Vos' : 'Asistente';

    // Check if we need a new page
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }

    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isUser ? 8 : 20, isUser ? 145 : 184, isUser ? 178 : 166);
    doc.text(label, margin, y);
    y += 6;

    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(212, 212, 216); // zinc-300

    const lines = doc.splitTextToSize(message.content, maxWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    }

    y += 8;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text(
      `Ego-Core | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`ego-core-conversacion-${new Date().toISOString().slice(0, 10)}.pdf`);
}

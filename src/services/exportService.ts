import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(data: any[], columns: { key: string; label: string }[], filename: string): void {
    if (!data || data.length === 0) return;

    const separator = ';';
    const header = columns.map(c => c.label).join(separator);

    const rows = data.map(item => {
      return columns.map(col => {
        let value = item[col.key];
        if (value instanceof Date) {
          value = value.toLocaleDateString('pt-BR');
        } else if (typeof value === 'number') {
          value = value.toLocaleString('pt-BR');
        } else if (value === null || value === undefined) {
          value = '';
        }
        // Escape quotes and wrap in quotes if contains separator
        value = String(value).replace(/"/g, '""');
        if (String(value).includes(separator) || String(value).includes('"') || String(value).includes('\n')) {
          value = `"${value}"`;
        }
        return value;
      }).join(separator);
    });

    const csvContent = '\uFEFF' + [header, ...rows].join('\n'); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  exportToPDF(title: string, data: any[], columns: { key: string; label: string }[], filename: string): void {
    if (!data || data.length === 0) return;

    // Generate a simple HTML table and print it as PDF
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1976d2; font-size: 18px; margin-bottom: 5px; }
        h2 { color: #666; font-size: 12px; font-weight: normal; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #1976d2; color: white; padding: 8px 6px; text-align: left; font-weight: 600; }
        td { padding: 6px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) td { background: #f5f5f5; }
        .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: center; }
      </style>
    `;

    const tableHeader = columns.map(c => `<th>${c.label}</th>`).join('');
    const tableRows = data.map(item => {
      const cells = columns.map(col => {
        let value = item[col.key];
        if (value instanceof Date) {
          value = value.toLocaleDateString('pt-BR');
        } else if (typeof value === 'number') {
          value = value.toLocaleString('pt-BR');
        } else if (value === null || value === undefined) {
          value = '';
        }
        return `<td>${value}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const now = new Date().toLocaleString('pt-BR');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>${title}</title>${styles}</head>
      <body>
        <h1>${title}</h1>
        <h2>Gerado em: ${now} | Total de registros: ${data.length}</h2>
        <table>
          <thead><tr>${tableHeader}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">EIP - Export Intelligence Platform | Relatório gerado automaticamente</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Teste simples para verificar se os botões funcionam
// Cole este código no console do browser (F12) na página de templates

console.log('🧪 INICIANDO TESTE DOS BOTÕES DE TEMPLATES');

// Teste 1: Verificar se o componente está carregado
const templateComponent = document.querySelector('app-templates');
console.log('✅ Componente Templates encontrado:', !!templateComponent);

// Teste 2: Verificar se os botões existem
const novoTemplateBtn = document.querySelector('button[data-testid="novo-template"], button:contains("Novo Template")');
const editarBtn = document.querySelector('button:contains("edit"), mat-icon:contains("edit")');
console.log('✅ Botão Novo Template encontrado:', !!novoTemplateBtn);
console.log('✅ Botões de editar encontrados:', !!editarBtn);

// Teste 3: Tentar clicar no botão novo template
if (novoTemplateBtn) {
    console.log('🔥 CLICANDO no botão Novo Template...');
    novoTemplateBtn.click();
} else {
    console.log('❌ Botão Novo Template não encontrado');
    
    // Buscar por texto alternativo
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, index) => {
        if (btn.textContent?.includes('Novo') || btn.textContent?.includes('Template')) {
            console.log(`🔍 Botão ${index}: "${btn.textContent?.trim()}"`);
        }
    });
}

console.log('🧪 TESTE CONCLUÍDO - Verifique se um dialog foi aberto');
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

interface OfficialLink {
  name: string;
  description: string;
  url: string;
}

@Component({
  selector: 'app-official-links',
  standalone: true,
  imports: [
    CommonModule, MatIconModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './official-links.component.html',
  styleUrls: ['./official-links.component.scss'],
})
export class OfficialLinksComponent {
  brazil: OfficialLink[] = [
    { name: 'Portal Único Siscomex', description: 'Janela única para a interação entre governo e operadores de comércio exterior no Brasil.', url: 'https://www.gov.br/siscomex/pt-br/paginas/portal-unico-siscomex' },
    { name: 'Receita Federal — Exportação / Portal Único', description: 'Procedimentos e orientação aduaneira de exportação.', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico' },
    { name: 'ANTAQ — Portos', description: 'Agência Nacional de Transportes Aquaviários: instalações portuárias e portos.', url: 'https://www.gov.br/antaq/pt-br/assuntos/instalacoes-portuarias/portos' },
    { name: 'Banco Central do Brasil', description: 'Política cambial, câmbio e informações econômicas oficiais.', url: 'https://www.bcb.gov.br' },
    { name: 'MAPA — Ministério da Agricultura e Pecuária', description: 'Certificações e requisitos sanitários para produtos agropecuários.', url: 'https://www.gov.br/agricultura' },
  ];

  international: OfficialLink[] = [
    { name: 'World Trade Organization — WTO/OMC', description: 'Organização Mundial do Comércio: regras do comércio internacional.', url: 'https://www.wto.org' },
    { name: 'World Customs Organization — WCO/OMA', description: 'Organização Mundial das Alfândegas: padrões aduaneiros internacionais.', url: 'https://www.wcoomd.org' },
    { name: 'International Maritime Organization — IMO', description: 'Agência da ONU para segurança e desempenho ambiental da navegação.', url: 'https://www.imo.org' },
  ];

  trackByUrl(_: number, item: OfficialLink): string { return item.url; }
}

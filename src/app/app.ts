import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('psf-digital-frontend');
  showMainToolbar = true;

  constructor(private router: Router) {
    // Escuta mudanças de rota para controlar quando mostrar a toolbar principal
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Oculta a toolbar principal quando estiver em rotas logadas
      this.showMainToolbar = !event.url.includes('/home-logged');
    });
    
    // Verifica a rota inicial
    this.showMainToolbar = !this.router.url.includes('/home-logged');
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComingSoonComponent } from './coming-soon.component';

@Component({
  selector: 'app-coming-soon-route',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `
    <app-coming-soon 
      [moduleName]="moduleName"
      [description]="description"
      [features]="features">
    </app-coming-soon>
  `
})
export class ComingSoonRouteComponent implements OnInit {
  moduleName = 'Módulo';
  description = 'Este módulo está em desenvolvimento e estará disponível em breve.';
  features: string[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get module info from route data or URL
    const data = this.route.snapshot.data;
    if (data['moduleName']) {
      this.moduleName = data['moduleName'];
    } else {
      // Derive from URL path
      const url = this.route.snapshot.url;
      if (url.length > 0) {
        this.moduleName = url
          .map(s => s.path.charAt(0).toUpperCase() + s.path.slice(1).replace(/-/g, ' '))
          .join(' > ');
      } else {
        // Try to derive from the full router URL
        const fullUrl = this.route.snapshot.pathFromRoot
          .flatMap(r => r.url)
          .map(s => s.path)
          .filter(p => p.length > 0);
        
        // Skip 'home-logged' prefix and format remaining segments
        const relevantSegments = fullUrl.filter(s => s !== 'home-logged');
        if (relevantSegments.length > 0) {
          this.moduleName = relevantSegments
            .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
            .join(' > ');
        }
      }
    }
    if (data['description']) this.description = data['description'];
    if (data['features']) this.features = data['features'];
  }
}

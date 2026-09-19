import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmbarqueMockService } from '../../../../../services/embarqueMockService';
import { Embarque } from '../../../../../types/embarque';

@Component({
  selector: 'app-embarque-detalhes',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './embarque-detalhes.component.html',
  styleUrls: ['./embarque-detalhes.component.scss']
})
export class EmbarqueDetalhesComponent implements OnInit, OnDestroy {
  embarque: Embarque | null = null;
  timeline: any[] = [];
  loading = true;
  embarqueId: string | null = null;
  
  // Auto-refresh para tracking em tempo real
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // 30 segundos

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private embarqueService: EmbarqueMockService,
    private snackBar: MatSnackBar
  ) {}

  private notify(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  generateDocuments(): void {
    if (!this.embarque) { return; }
    this.notify(`Gerando documentos do embarque ${this.embarque.shipment_number}.`);
  }

  sendDUE(): void {
    if (!this.embarque) { return; }
    this.notify(`DU-E do embarque ${this.embarque.shipment_number} enviada para processamento.`);
  }

  downloadBL(): void {
    if (!this.embarque) { return; }
    this.notify(`Download do Bill of Lading do embarque ${this.embarque.shipment_number} iniciado.`);
  }

  ngOnInit() {
    this.embarqueId = this.route.snapshot.paramMap.get('id');
    
    if (this.embarqueId) {
      this.loadEmbarque(this.embarqueId);
      this.loadTimeline(this.embarqueId);
      this.startAutoRefresh();
    } else {
      this.router.navigate(['/home-logged/logistica/embarque']);
    }
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  loadEmbarque(id: string) {
    this.loading = true;
    this.embarqueService.getEmbarqueById(id).subscribe({
      next: (embarque: Embarque | undefined) => {
        if (embarque) {
          this.embarque = embarque;
        } else {
          this.router.navigate(['/home-logged/logistica/embarque']);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar embarque:', error);
        this.router.navigate(['/home-logged/logistica/embarque']);
        this.loading = false;
      }
    });
  }

  loadTimeline(shipmentId: string) {
    this.embarqueService.getTimelineTracking(shipmentId).subscribe({
      next: (timeline: any[]) => {
        this.timeline = timeline;
      },
      error: (error: any) => {
        console.error('Erro ao carregar timeline:', error);
      }
    });
  }

  startAutoRefresh() {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      if (this.embarqueId) {
        this.loadEmbarque(this.embarqueId);
        this.loadTimeline(this.embarqueId);
      }
    });
  }

  stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  editEmbarque() {
    if (this.embarque) {
      this.router.navigate(['/home-logged/logistica/embarque/editar', this.embarque.shipment_id]);
    }
  }

  goBack() {
    this.router.navigate(['/home-logged/logistica/embarque']);
  }

  refreshData() {
    if (this.embarqueId) {
      this.loadEmbarque(this.embarqueId);
      this.loadTimeline(this.embarqueId);
    }
  }

  openTracking() {
    if (this.embarque?.tracking_url) {
      window.open(this.embarque.tracking_url, '_blank');
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Planned': return 'badge-secondary';
      case 'Booked': return 'badge-info';
      case 'In Transit': return 'badge-primary';
      case 'Delivered': return 'badge-success';
      case 'Delayed': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getTrackingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'On Time': return 'badge-success';
      case 'Delayed': return 'badge-danger';
      case 'Risk': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getRiskScoreClass(score?: number): string {
    if (!score) return 'text-muted';
    if (score < 20) return 'text-success';
    if (score < 50) return 'text-warning';
    return 'text-danger';
  }

  getTimelineStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'timeline-completed';
      case 'current': return 'timeline-current';
      case 'pending': return 'timeline-pending';
      default: return 'timeline-pending';
    }
  }

  formatCurrency(value?: number): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR');
  }

  formatQuantity(quantity: number, unit: string): string {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  }

  calculateProgress(): number {
    if (!this.embarque) return 0;
    
    const status = this.embarque.shipment_status;
    switch (status) {
      case 'Planned': return 20;
      case 'Booked': return 40;
      case 'In Transit': return 70;
      case 'Delivered': return 100;
      case 'Delayed': return 60;
      default: return 0;
    }
  }

  getProgressBarClass(): string {
    const progress = this.calculateProgress();
    if (progress >= 100) return 'bg-success';
    if (progress >= 70) return 'bg-info';
    if (progress >= 40) return 'bg-warning';
    return 'bg-primary';
  }

  getDaysToArrival(): number {
    if (!this.embarque?.arrival_date) return 0;
    
    const today = new Date();
    const arrival = new Date(this.embarque.arrival_date);
    const diffTime = arrival.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}
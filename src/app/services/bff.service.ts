import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BffService {
  private readonly http = inject(HttpClient);
  private readonly bffUrl = 'http://localhost:8080/api'; // URL do seu BFF

  // Exemplo de método para buscar dados
  public getData(): Observable<any> {
    return this.http.get<any>(`${this.bffUrl}/data`);
  }

  // Adicione outros métodos para interagir com os endpoints do seu BFF
}

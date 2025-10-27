import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Atividade {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  animal_id: string;
  animal_brinco: string;
  data_acao: string;
  usuario_id: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  private apiUrl = 'http://192.168.1.195:3000/api/atividades';

  constructor(private http: HttpClient) { }

  // Buscar atividades recentes (últimos 7 dias)
  getAtividadesRecentes(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}/recentes`);
  }

  // Buscar atividades por período
  getAtividadesPorPeriodo(dias: number = 7): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}?dias=${dias}`);
  }

  // Buscar atividades por tipo
  getAtividadesPorTipo(tipo: string): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}?tipo=${tipo}`);
  }

  // Buscar todas as atividades (com paginação opcional)
  getTodasAtividades(limit: number = 50): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}?limit=${limit}`);
  }
}
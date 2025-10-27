import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = `${environment.apiUrl}/ovinos`;

  constructor(private http: HttpClient) { }

  // Método privado para obter headers com token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔐 GETHEADERS TOKEN:', token);
    console.log('🔐 GETHEADERS HEADER:', { 'Authorization': `Bearer ${token}` });
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Métodos para buscar os ovinos
  getAnimais(): Observable<any[]> {
    const headers = this.getHeaders();
    console.log('🔐 GET ANIMAIS HEADERS:', headers);
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // Método para buscar manejos de um animal específico
  getManejosByAnimalId(animalId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${environment.apiUrl}/manejos?ovino_id=${animalId}`, { headers });
  }

  getAnimalById(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  createAnimal(dados: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('🔐 CREATE ANIMAL HEADERS:', headers);
    return this.http.post(this.apiUrl, dados, { headers });
  }

  updateAnimal(id: string, dados: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, dados, { headers });
  }

  getMatrizesAtivas(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}?categoria=matriz&situacao=ativo`, { headers });
  }

  getReprodutoresAtivos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}?categoria=reprodutor&situacao=ativo`, { headers });
  }

  // NOVO MÉTODO: Buscar fêmeas gestantes
  getFemeasGestantes(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${environment.apiUrl}/ovinos/gestantes`, { headers });
  }

  // MÉTODO ALTERNATIVO: Se preferir buscar todos os manejos e filtrar no frontend
  getManejosGestantes(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${environment.apiUrl}/manejos?tipo=reprodutivo&reprodutivo_acao=diagnóstico de prenhez`, { headers });
  }

  // Método para atualizar status do animal
  atualizarStatusAnimal(animalId: string, status: string, dataMudanca: string, observacoes: string): Observable<any> {
    const headers = this.getHeaders();
    const body = {
      situacao: status,
      descarte_data: status === 'descarte' ? dataMudanca : null,
      descarte_observacao: observacoes
    };

    return this.http.put(`${this.apiUrl}/${animalId}/status`, body, { headers });
  }
}
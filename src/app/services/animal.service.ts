import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = `${environment.apiUrl}/ovinos`; // Corrigido para /ovinos

  constructor(private http: HttpClient) { }

  // Métodos para buscar os ovinos
  getAnimais(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para buscar manejos de um animal específico
  getManejosByAnimalId(animalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/manejos?ovino_id=${animalId}`);
  }

  getAnimalById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAnimal(dados: any): Observable<any> {
    return this.http.post(this.apiUrl, dados);
  }

  updateAnimal(id: string, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  }

  getMatrizesAtivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?categoria=matriz&situacao=ativo`);
  }

  getReprodutoresAtivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?categoria=reprodutor&situacao=ativo`);
  }

  /*getFemeasGestantes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/gestantes`);
}*/

  // NOVO MÉTODO: Buscar fêmeas gestantes
  getFemeasGestantes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ovinos/gestantes`);
  }

  // MÉTODO ALTERNATIVO: Se preferir buscar todos os manejos e filtrar no frontend
  getManejosGestantes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/manejos?tipo=reprodutivo&reprodutivo_acao=diagnóstico de prenhez`);
  }

  // No animal.service.ts
  atualizarStatusAnimal(animalId: string, status: string, dataMudanca: string, observacoes: string) {
  const body = {
    situacao: status,
    descarte_data: status === 'descarte' ? dataMudanca : null,
    descarte_observacao: observacoes
  };

  // ✅ Mude para a rota de status
  return this.http.put(`${this.apiUrl}/${animalId}/status`, body);
}

}
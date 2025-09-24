import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {

  private apiUrl = 'http://localhost:3000/api/animais'; // Ajuste para API

  constructor(private http: HttpClient) { }

  // Métodos para animais
  getAnimais(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAnimalById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  cadastrarAnimalNascido(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nascidos`, dados);
  }

  cadastrarAnimalComprado(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comprados`, dados);
  }

  getMatrizesAtivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?categoria=Matriz&situacao=ativo`);
  }

  getReprodutoresAtivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?categoria=Reprodutor&situacao=ativo`);
  }

  // Adicione outros métodos conforme necessário
}
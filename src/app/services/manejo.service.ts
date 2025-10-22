import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ManejoService {
    private apiUrl = 'http://localhost:3000/manejos'; // ajuste a URL

    constructor(private http: HttpClient) { }

    // Salvar manejo básico (físico + técnico + sanitário simples)
    salvarManejo(dados: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, dados);
    }

    salvarManejoLote(dados: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/lote`, dados);
    }

    // Buscar histórico do animal
    getHistoricoAnimal(ovinoId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}?ovino_id=${ovinoId}`);
    }
}
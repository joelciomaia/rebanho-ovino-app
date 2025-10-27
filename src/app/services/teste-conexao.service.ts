import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TesteConexaoService {
  
  constructor(private http: HttpClient) { }

  testarConexaoExterna() {
    console.log('🔍 Testando conexão com API externa...');
    return this.http.get('http://192.168.1.195:3000/dashboard');
  }

  testarConexaoBackend() {
  console.log('🔍 Testando conexão com backend...');
  return this.http.get('http://192.168.1.195:3000/ovinos');
}
}
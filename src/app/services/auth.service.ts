import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;  // ✅ MUDADO: de number para string (UUID)
  nome_completo: string;
  email: string;
  telefone_whatsapp?: string;
  preferencia_recuperacao?: string;
  cabanha_nome?: string;
  cabanha_municipio?: string;
  cabanha_estado?: string;
  cabanha_localizacao_livre?: string;
  data_cadastro?: string;
}

interface LoginResponse {
  mensagem: string;
  token: string;
  user: User;
}

interface RegisterData {
  nomeCompleto: string;
  email: string;
  telefoneWhatsapp: string;
  preferenciaRecuperacao: string;
  senha: string;
  cabanha: {
    nome: string;
    municipio: string;
    estado: string;
    localizacaoLivre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000/auth'; // Ajuste a URL se necessário

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Login com backend
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      senha: password
    }).pipe(
      tap(response => {
        // Salva token e usuário
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  // Registro com backend
  register(registerData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Buscar perfil do usuário
  getProfile(userId: string): Observable<User> {  // ✅ MUDADO: de number para string
    return this.http.get<User>(`${this.apiUrl}/perfil/${userId}`);
  }

  // Atualizar perfil
  updateProfile(userId: string, userData: any): Observable<any> {  // ✅ MUDADO: de number para string
    return this.http.put(`${this.apiUrl}/perfil/${userId}`, userData);
  }

  // Verificar se está logado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obter token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Carregar usuário do localStorage
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Método antigo mantido para compatibilidade
  setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
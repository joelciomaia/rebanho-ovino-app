import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
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
  telefoneWhatsapp?: string;
  preferenciaRecuperacao?: string;
  senha: string;
  cabanha?: {
    nome?: string;
    municipio?: string;
    estado?: string;
    localizacaoLivre?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://192.168.1.195:3000/auth';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Login com backend - COM LOGS DETALHADOS
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔍 [AuthService] Iniciando login...');
    console.log('📍 URL da requisição:', `${this.apiUrl}/login`);
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', '[PROTEGIDO]');
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      senha: password
    }).pipe(
      tap(response => {
        console.log('✅ [AuthService] Login bem-sucedido!');
        console.log('📦 Resposta completa:', response);
        console.log('🔐 Token recebido:', response.token ? 'SIM' : 'NÃO');
        console.log('👤 Usuário recebido:', response.user);
        
        // Salva token e usuário
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        
        console.log('💾 Dados salvos no localStorage');
      }),
      catchError(error => {
        console.error('❌ [AuthService] ERRO no login:', error);
        console.error('📡 Status do erro:', error.status);
        console.error('📄 Mensagem do erro:', error.message);
        console.error('🔗 URL que falhou:', error.url);
        throw error;
      })
    );
  }

  // Registro com backend - COM LOGS
  register(registerData: RegisterData): Observable<any> {
    console.log('🔍 [AuthService] Iniciando registro...');
    console.log('📍 URL da requisição:', `${this.apiUrl}/register`);
    console.log('📦 Dados do registro:', { ...registerData, senha: '[PROTEGIDO]' });
    
    return this.http.post(`${this.apiUrl}/register`, registerData).pipe(
      tap(response => {
        console.log('✅ [AuthService] Registro bem-sucedido!', response);
      }),
      catchError(error => {
        console.error('❌ [AuthService] ERRO no registro:', error);
        throw error;
      })
    );
  }

  // Logout
  logout(): void {
    console.log('🔍 [AuthService] Fazendo logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('✅ [AuthService] Logout concluído');
  }

  // Buscar perfil do usuário
  getProfile(userId: string): Observable<User> {
    console.log('🔍 [AuthService] Buscando perfil para userId:', userId);
    console.log('📍 URL da requisição:', `${this.apiUrl}/perfil/${userId}`);
    
    return this.http.get<User>(`${this.apiUrl}/perfil/${userId}`).pipe(
      tap(user => {
        console.log('✅ [AuthService] Perfil carregado:', user);
      }),
      catchError(error => {
        console.error('❌ [AuthService] ERRO ao buscar perfil:', error);
        throw error;
      })
    );
  }

  // Atualizar perfil
  updateProfile(userId: string, userData: any): Observable<any> {
    console.log('🔍 [AuthService] Atualizando perfil para userId:', userId);
    console.log('📍 URL da requisição:', `${this.apiUrl}/perfil/${userId}`);
    console.log('📦 Dados de atualização:', userData);
    
    return this.http.put(`${this.apiUrl}/perfil/${userId}`, userData).pipe(
      tap(response => {
        console.log('✅ [AuthService] Perfil atualizado:', response);
      }),
      catchError(error => {
        console.error('❌ [AuthService] ERRO ao atualizar perfil:', error);
        throw error;
      })
    );
  }

  // Verificar se está logado
  isLoggedIn(): boolean {
    const loggedIn = !!localStorage.getItem('token');
    console.log('🔍 [AuthService] Verificando login:', loggedIn ? 'LOGADO' : 'NÃO LOGADO');
    return loggedIn;
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('🔍 [AuthService] Usuário atual:', user);
    return user;
  }

  // Obter token
  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔍 [AuthService] Token:', token ? 'PRESENTE' : 'AUSENTE');
    return token;
  }

  // Carregar usuário do localStorage
  private loadUserFromStorage(): void {
    console.log('🔍 [AuthService] Carregando usuário do storage...');
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      console.log('✅ [AuthService] Usuário encontrado no storage');
      this.currentUserSubject.next(JSON.parse(storedUser));
    } else {
      console.log('ℹ️ [AuthService] Nenhum usuário no storage');
    }
  }

  // Método antigo mantido para compatibilidade
  setUser(user: User): void {
    console.log('🔍 [AuthService] Definindo usuário manualmente:', user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
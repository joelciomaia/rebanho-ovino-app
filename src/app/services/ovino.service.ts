
// src/app/services/ovino.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// 🔹 INTERFACES
// ============================================================
export interface Ovino {
  id?: string;
  produtor_id?: string;
  brinco: string;
  nome?: string;
  mae_id?: string | null;
  pai_id?: string | null;
  sexo: 'macho' | 'femea';
  data_nascimento?: string | null;
  raca_id?: number | null;
  categoria?: string | null;
  peso_atual?: number | null;
  situacao?: string;
  tipo_parto_nascimento?: 'simples' | 'duplo' | 'triplo' | 'quadruplo' | null;
  habilidade_materna_nascimento?: number | null;
  peso_nascimento?: number | null;
  vigor_nascimento?: number | null;
  mamou_colostro?: boolean | null;
  observacao_nascimento?: string | null;
  foto_perfil?: string | null;
  descarte_tipo?: string | null;
  descarte_data?: string | null;
  descarte_observacao?: string | null;
  origem?: 'nascido' | 'comprado';
}

export interface Genitor {
  id: string;
  brinco: string;
  nome: string;
  raca_id?: number | null;
  data_nascimento: string;
  idade_meses?: number;
  categoria?: string;
  situacao?: string;
  descarte_data?: string;
}

export interface RacaOvina {
  id: number;
  nome: string;
  ativa?: boolean;
}

// ============================================================
// 🔹 SERVIÇO PRINCIPAL
// ============================================================
@Injectable({
  providedIn: 'root'
})
export class OvinoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://rebanho-ovino-app.onrender.com/ovinos';

  // ============================================================
  // CRUD BÁSICO
  // ============================================================
  criarOvino(ovino: Ovino): Observable<any> {
    return this.http.post(this.apiUrl, ovino);
  }

  getOvinos(): Observable<Ovino[]> {
    return this.http.get<Ovino[]>(this.apiUrl);
  }

  getOvinoById(id: string): Observable<Ovino> {
    return this.http.get<Ovino>(`${this.apiUrl}/${id}`);
  }

  atualizarOvino(id: string, ovino: Partial<Ovino>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, ovino);
  }

  deletarOvino(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ============================================================
  // CONSULTAS COMPLEMENTARES
  // ============================================================
  verificarBrincoExistente(brinco: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificar-brinco/${brinco}`);
  }

  getFemeasParaMaternidade(dataNascimento?: string): Observable<Genitor[]> {
    const params: any = {};
    if (dataNascimento) params.dataNascimento = dataNascimento;
    return this.http.get<Genitor[]>(`${this.apiUrl}/femeas-para-maternidade`, { params });
  }

  getMachosParaReproducao(dataNascimento?: string): Observable<Genitor[]> {
    const params: any = {};
    if (dataNascimento) params.dataNascimento = dataNascimento;
    return this.http.get<Genitor[]>(`${this.apiUrl}/machos-para-reproducao`, { params });
  }

  // ============================================================
  // 🔹 NOVOS MÉTODOS
  // ============================================================
  determinarRacaCordeiro(maeId: string, paiId: string): Observable<{ raca_id: number | null }> {
    return this.http.post<{ raca_id: number | null }>(`${this.apiUrl}/determinar-raca-cordeiro`, {
      mae_id: maeId,
      pai_id: paiId
    });
  }

  getRacasOvinas(): Observable<RacaOvina[]> {
    return this.http.get<RacaOvina[]>(`${this.apiUrl}/racas-ovinas`);
  }
}
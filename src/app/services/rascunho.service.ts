import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface RascunhoParto {
  id: string;
  mae_id: string;
  mae_brinco: string;
  data_criacao: Date;
  data_atualizacao: Date;
  dados: any;
  total_filhotes: number;
}

@Injectable({
  providedIn: 'root'
})
export class RascunhoService {
  private readonly RASCUNHO_KEY = 'partos_em_andamento';

  constructor() {}

  // CORRIGIDO: SALVAR RASCUNHO SOBRESCREVENDO EXISTENTE
  salvarRascunho(form: FormGroup, maeId: string, maeBrinco: string): void {
    try {
      // CORRIGIDO: Usar ID consistente por mãe (sem Date.now())
      const rascunhoId = `rascunho_${maeId}`;
      
      const rascunho: RascunhoParto = {
        id: rascunhoId,
        mae_id: maeId,
        mae_brinco: maeBrinco,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
        dados: form.value,
        total_filhotes: this.getTotalFilhotes(form)
      };

      const rascunhosExistentes = this.getRascunhos();
      
      // CORRIGIDO: Remover rascunho existente da mesma mãe
      const outrosRascunhos = rascunhosExistentes.filter(r => r.mae_id !== maeId);
      
      const novosRascunhos = [rascunho, ...outrosRascunhos];
      localStorage.setItem(this.RASCUNHO_KEY, JSON.stringify(novosRascunhos));
      
      console.log('💾 Rascunho salvo/atualizado:', rascunho);
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);
    }
  }

  // BUSCAR RASCUNHO POR MÃE
  getRascunhoPorMae(maeId: string): RascunhoParto | null {
    const rascunhos = this.getRascunhos();
    return rascunhos.find(r => r.mae_id === maeId) || null;
  }

  // LISTAR TODOS RASCUNHOS
  getRascunhos(): RascunhoParto[] {
    try {
      const stored = localStorage.getItem(this.RASCUNHO_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // CORRIGIDO: EXCLUIR RASCUNHO POR ID
  excluirRascunho(rascunhoId: string): void {
    const rascunhos = this.getRascunhos();
    const novosRascunhos = rascunhos.filter(r => r.id !== rascunhoId);
    localStorage.setItem(this.RASCUNHO_KEY, JSON.stringify(novosRascunhos));
  }

  // LIMPAR TODOS (APÓS SALVAR NO BANCO)
  limparRascunho(maeId: string): void {
    const rascunhos = this.getRascunhos();
    const novosRascunhos = rascunhos.filter(r => r.mae_id !== maeId);
    localStorage.setItem(this.RASCUNHO_KEY, JSON.stringify(novosRascunhos));
  }

  private getTotalFilhotes(form: FormGroup): number {
    const filhotesArray = form.get('filhotes') as any;
    return filhotesArray?.length || 0;
  }
}
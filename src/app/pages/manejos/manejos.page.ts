import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";

// Interfaces para tipagem
interface ItemSanitario {
  produto: string;
  dose: string;
  via: string;
  lote?: string;
  fabricante?: string;
  data?: string;
  observacoes?: string;
}

interface Vermifugo extends ItemSanitario {
  tipo: string;
}

interface Medicacao extends ItemSanitario {
  observacoes: string;
}

interface ManejoTecnico {
  peso: number | null;
  escore: string;
  observacoes: string;
}

interface Animal {
  id: string;
  brinco: string;
  categoria: string;
  pesoAtual: number;
  idade: number;
  selecionado: boolean;
  manejoTecnico: ManejoTecnico;
}

interface DadosManejoLote {
  vacinas: ItemSanitario[];
  vermifugos: Vermifugo[];
  medicacoes: Medicacao[];
  tosquia: boolean;
  casqueamento: boolean;
  caudectomia: boolean;
  observacoes: string;
}

@Component({
  selector: 'app-manejos',
  templateUrl: './manejos.page.html',
  styleUrls: ['./manejos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class Manejospage {
  segmento = 'lote';
  
  // Controle de expansão dos cards
  manejosExpandidos = {
    sanitario: false,
    fisico: false,
    tecnico: false,
    detalhesAnimais: false
  };

  // Manter seleções de cada tipo de manejo
  manejosSelecionados = {
    sanitario: [] as string[],
    fisico: [] as string[],
    tecnico: [] as string[]
  };

  // Dados dos manejos (estrutura corrigida)
  dadosManejoLote: DadosManejoLote = {
    vacinas: [],
    vermifugos: [],
    medicacoes: [],
    tosquia: false,
    casqueamento: false,
    caudectomia: false,
    observacoes: ''
  };

  // Objetos para formulários de novos itens
  novaVacina: ItemSanitario = { 
    produto: '', 
    dose: '', 
    via: '', 
    lote: '', 
    fabricante: '' 
  };

  novoVermifugo: Vermifugo = { 
    tipo: '', 
    produto: '', 
    dose: '', 
    via: '' 
  };

  novaMedicacao: Medicacao = { 
    produto: '', 
    dose: '', 
    via: '', 
    observacoes: '' 
  };

  // Animais
  animais: Animal[] = [
    { 
      id: '1', 
      brinco: '039', 
      categoria: 'Matriz', 
      pesoAtual: 60, 
      idade: 3.2, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    },
    { 
      id: '2', 
      brinco: '0132', 
      categoria: 'Borrega', 
      pesoAtual: 45, 
      idade: 1.1, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    },
    { 
      id: '3', 
      brinco: '0192', 
      categoria: 'Borrega', 
      pesoAtual: 48, 
      idade: 1.3, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    }
  ];

  constructor() { }

  // PROPRIEDADES CALCULADAS
  get animaisComDadosTecnicosCount(): number {
    return this.animaisSelecionados.filter(animal => 
      animal.manejoTecnico.peso !== null || 
      animal.manejoTecnico.escore !== ''
    ).length;
  }

  get temDadosTecnicosPreenchidos(): boolean {
    return this.animaisSelecionados.some(animal => 
      animal.manejoTecnico.peso !== null || 
      animal.manejoTecnico.escore !== ''
    );
  }

  get todosSelecionados(): boolean {
    return this.animais.every(a => a.selecionado);
  }

  get animaisSelecionados(): Animal[] {
    return this.animais.filter(a => a.selecionado);
  }

  get animaisSelecionadosCount(): number {
    return this.animaisSelecionados.length;
  }

  // MÉTODOS BÁSICOS
  toggleManejo(tipo: keyof typeof this.manejosExpandidos): void {
    this.manejosExpandidos[tipo] = !this.manejosExpandidos[tipo];
  }

  toggleOpcaoManejo(tipo: keyof typeof this.manejosSelecionados, opcao: string): void {
    const index = this.manejosSelecionados[tipo].indexOf(opcao);
    if (index > -1) {
      this.manejosSelecionados[tipo].splice(index, 1);
    } else {
      this.manejosSelecionados[tipo].push(opcao);
    }
  }

  isManejoSelecionado(tipo: keyof typeof this.manejosSelecionados, opcao: string): boolean {
    return this.manejosSelecionados[tipo].includes(opcao);
  }

  // MÉTODOS PARA ANIMAIS
  selecionarAnimal(animal: Animal): void {
    animal.selecionado = !animal.selecionado;
  }

  selecionarTodos(): void {
    const todosSelecionados = this.animais.every(a => a.selecionado);
    this.animais.forEach(a => a.selecionado = !todosSelecionados);
  }

  // MÉTODOS PARA MANEJOS SANITÁRIOS
  adicionarVacina(): void {
    if (this.novaVacina.produto && this.novaVacina.dose) {
      // Adiciona data atual se não existir
      const vacinaComData = {
        ...this.novaVacina,
        data: new Date().toISOString().split('T')[0]
      };
      
      this.dadosManejoLote.vacinas.push(vacinaComData);
      this.limparFormularioVacina();
    }
  }

  removerVacina(index: number): void {
    this.dadosManejoLote.vacinas.splice(index, 1);
  }

  adicionarVermifugo(): void {
    if (this.novoVermifugo.produto && this.novoVermifugo.dose) {
      // Adiciona data atual se não existir
      const vermifugoComData = {
        ...this.novoVermifugo,
        data: new Date().toISOString().split('T')[0]
      };
      
      this.dadosManejoLote.vermifugos.push(vermifugoComData);
      this.limparFormularioVermifugo();
    }
  }

  removerVermifugo(index: number): void {
    this.dadosManejoLote.vermifugos.splice(index, 1);
  }

  adicionarMedicacao(): void {
    if (this.novaMedicacao.produto && this.novaMedicacao.dose) {
      // Adiciona data atual se não existir
      const medicacaoComData = {
        ...this.novaMedicacao,
        data: new Date().toISOString().split('T')[0]
      };
      
      this.dadosManejoLote.medicacoes.push(medicacaoComData);
      this.limparFormularioMedicacao();
    }
  }

  removerMedicacao(index: number): void {
    this.dadosManejoLote.medicacoes.splice(index, 1);
  }

  // Métodos para limpar formulários
  limparFormularioVacina(): void {
    this.novaVacina = { 
      produto: '', 
      dose: '', 
      via: '', 
      lote: '', 
      fabricante: '' 
    };
  }

  limparFormularioVermifugo(): void {
    this.novoVermifugo = { 
      tipo: '', 
      produto: '', 
      dose: '', 
      via: '' 
    };
  }

  limparFormularioMedicacao(): void {
    this.novaMedicacao = { 
      produto: '', 
      dose: '', 
      via: '', 
      observacoes: '' 
    };
  }

  // MÉTODOS PARA MANEJO FÍSICO
  toggleManejoFisico(opcao: 'tosquia' | 'casqueamento' | 'caudectomia'): void {
    switch (opcao) {
      case 'tosquia':
        this.dadosManejoLote.tosquia = !this.dadosManejoLote.tosquia;
        break;
      case 'casqueamento':
        this.dadosManejoLote.casqueamento = !this.dadosManejoLote.casqueamento;
        break;
      case 'caudectomia':
        this.dadosManejoLote.caudectomia = !this.dadosManejoLote.caudectomia;
        break;
    }
  }

  // MÉTODOS PARA MANEJO TÉCNICO
  aplicarDadosTecnicosEmLote(): void {
    const animaisSelecionados = this.animaisSelecionados;
    
    if (animaisSelecionados.length === 0) {
      alert('Nenhum animal selecionado!');
      return;
    }

    // Encontra o primeiro animal com dados técnicos preenchidos
    const animalComDados = animaisSelecionados.find(a => 
      a.manejoTecnico.peso !== null || 
      a.manejoTecnico.escore !== ''
    );
    
    if (animalComDados) {
      const confirmar = confirm(`Deseja aplicar os dados técnicos do animal ${animalComDados.brinco} para todos os ${animaisSelecionados.length} animais selecionados?`);
      
      if (confirmar) {
        animaisSelecionados.forEach(animal => {
          animal.manejoTecnico.peso = animalComDados.manejoTecnico.peso;
          animal.manejoTecnico.escore = animalComDados.manejoTecnico.escore;
          // Mantém as observações individuais
        });
      }
    } else {
      alert('Nenhum animal com dados técnicos preenchidos encontrado!');
    }
  }

  limparDadosTecnicosSelecionados(): void {
    const animaisSelecionados = this.animaisSelecionados;
    
    if (animaisSelecionados.length === 0) {
      alert('Nenhum animal selecionado!');
      return;
    }

    const confirmar = confirm(`Deseja limpar os dados técnicos de todos os ${animaisSelecionados.length} animais selecionados?`);
    
    if (confirmar) {
      animaisSelecionados.forEach(animal => {
        animal.manejoTecnico.peso = null;
        animal.manejoTecnico.escore = '';
        animal.manejoTecnico.observacoes = '';
      });
    }
  }

  // MÉTODOS AUXILIARES
  calcularVariacaoPeso(animal: Animal): string {
    if (!animal.manejoTecnico.peso || !animal.pesoAtual) return '';
    
    const variacao = Number(animal.manejoTecnico.peso) - animal.pesoAtual;
    const sinal = variacao >= 0 ? '+' : '';
    return `${sinal}${variacao.toFixed(1)}kg`;
  }

  getCorVariacaoPeso(animal: Animal): string {
    if (!animal.manejoTecnico.peso || !animal.pesoAtual) return 'medium';
    
    const variacao = Number(animal.manejoTecnico.peso) - animal.pesoAtual;
    
    if (variacao > 5) return 'success';
    if (variacao < -5) return 'danger';
    return 'warning';
  }

  getDescricaoEscore(escore: string): string {
    const descricoes: {[key: string]: string} = {
      '1': 'Costelas e processos vertebrais visíveis',
      '2': 'Costelas palpáveis, pouca cobertura muscular',
      '3': 'Costelas palpáveis com leve pressão, condição ideal',
      '4': 'Costelas difíceis de palpar, excesso de gordura',
      '5': 'Costelas não palpáveis, obesidade'
    };
    return descricoes[escore] || 'Selecione um escore';
  }

  // MÉTODOS DE NAVEGAÇÃO E CONTROLE
  alternarSegmento(event: any): void {
    this.segmento = event.detail.value;
  }

  verHistorico(animal: Animal): void {
    console.log('Ver histórico do animal:', animal);
    // Implementar navegação para histórico
  }

  irParaIndividual(animal: Animal): void {
    console.log('Editar individualmente:', animal);
    this.segmento = 'individual';
    // Implementar lógica para edição individual
  }

  // VALIDAÇÃO E APLICAÇÃO DE MANEJOS
  podeAplicarManejo(): boolean {
    const temAnimaisSelecionados = this.animaisSelecionadosCount > 0;
    const temManejosSelecionados = 
      this.manejosSelecionados.sanitario.length > 0 ||
      this.manejosSelecionados.fisico.length > 0 ||
      this.manejosSelecionados.tecnico.length > 0;
    
    // Validação adicional para manejo técnico
    if (this.manejosSelecionados.tecnico.length > 0) {
      const animaisComDadosTecnicos = this.animaisSelecionados.filter(animal => 
        animal.manejoTecnico.peso !== null || 
        animal.manejoTecnico.escore !== ''
      ).length;
      
      if (animaisComDadosTecnicos === 0) {
        return false;
      }
    }
    
    return temAnimaisSelecionados && temManejosSelecionados;
  }

  aplicarManejoLote(): void {
    if (!this.podeAplicarManejo()) {
      alert('Não é possível aplicar o manejo. Verifique os requisitos.');
      return;
    }

    const animaisSelecionados = this.animaisSelecionados;
    const manejosAplicados = {
      data: new Date().toISOString(),
      sanitario: {
        selecionados: this.manejosSelecionados.sanitario,
        dados: this.dadosManejoLote
      },
      fisico: {
        selecionados: this.manejosSelecionados.fisico,
        dados: {
          tosquia: this.dadosManejoLote.tosquia,
          casqueamento: this.dadosManejoLote.casqueamento,
          caudectomia: this.dadosManejoLote.caudectomia
        }
      },
      tecnico: {
        selecionados: this.manejosSelecionados.tecnico,
        dadosIndividuais: animaisSelecionados.map(animal => ({
          id: animal.id,
          brinco: animal.brinco,
          manejoTecnico: { ...animal.manejoTecnico }
        }))
      },
      observacoes: this.dadosManejoLote.observacoes,
      animaisCount: animaisSelecionados.length
    };
    
    console.log('Aplicando manejos:', manejosAplicados);
    
    // Simular salvamento
    this.salvarManejos(manejosAplicados);
    
    alert(`Manejo aplicado para ${animaisSelecionados.length} animais com sucesso!`);
    
    // Limpar formulários após aplicação
    this.limparFormularios();
  }

  // Método para salvar no banco de dados (simulado)
  private salvarManejos(manejos: any): void {
    // Aqui você implementaria a lógica real de salvamento
    console.log('Salvando manejos no banco de dados:', manejos);
    // Exemplo: this.manejoService.salvarManejos(manejos).subscribe(...);
  }

  // Limpar todos os formulários após aplicação
  private limparFormularios(): void {
    // Limpar seleções
    this.manejosSelecionados.sanitario = [];
    this.manejosSelecionados.fisico = [];
    this.manejosSelecionados.tecnico = [];
    
    // Limpar dados
    this.dadosManejoLote = {
      vacinas: [],
      vermifugos: [],
      medicacoes: [],
      tosquia: false,
      casqueamento: false,
      caudectomia: false,
      observacoes: ''
    };
    
    // Limpar formulários
    this.limparFormularioVacina();
    this.limparFormularioVermifugo();
    this.limparFormularioMedicacao();
    
    // Desmarcar animais
    this.animais.forEach(animal => {
      animal.selecionado = false;
      animal.manejoTecnico = { peso: null, escore: '', observacoes: '' };
    });
  }

  // Método para carregar dados existentes (se necessário)
  carregarDadosExistentes(): void {
    // Implementar se necessário para edição de manejos existentes
  }

  // Lifecycle hook (se necessário)
  ngOnInit(): void {
    this.carregarDadosExistentes();
  }
}
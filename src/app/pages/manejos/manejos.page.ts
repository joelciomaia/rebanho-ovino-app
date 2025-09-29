import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";

// Interfaces para tipagem - MANEJO EM LOTE
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
  sexo?: string;
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

// INTERFACES COMPLETAS PARA MANEJO INDIVIDUAL (BASE DE DADOS)
interface VacinaIndividual {
  produto: string;
  dose: string;
  via: string;
  lote?: string;
  fabricante?: string;
  observacao?: string;
}

interface MedicacaoIndividual {
  produto: string;
  dose: string;
  via: string;
  tipo: string;
  observacao?: string;
}

interface SanitarioIndividual {
  vacinas: VacinaIndividual[];
  medicacoes: MedicacaoIndividual[];
  famacha?: number;  // MUDANÇA: agora é number em vez de string
  opg: boolean;
}

interface TecnicoIndividual {
  peso?: number;
  temperatura?: number;
  escoreCorporal?: number;
}

interface CasqueamentoIndividual {
  realizado: boolean;
  observacao?: string;
}

interface FisicoIndividual {
  casqueamento: CasqueamentoIndividual;
  tosquia: boolean;
  caudectomia: boolean;
  descorna: boolean;
}

interface NutricionalIndividual {
  tipoAlimentacao?: string;
  quantidade?: string;
  suplemento?: string;
}

interface FilhoteReprodutivo {
  sexo?: string;
  pesoNascimento?: number;
  vigor?: number;
  mamouColostro: boolean;
  ovinoId?: string;
}

interface ReprodutivoIndividual {
  acao?: string;
  tipoParto?: string;
  habilidadeMaterna?: number;
  quantidadeFilhotes?: number;
  filhotes: FilhoteReprodutivo[];
  observacao?: string;
}

interface FotoManejo {
  url: string;
  descricao: string;
}

interface ManejoIndividual {
  id?: string;
  produtorId: string;
  ovinoId: string;
  data: Date;
  tipo: string;
  manejoEmLote: boolean;
  loteId?: string;
  observacao: string;
  sanitario?: SanitarioIndividual;
  tecnico?: TecnicoIndividual;
  fisico?: FisicoIndividual;
  nutricional?: NutricionalIndividual;
  reprodutivo?: ReprodutivoIndividual;
  fotos: FotoManejo[];
}

interface AnimalIndividual {
  id: string;
  brinco: string;
  sexo: string;
  categoria: string;
  idade: string;
  pesoAtual: string;
  manejoAtual?: Partial<ManejoIndividual>;
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
  
  // NOVO: Variáveis para o modal do FAMACHA
  modalFamachaAberto: boolean = false;
  notaFamachaManual: number | null = null;
  
  // Controle de expansão dos cards (LOTE)
  manejosExpandidos = {
    sanitario: false,
    fisico: false,
    tecnico: false,
    detalhesAnimais: false
  };

  // Controle para seções do manejo individual
  secoesIndividuais = {
    sanitario: false,
    fisico: false,
    tecnico: false,
    nutricional: false,
    reprodutivo: false,
    observacoes: false
  };

  // Manter seleções de cada tipo de manejo (LOTE)
  manejosSelecionados = {
    sanitario: [] as string[],
    fisico: [] as string[],
    tecnico: [] as string[]
  };

  // Dados dos manejos (LOTE)
  dadosManejoLote: DadosManejoLote = {
    vacinas: [],
    vermifugos: [],
    medicacoes: [],
    tosquia: false,
    casqueamento: false,
    caudectomia: false,
    observacoes: ''
  };

  // Dados do animal selecionado para manejo individual
  animalSelecionado: AnimalIndividual = {
    id: '1',
    brinco: '0145',
    sexo: 'Fêmea',
    categoria: 'Matriz',
    idade: '3,2',
    pesoAtual: '60',
    manejoAtual: {
      produtorId: 'produtor-123',
      ovinoId: '1',
      data: new Date(),
      tipo: 'sanitario',
      manejoEmLote: false,
      observacao: '',
      sanitario: {
        vacinas: [],
        medicacoes: [],
        opg: false
      },
      fisico: {
        casqueamento: { realizado: false },
        tosquia: false,
        caudectomia: false,
        descorna: false
      },
      tecnico: {},
      nutricional: {},
      reprodutivo: {
        filhotes: []
      },
      fotos: []
    }
  };

  // Dados em edição para o manejo individual
  medicacaoEditando: MedicacaoIndividual = {
    produto: '',
    dose: '',
    via: '',
    tipo: '',
    observacao: ''
  };

  vacinaEditando: VacinaIndividual = {
    produto: '',
    dose: '',
    via: '',
    observacao: ''
  };

  filhoteEditando: FilhoteReprodutivo = {
    mamouColostro: false
  };

  // Objetos para formulários de novos itens (LOTE)
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

  // Animais (LOTE)
  animais: Animal[] = [
    { 
      id: '1', 
      brinco: '039', 
      sexo: 'Fêmea',
      categoria: 'Matriz', 
      pesoAtual: 60, 
      idade: 3.2, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    },
    { 
      id: '2', 
      brinco: '0132', 
      sexo: 'Fêmea',
      categoria: 'Borrega', 
      pesoAtual: 45, 
      idade: 1.1, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    },
    { 
      id: '3', 
      brinco: '0192', 
      sexo: 'Fêmea',
      categoria: 'Borrega', 
      pesoAtual: 48, 
      idade: 1.3, 
      selecionado: false,
      manejoTecnico: { peso: null, escore: '', observacoes: '' }
    }
  ];

  constructor(private alertController: AlertController) { }

  // PROPRIEDADES CALCULADAS (LOTE)
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

  // MÉTODOS BÁSICOS (LOTE)
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

  // MÉTODO PARA MANEJO INDIVIDUAL
  toggleSecaoIndividual(secao: keyof typeof this.secoesIndividuais): void {
    this.secoesIndividuais[secao] = !this.secoesIndividuais[secao];
  }

  // MÉTODOS PARA MANEJO INDIVIDUAL
  adicionarMedicacaoIndividual(): void {
    if (this.medicacaoEditando.produto && this.medicacaoEditando.dose) {
      this.animalSelecionado.manejoAtual!.sanitario!.medicacoes.push({...this.medicacaoEditando});
      this.limparMedicacaoIndividual();
    }
  }

  removerMedicacaoIndividual(index: number): void {
    this.animalSelecionado.manejoAtual!.sanitario!.medicacoes.splice(index, 1);
  }

  adicionarVacinaIndividual(): void {
    if (this.vacinaEditando.produto && this.vacinaEditando.dose) {
      this.animalSelecionado.manejoAtual!.sanitario!.vacinas.push({...this.vacinaEditando});
      this.limparVacinaIndividual();
    }
  }

  removerVacinaIndividual(index: number): void {
    this.animalSelecionado.manejoAtual!.sanitario!.vacinas.splice(index, 1);
  }

  adicionarFilhote(): void {
    if (this.filhoteEditando.sexo) {
      this.animalSelecionado.manejoAtual!.reprodutivo!.filhotes.push({...this.filhoteEditando});
      this.limparFilhote();
    }
  }

  removerFilhote(index: number): void {
    this.animalSelecionado.manejoAtual!.reprodutivo!.filhotes.splice(index, 1);
  }

  limparMedicacaoIndividual(): void {
    this.medicacaoEditando = {
      produto: '',
      dose: '',
      via: '',
      tipo: '',
      observacao: ''
    };
  }

  limparVacinaIndividual(): void {
    this.vacinaEditando = {
      produto: '',
      dose: '',
      via: '',
      observacao: ''
    };
  }

  limparFilhote(): void {
    this.filhoteEditando = {
      mamouColostro: false
    };
  }

  salvarManejoIndividual(): void {
    if (!this.animalSelecionado.manejoAtual) return;

    const manejo: ManejoIndividual = {
      ...this.animalSelecionado.manejoAtual,
      ovinoId: this.animalSelecionado.id,
      data: new Date()
    } as ManejoIndividual;

    console.log('Salvando manejo individual:', manejo);
    alert('Manejo individual salvo com sucesso!');
  }

  // MÉTODOS EXISTENTES (LOTE)
  selecionarAnimal(animal: Animal): void {
    animal.selecionado = !animal.selecionado;
  }

  selecionarTodos(): void {
    const todosSelecionados = this.animais.every(a => a.selecionado);
    this.animais.forEach(a => a.selecionado = !todosSelecionados);
  }

  // MÉTODOS PARA MANEJOS SANITÁRIOS (LOTE)
  adicionarVacina(): void {
    if (this.novaVacina.produto && this.novaVacina.dose) {
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

  // Métodos para limpar formulários (LOTE)
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

  // MÉTODOS PARA MANEJO FÍSICO (LOTE)
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

  // MÉTODOS PARA MANEJO TÉCNICO (LOTE)
  aplicarDadosTecnicosEmLote(): void {
    const animaisSelecionados = this.animaisSelecionados;
    if (animaisSelecionados.length === 0) {
      alert('Nenhum animal selecionado!');
      return;
    }

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
  }

  irParaIndividual(animal: Animal): void {
    this.segmento = 'individual';
    this.animalSelecionado = {
      id: animal.id,
      brinco: animal.brinco,
      sexo: animal.sexo || 'Fêmea',
      categoria: animal.categoria,
      idade: animal.idade.toString(),
      pesoAtual: animal.pesoAtual.toString(),
      manejoAtual: {
        produtorId: 'produtor-123',
        ovinoId: animal.id,
        data: new Date(),
        tipo: 'sanitario',
        manejoEmLote: false,
        observacao: '',
        sanitario: {
          vacinas: [],
          medicacoes: [],
          opg: false
        },
        fisico: {
          casqueamento: { realizado: false },
          tosquia: false,
          caudectomia: false,
          descorna: false
        },
        tecnico: {},
        nutricional: {},
        reprodutivo: {
          filhotes: []
        },
        fotos: []
      }
    };
  }

  voltarParaLote(): void {
    this.segmento = 'lote';
  }

  // VALIDAÇÃO E APLICAÇÃO DE MANEJOS (LOTE)
  podeAplicarManejo(): boolean {
    const temAnimaisSelecionados = this.animaisSelecionadosCount > 0;
    const temManejosSelecionados = 
      this.manejosSelecionados.sanitario.length > 0 ||
      this.manejosSelecionados.fisico.length > 0 ||
      this.manejosSelecionados.tecnico.length > 0;
    
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

  // NOVO MÉTODO APLICAR MANEJO LOTE COM ALERTA
  async aplicarManejoLote(): Promise<void> {
    if (!this.podeAplicarManejo()) {
      const alert = await this.alertController.create({
        header: 'Atenção',
        message: 'Não é possível aplicar o manejo. Verifique os requisitos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Verificar se há animais sem pesagem ou escore
    const animaisIncompletos = this.animaisSelecionados.filter(animal => {
      const precisaPesagem = this.isManejoSelecionado('tecnico', 'pesagem');
      const precisaEscore = this.isManejoSelecionado('tecnico', 'escore');
      
      const temPesagem = precisaPesagem ? animal.manejoTecnico?.peso !== null : true;
      const temEscore = precisaEscore ? animal.manejoTecnico?.escore !== '' : true;
      
      return !temPesagem || !temEscore;
    });

    if (animaisIncompletos.length > 0) {
      const confirmar = await this.mostrarAlertaAnimaisIncompletos(animaisIncompletos);
      if (!confirmar) {
        return; // Usuário cancelou
      }
    }

    // Continuar com o salvamento normal
    await this.salvarManejoLote();
  }

  async mostrarAlertaAnimaisIncompletos(animaisIncompletos: any[]): Promise<boolean> {
    return new Promise(async (resolve) => {
      const animaisLista = animaisIncompletos.slice(0, 3).map(animal => 
        `• ${animal.brinco}`
      ).join('\n');

      let mensagem = `Existem ${animaisIncompletos.length} animais sem pesagem ou avaliação de escore:\n\n${animaisLista}`;
      
      if (animaisIncompletos.length > 3) {
        mensagem += `\n• e mais ${animaisIncompletos.length - 3} animais...`;
      }

      mensagem += '\n\nDeseja salvar mesmo assim?';

      const alert = await this.alertController.create({
        header: 'Dados Incompletos',
        message: mensagem,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Salvar Mesmo Assim',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }

  // NOVO MÉTODO SALVAR MANEJO LOTE
  private async salvarManejoLote(): Promise<void> {
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
    
    // Simular salvamento no banco
    await this.salvarManejos(manejosAplicados);
    
    // Mostrar mensagem de sucesso
    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: `Manejo aplicado para ${animaisSelecionados.length} animais com sucesso!`,
      buttons: ['OK']
    });
    await alert.present();
    
    this.limparFormularios();
  }

  // Método para salvar no banco de dados (simulado)
  private async salvarManejos(manejos: any): Promise<void> {
    console.log('Salvando manejos no banco de dados:', manejos);
    // Simular delay de salvamento
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  // Limpar todos os formulários após aplicação (LOTE)
  private limparFormularios(): void {
    this.manejosSelecionados.sanitario = [];
    this.manejosSelecionados.fisico = [];
    this.manejosSelecionados.tecnico = [];
    
    this.dadosManejoLote = {
      vacinas: [],
      vermifugos: [],
      medicacoes: [],
      tosquia: false,
      casqueamento: false,
      caudectomia: false,
      observacoes: ''
    };
    
    this.limparFormularioVacina();
    this.limparFormularioVermifugo();
    this.limparFormularioMedicacao();
    
    this.animais.forEach(animal => {
      animal.selecionado = false;
      animal.manejoTecnico = { peso: null, escore: '', observacoes: '' };
    });
  }

  // NOVOS MÉTODOS PARA O FAMACHA VISUAL
  abrirModalFamacha(): void {
    this.modalFamachaAberto = true;
  }

  fecharModalFamacha(): void {
    this.modalFamachaAberto = false;
    this.notaFamachaManual = null;
  }

  selecionarFamacha(nota: number): void {
    if (!this.animalSelecionado.manejoAtual?.sanitario) {
      if (!this.animalSelecionado.manejoAtual) {
        this.animalSelecionado.manejoAtual = {};
      }
      this.animalSelecionado.manejoAtual.sanitario = {
        vacinas: [],
        medicacoes: [],
        opg: false
      };
    }
    this.animalSelecionado.manejoAtual.sanitario!.famacha = nota;
    this.modalFamachaAberto = false;
    
    console.log(`FAMACHA ${nota} aplicado ao animal ${this.animalSelecionado.brinco}`);
  }

  aplicarNotaManual(): void {
    if (this.notaFamachaManual && this.notaFamachaManual >= 1 && this.notaFamachaManual <= 5) {
      this.selecionarFamacha(this.notaFamachaManual);
    }
  }

  getCorFamacha(nota: number | undefined): string {
    // Se for undefined, retorna uma cor padrão (cinza)
    if (nota === undefined || nota === null) {
      return 'linear-gradient(135deg, #CCCCCC 0%, #DDDDDD 100%)'; // Cor para indefinido
    }
    
    const cores = [
      'linear-gradient(135deg, #8B0000 0%, #B22222 100%)', // 1
      'linear-gradient(135deg, #CD5C5C 0%, #F08080 100%)', // 2
      'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)', // 3
      'linear-gradient(135deg, #FFE4E1 0%, #FAF0F0 100%)', // 4
      'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'  // 5
    ];
    
    return cores[nota - 1] || cores[0];
  }

  getDescricaoFamacha(nota: number): string {
    const descricoes = [
      'Vermelho - Animal saudável',
      'Vermelho-pálido - Saudável', 
      'Rosa - Monitorar',
      'Rosa-pálido - Anemia moderada',
      'Branco - Anemia severa'
    ];
    return descricoes[nota - 1] || '';
  }

  // Métodos para conversão de números
  onPesoChange(value: string): void {
    this.animalSelecionado.manejoAtual!.tecnico!.peso = value ? parseFloat(value) : undefined;
  }

  onTemperaturaChange(value: string): void {
    this.animalSelecionado.manejoAtual!.tecnico!.temperatura = value ? parseFloat(value) : undefined;
  }

  onEscoreChange(value: string): void {
    this.animalSelecionado.manejoAtual!.tecnico!.escoreCorporal = value ? parseInt(value) : undefined;
  }

  onQuantidadeFilhotesChange(value: string): void {
    this.animalSelecionado.manejoAtual!.reprodutivo!.quantidadeFilhotes = value ? parseInt(value) : undefined;
  }

  onPesoNascimentoChange(value: string): void {
    this.filhoteEditando.pesoNascimento = value ? parseFloat(value) : undefined;
  }

  podeSalvarManejoIndividual(): boolean {
    const manejo = this.animalSelecionado.manejoAtual;
    if (!manejo) return false;

    // Verifica se há pelo menos algum dado preenchido
    const temDadosSanitarios = !!(manejo.sanitario && (
      (manejo.sanitario.medicacoes && manejo.sanitario.medicacoes.length > 0) ||
      (manejo.sanitario.vacinas && manejo.sanitario.vacinas.length > 0) ||
      manejo.sanitario.opg === true ||
      manejo.sanitario.famacha
    ));

    const temDadosTecnicos = !!(manejo.tecnico && (
      manejo.tecnico.peso !== undefined ||
      manejo.tecnico.temperatura !== undefined ||
      manejo.tecnico.escoreCorporal !== undefined
    ));

    const temDadosFisicos = !!(manejo.fisico && (
      manejo.fisico.tosquia === true ||
      (manejo.fisico.casqueamento && manejo.fisico.casqueamento.realizado === true) ||
      manejo.fisico.caudectomia === true ||
      manejo.fisico.descorna === true
    ));

    const temDadosReprodutivos = !!(manejo.reprodutivo && (
      !!manejo.reprodutivo.acao ||
      (manejo.reprodutivo.filhotes && manejo.reprodutivo.filhotes.length > 0)
    ));

    const temObservacoes = !!(manejo.observacao && manejo.observacao.trim().length > 0);

    return temDadosSanitarios || temDadosTecnicos || temDadosFisicos || 
           temDadosReprodutivos || temObservacoes;
  }

  // Método para atualizar peso dos animais
  atualizarPesoAnimal(animal: any, valor: string) {
    if (valor) {
      animal.manejoTecnico.peso = parseFloat(valor);
    } else {
      animal.manejoTecnico.peso = null;
    }
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
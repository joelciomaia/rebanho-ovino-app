import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalService } from '../../services/animal.service';
import { ManejoService } from '../../services/manejo.service';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';

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
  situacao?: string;
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
  famacha?: number;
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
  castracao: boolean;
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
  situacao?: string;
  manejoAtual?: Partial<ManejoIndividual>;
}

@Component({
  selector: 'app-manejos',
  templateUrl: './manejos.page.html',
  styleUrls: ['./manejos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class Manejospage implements OnInit {
  segmento = 'lote';

  // Variáveis para navegação
  origem: string = 'dashboard';

  // Variáveis para o modal do FAMACHA
  modalFamachaAberto: boolean = false;
  notaFamachaManual: number | null = null;

  // VARIÁVEIS DO MODAL DE STATUS
  modalStatusAberto: boolean = false;
  novoStatus: string = 'ativo';
  dataMudanca: string = '';
  motivoSelecionado: string = '';
  outroMotivo: string = '';
  observacoesStatus: string = '';

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
    id: '',
    brinco: '',
    sexo: '',
    categoria: '',
    idade: '',
    pesoAtual: '',
    manejoAtual: undefined
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

  // Animais (LOTE) - AGORA CARREGADOS DO BANCO
  animais: Animal[] = [];

  constructor(
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private animalService: AnimalService,
    private manejoService: ManejoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarDadosExistentes();
    this.carregarAnimaisReais();

    this.route.queryParams.subscribe(params => {
      const animalId = params['animal'];
      const tab = params['tab'];
      const origem = params['origem'];

      console.log('Parâmetros recebidos:', params);

      if (origem === 'lista-animais' || animalId) {
        this.origem = 'lista-animais';
        this.segmento = 'individual';

        if (animalId) {
          setTimeout(() => {
            this.carregarAnimalIndividual(animalId);
          }, 500);
        }
      } else {
        this.origem = 'dashboard';
        this.segmento = 'lote';
      }
    });
  }


  // ============================================================
  // MÉTODOS DE CONTROLE DE VISIBILIDADE - NOVOS
  // ============================================================

  /**
   * Mostrar seção reprodutiva apenas para fêmeas
   */
  mostrarReprodutivo(): boolean {
    if (!this.animalSelecionado?.sexo) return false;

    const sexo = this.animalSelecionado.sexo.toLowerCase();
    return sexo.includes('fêmea') || sexo.includes('femea') || sexo.includes('fêmea');
  }

  /**
   * Mostrar campo castração apenas para machos não castrados
   */
  mostrarCastracao(): boolean {
    const sexo = this.animalSelecionado.sexo?.toLowerCase();
    const categoria = this.animalSelecionado.categoria?.toLowerCase();

    // Mostrar apenas para machos que não são capões
    return sexo === 'macho' && categoria !== 'capão';
  }

  /**
   * Mostrar opções de parto apenas para fêmeas
   */
  mostrarParto(): boolean {
    return this.animalSelecionado.sexo?.toLowerCase() === 'fêmea';
  }

  /**
   * Mostrar opção de cobertura apenas para fêmeas
   */
  mostrarCobertura(): boolean {
    return this.animalSelecionado.sexo?.toLowerCase() === 'fêmea';
  }

  /**
   * Mostrar opção de aborto apenas para fêmeas
   */
  mostrarAborto(): boolean {
    return this.animalSelecionado.sexo?.toLowerCase() === 'fêmea';
  }

  /**
   * Mostrar problemas reprodutivos para todos os sexos
   */
  mostrarProblemasReprodutivos(): boolean {
    return true; // Disponível para todos
  }

  /**
   * Verificar se animal é capão (já castrado)
   */
  isCapao(): boolean {
    return this.animalSelecionado.categoria?.toLowerCase() === 'capão';
  }

  /**
   * Verificar se animal é macho
   */
  isMacho(): boolean {
    return this.animalSelecionado.sexo?.toLowerCase() === 'macho';
  }

  /**
   * Verificar se animal é fêmea
   */
  isFemea(): boolean {
    return this.animalSelecionado.sexo?.toLowerCase() === 'fêmea';
  }

  // ============================================================
  // MÉTODOS EXISTENTES
  // ============================================================

  carregarAnimaisReais() {
    this.animalService.getAnimais().subscribe({
      next: (animais) => {
        console.log('Animais carregados para manejo:', animais);

        const animaisAtivos = animais.filter(animal =>
          animal.situacao === 'ativo' || animal.situacao === 'marcado para descarte'
        );

        this.animais = animaisAtivos.map(animal => ({
          id: animal.id,
          brinco: animal.brinco,
          sexo: animal.sexo,
          categoria: animal.categoria,
          pesoAtual: animal.peso_atual || 0,
          idade: this.calcularIdadeParaManejo(animal.data_nascimento),
          situacao: animal.situacao || 'ativo',
          selecionado: false,
          manejoTecnico: { peso: null, escore: '', observacoes: '' }
        }));
        console.log('Animais ATIVOS + DESCARTE processados:', this.animais);
      },
      error: (error) => {
        console.error('Erro ao carregar animais:', error);
      }
    });
  }

  // MÉTODO AUXILIAR PARA CALCULAR IDADE
  calcularIdadeParaManejo(dataNascimento: string): number {
    if (!dataNascimento) return 0;

    try {
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();
      const diffMs = hoje.getTime() - nascimento.getTime();
      const diffAnos = diffMs / (1000 * 60 * 60 * 24 * 365.25);

      return Number(diffAnos.toFixed(1));
    } catch (error) {
      return 0;
    }
  }


  voltar(): void {
    const origem = this.route.snapshot.queryParamMap.get('origem');

    if (origem === 'detalhe-animal') {
      // Mantém na aba individual e volta pros detalhes
      const animalId = this.route.snapshot.queryParamMap.get('animal');
      this.router.navigate(['/detalhe-animal', animalId]);
    } else {
      // Outras origens: limpa animal e volta pro lote
      this.animalSelecionado = {
        id: '',
        brinco: '',
        sexo: '',
        categoria: '',
        idade: '',
        pesoAtual: '',
        manejoAtual: undefined
      };
      this.segmento = 'lote';

      if (origem === 'lista-animais') {
        this.router.navigate(['/lista-animais']);
      } else {
        //this.router.navigate(['/dashboard']);
      }
    }
  }

  // MÉTODO PARA CARREGAR ANIMAL INDIVIDUAL PELO ID
  carregarAnimalIndividual(animalId: string): void {
    console.log('Carregando animal individual pelo ID:', animalId);
    console.log('Animais disponíveis:', this.animais);

    const animalEncontrado = this.animais.find(animal => animal.id === animalId);

    if (animalEncontrado) {
      console.log('Animal ENCONTRADO:', animalEncontrado);
      this.animalSelecionado = {
        id: animalEncontrado.id,
        brinco: animalEncontrado.brinco,
        sexo: animalEncontrado.sexo || 'Fêmea',
        categoria: animalEncontrado.categoria,
        idade: animalEncontrado.idade.toString(),
        pesoAtual: animalEncontrado.pesoAtual.toString(),
        situacao: animalEncontrado.situacao || 'ativo',
        manejoAtual: {
          produtorId: 'produtor-123',
          ovinoId: animalEncontrado.id,
          data: new Date(),
          tipo: 'geral',
          manejoEmLote: false,
          observacao: '',
          sanitario: {
            vacinas: [],
            medicacoes: [],
            opg: false
          },
          fisico: {
            casqueamento: { realizado: false, observacao: '' },
            tosquia: false,
            caudectomia: false,
            descorna: false,
            castracao: false
          },
          tecnico: {
            peso: undefined,
            temperatura: undefined,
            escoreCorporal: undefined
          },
          nutricional: {},
          reprodutivo: {
            filhotes: []
          },
          fotos: []
        }
      };
    } else {
      console.log('Animal NÃO ENCONTRADO com ID:', animalId);
      this.animalSelecionado = {
        id: '',
        brinco: 'Animal não encontrado',
        sexo: '',
        categoria: '',
        idade: '',
        pesoAtual: '',
        manejoAtual: undefined
      };
    }
  }

  // ============================================================
  // MÉTODO COMPLETO PARA SALVAR MANEJO EM LOTE
  // ============================================================
  async salvarManejoLote(): Promise<void> {
    // Validações básicas
    if (this.animaisSelecionadosCount === 0) {
      const alert = await this.alertController.create({
        header: 'Atenção',
        message: 'Selecione pelo menos um animal!',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 1. DETECTAR TIPOS DE MANEJO SELECIONADOS (VALIDAÇÃO CORRIGIDA)
    const tipos: string[] = [];

    // Verificar se há manejos FÍSICOS (BASTA TER CHECKBOX MARCADO - NÃO PRECISA DE DADOS)
    const temManejoFisico = this.manejosSelecionados.fisico.length > 0;

    // Verificar se há manejos SANITÁRIOS (PRECISA TER DADOS PREENCHIDOS)
    const temManejoSanitario = this.manejosSelecionados.sanitario.length > 0 && (
      this.dadosManejoLote.vacinas.length > 0 ||
      this.dadosManejoLote.vermifugos.length > 0 ||
      this.dadosManejoLote.medicacoes.length > 0
    );

    // Verificar se há manejos TÉCNICOS (PRECISA TER DADOS PREENCHIDOS)
    const temManejoTecnico = this.manejosSelecionados.tecnico.length > 0 &&
      this.temDadosTecnicosPreenchidos;

    // ADICIONAR TIPOS CONFORME VALIDAÇÃO ESPECÍFICA
    if (temManejoFisico) tipos.push('fisico');
    if (temManejoSanitario) tipos.push('sanitario');
    if (temManejoTecnico) tipos.push('tecnico');

    if (tipos.length === 0) {
      const alert = await this.alertController.create({
        header: 'Atenção',
        message: 'Preencha pelo menos um tipo de manejo (sanitário, físico ou técnico)!',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 2. FILTRAGEM INTELIGENTE DOS ANIMAIS
    const animaisFiltrados = this.animaisSelecionados.filter(animal => {
      // Se inclui manejo físico com castração, filtrar apenas machos não castrados
      if (tipos.includes('fisico') && this.isManejoSelecionado('fisico', 'castracao')) {
        const isMachoNaoCastrado = animal.sexo?.toLowerCase() === 'macho' &&
          animal.categoria?.toLowerCase() !== 'capão';
        return isMachoNaoCastrado;
      }

      // Para outros manejos, incluir todos os animais selecionados
      return true;
    });

    if (animaisFiltrados.length === 0) {
      const alert = await this.alertController.create({
        header: 'Atenção',
        message: 'Nenhum animal atende aos critérios para os manejos selecionados! Ex: Castração só aplica a machos não castrados.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 3. PREPARAR DADOS PARA O BACKEND
    const usuarioLogado = this.authService.getCurrentUser();
    if (!usuarioLogado?.id) {
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Usuário não autenticado!',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const dadosParaEnviar = {
      produtor_id: usuarioLogado.id,
      animais: animaisFiltrados.map(animal => ({
        id: animal.id,
        dados_tecnicos: {
          peso: animal.manejoTecnico.peso || null,
          escore_corporal: animal.manejoTecnico.escore || null,
          temperatura: null
        }
      })),
      tipos: tipos,
      data: new Date().toISOString(),
      observacao: this.dadosManejoLote.observacoes || '',

      // Dados físicos (COMUNS a todos)
      fisico_casqueamento_realizado: this.dadosManejoLote.casqueamento || false,
      fisico_casqueamento_observacao: null,
      fisico_tosquia: this.dadosManejoLote.tosquia || false,
      fisico_caudectomia: this.dadosManejoLote.caudectomia || false,
      fisico_descorna: false,
      fisico_castracao: this.isManejoSelecionado('fisico', 'castracao') || false,

      // Dados sanitários (COMUNS a todos)
      sanitario_famacha: null,
      sanitario_opg: false,

      // Arrays de produtos sanitários
      vacinas: this.dadosManejoLote.vacinas.map(vacina => ({
        produto: vacina.produto,
        dose: vacina.dose,
        via: vacina.via,
        lote: vacina.lote || '',
        fabricante: vacina.fabricante || ''
      })),

      vermifugos: this.dadosManejoLote.vermifugos.map(vermifugo => ({
        produto: vermifugo.produto,
        dose: vermifugo.dose,
        via: vermifugo.via,
        tipo: vermifugo.tipo
      })),

      medicacoes: this.dadosManejoLote.medicacoes.map(medicacao => ({
        produto: medicacao.produto,
        dose: medicacao.dose,
        via: medicacao.via,
        observacoes: medicacao.observacoes || ''
      }))
    };

    console.log('📤 Enviando manejo em lote:', dadosParaEnviar);

    // 4. ENVIAR PARA O BACKEND
    try {
      const response = await this.manejoService.salvarManejoLote(dadosParaEnviar).toPromise();
      console.log('✅ Manejo em lote salvo com sucesso:', response);

      const alert = await this.alertController.create({
        header: 'Sucesso',
        message: `Manejo aplicado para ${animaisFiltrados.length} animais com sucesso!`,
        buttons: ['OK']
      });
      await alert.present();

      // 5. LIMPAR FORMULÁRIOS APÓS SUCESSO
      this.limparFormularios();

    } catch (error: any) {
      console.error('❌ Erro ao salvar manejo em lote:', error);
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Erro ao salvar manejo em lote. Tente novamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }


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
      this.animalSelecionado.manejoAtual!.sanitario!.medicacoes.push({ ...this.medicacaoEditando });
      this.limparMedicacaoIndividual();
    }
  }

  removerMedicacaoIndividual(index: number): void {
    this.animalSelecionado.manejoAtual!.sanitario!.medicacoes.splice(index, 1);
  }

  adicionarVacinaIndividual(): void {
    if (this.vacinaEditando.produto && this.vacinaEditando.dose) {
      this.animalSelecionado.manejoAtual!.sanitario!.vacinas.push({ ...this.vacinaEditando });
      this.limparVacinaIndividual();
    }
  }

  removerVacinaIndividual(index: number): void {
    this.animalSelecionado.manejoAtual!.sanitario!.vacinas.splice(index, 1);
  }

  adicionarFilhote(): void {
    if (this.filhoteEditando.sexo) {
      this.animalSelecionado.manejoAtual!.reprodutivo!.filhotes.push({ ...this.filhoteEditando });
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

  // MÉTODO ATUALIZADO: SALVAR MANEJO INDIVIDUAL NO BANCO
  salvarManejoIndividual(): void {
    if (!this.animalSelecionado.manejoAtual) {
      alert('Erro: Dados do manejo não encontrados');
      return;
    }

    const usuarioLogado = this.authService.getCurrentUser();

    if (!usuarioLogado || !usuarioLogado.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    // DETECTAR AUTOMATICAMENTE OS TIPOS PREENCHIDOS
    const tipos: string[] = [];
    const manejo = this.animalSelecionado.manejoAtual;

    // Verificar dados FÍSICOS
    if (manejo.fisico && (
      manejo.fisico.tosquia ||
      manejo.fisico.caudectomia ||
      manejo.fisico.descorna ||
      manejo.fisico.castracao ||
      (manejo.fisico.casqueamento && manejo.fisico.casqueamento.realizado)
    )) {
      tipos.push('fisico');
    }

    // Verificar dados TÉCNICOS
    if (manejo.tecnico && (
      manejo.tecnico.peso !== undefined ||
      manejo.tecnico.temperatura !== undefined ||
      manejo.tecnico.escoreCorporal !== undefined
    )) {
      tipos.push('tecnico');
    }

    // Verificar dados SANITÁRIOS
    if (manejo.sanitario && (
      manejo.sanitario.famacha !== undefined ||
      manejo.sanitario.opg ||
      (manejo.sanitario.medicacoes && manejo.sanitario.medicacoes.length > 0) ||
      (manejo.sanitario.vacinas && manejo.sanitario.vacinas.length > 0)
    )) {
      tipos.push('sanitario');
    }

    // Verificar dados REPRODUTIVOS
    if (manejo.reprodutivo && (
      manejo.reprodutivo.acao ||
      (manejo.reprodutivo.filhotes && manejo.reprodutivo.filhotes.length > 0)
    )) {
      tipos.push('reprodutivo');
    }

    // Se não detectou nenhum tipo, não permite salvar
    if (tipos.length === 0) {
      alert('Erro: Preencha pelo menos um tipo de manejo (físico, técnico ou sanitário)');
      return;
    }

    const dadosParaSalvar = {
      produtor_id: usuarioLogado.id,
      ovino_id: this.animalSelecionado.id,
      tipos: tipos,
      data: new Date().toISOString(),
      observacao: this.animalSelecionado.manejoAtual.observacao || '',

      // Dados físicos
      fisico_casqueamento_realizado: this.animalSelecionado.manejoAtual.fisico?.casqueamento?.realizado || false,
      fisico_casqueamento_observacao: this.animalSelecionado.manejoAtual.fisico?.casqueamento?.observacao || null,
      fisico_tosquia: this.animalSelecionado.manejoAtual.fisico?.tosquia || false,
      fisico_caudectomia: this.animalSelecionado.manejoAtual.fisico?.caudectomia || false,
      fisico_descorna: this.animalSelecionado.manejoAtual.fisico?.descorna || false,
      fisico_castracao: this.animalSelecionado.manejoAtual.fisico?.castracao || false,

      // Dados técnicos
      tecnico_peso: this.animalSelecionado.manejoAtual.tecnico?.peso || null,
      tecnico_escore_corporal: this.animalSelecionado.manejoAtual.tecnico?.escoreCorporal || null,
      tecnico_temperatura: this.animalSelecionado.manejoAtual.tecnico?.temperatura || null,

      // Sanitário
      sanitario_famacha: this.animalSelecionado.manejoAtual.sanitario?.famacha || null,
      sanitario_opg: this.animalSelecionado.manejoAtual.sanitario?.opg || false,

      // Reprodutivo
      reprodutivo_acao: this.animalSelecionado.manejoAtual.reprodutivo?.acao || null,
      reprodutivo_tipo_parto: this.animalSelecionado.manejoAtual.reprodutivo?.tipoParto || null,
      reprodutivo_habilidade_materna: this.animalSelecionado.manejoAtual.reprodutivo?.habilidadeMaterna || null,
      reprodutivo_quantidade_filhotes: this.animalSelecionado.manejoAtual.reprodutivo?.quantidadeFilhotes || null
    };

    console.log('📤 Enviando dados para o backend:', dadosParaSalvar);
    console.log('🎯 Tipos detectados:', tipos);

    this.manejoService.salvarManejo(dadosParaSalvar).subscribe({
      next: (response) => {
        console.log('✅ Manejo salvo com sucesso:', response);

        // 🔥 ADICIONAR APENAS ESTAS 3 LINHAS - NADA MAIS!
        if (this.animalSelecionado.manejoAtual?.reprodutivo?.acao === 'parto') {
          this.salvarRascunhoParto();
        }
        // 🔥 FIM DA MODIFICAÇÃO

        this.mostrarAlertaSucesso('Manejo salvo com sucesso!');

        // Limpar o formulário após salvar
        this.limparManejoIndividual();
      },
      error: (error: any) => {
        console.error('❌ Erro ao salvar manejo:', error);
        this.mostrarAlertaErro('Erro ao salvar manejo. Tente novamente.');
      }
    });
  }

  // 🔥 ADICIONAR APENAS ESTE MÉTODO NO FINAL - NADA MAIS!
  private salvarRascunhoParto(): void {
    const reprodutivo = this.animalSelecionado.manejoAtual?.reprodutivo;

    if (reprodutivo && reprodutivo.filhotes && reprodutivo.filhotes.length > 0) {
      console.log('👶 Salvando rascunho do parto...');

      // 🔥 CORREÇÃO: USAR ESTRUTURA COMPATÍVEL COM O RASCUNHO SERVICE
      const dadosParaRascunho = {
        dataParto: new Date().toLocaleDateString('pt-BR'),
        tipoParto: 'simples',
        identificacaoMae: this.animalSelecionado.id,
        escoreCorporalMae: '3',
        avaliacaoUbere: '3',
        viabilidadeMae: '5',
        habilidadeMaterna: '3',
        origemPai: 'proprio',
        observacoes: this.animalSelecionado.manejoAtual?.observacao || '',
        filhotes: reprodutivo.filhotes.map((filhote, index) => ({
          numeroBrinco: '',
          sexo: filhote.sexo,
          peso: filhote.pesoNascimento?.toString() || '',
          viabilidade: 'vivo',
          mamouColostro: filhote.mamouColostro || false
        }))
      };

      // 🔥 CORREÇÃO: SALVAR NO FORMATO DO SISTEMA DE RASCUNHOS
      const rascunhoId = `rascunho_${this.animalSelecionado.id}`;

      const rascunho = {
        id: rascunhoId,
        mae_id: this.animalSelecionado.id,
        mae_brinco: this.animalSelecionado.brinco,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
        dados: dadosParaRascunho,
        total_filhotes: reprodutivo.filhotes.length
      };

      // 🔥 CORREÇÃO: USAR O MESMO SISTEMA DE RASCUNHOS EXISTENTE
      const rascunhosExistentes = this.getRascunhosExistentes();
      const outrosRascunhos = rascunhosExistentes.filter((r: any) => r.mae_id !== this.animalSelecionado.id);
      const novosRascunhos = [rascunho, ...outrosRascunhos];

      localStorage.setItem('partos_em_andamento', JSON.stringify(novosRascunhos));

      console.log('💾 Rascunho salvo no formato correto:', rascunho);
      console.log('📊 Filhotes salvos:', reprodutivo.filhotes.length);
    } else {
      console.log('⚠️ Parto sem filhotes - não salvando rascunho');
    }
  }

  // 🔥 ADICIONAR ESTE MÉTODO AUXILIAR
  private getRascunhosExistentes(): any[] {
    try {
      const stored = localStorage.getItem('partos_em_andamento');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }


  // MÉTODO PARA LIMPAR FORMULÁRIO APÓS SALVAR
  private limparManejoIndividual(): void {
    if (this.animalSelecionado.manejoAtual) {
      this.animalSelecionado.manejoAtual.observacao = '';

      // Limpar dados físicos
      if (this.animalSelecionado.manejoAtual.fisico) {
        this.animalSelecionado.manejoAtual.fisico.tosquia = false;
        this.animalSelecionado.manejoAtual.fisico.caudectomia = false;
        this.animalSelecionado.manejoAtual.fisico.descorna = false;
        this.animalSelecionado.manejoAtual.fisico.castracao = false;
        this.animalSelecionado.manejoAtual.fisico.casqueamento = { realizado: false, observacao: '' };
      }

      // Limpar dados técnicos
      if (this.animalSelecionado.manejoAtual.tecnico) {
        this.animalSelecionado.manejoAtual.tecnico.peso = undefined;
        this.animalSelecionado.manejoAtual.tecnico.temperatura = undefined;
        this.animalSelecionado.manejoAtual.tecnico.escoreCorporal = undefined;
      }

      // Limpar sanitário
      if (this.animalSelecionado.manejoAtual.sanitario) {
        this.animalSelecionado.manejoAtual.sanitario.famacha = undefined;
        this.animalSelecionado.manejoAtual.sanitario.opg = false;
      }

      // Limpar reprodutivo
      if (this.animalSelecionado.manejoAtual.reprodutivo) {
        this.animalSelecionado.manejoAtual.reprodutivo.acao = undefined;
        this.animalSelecionado.manejoAtual.reprodutivo.tipoParto = undefined;
        this.animalSelecionado.manejoAtual.reprodutivo.habilidadeMaterna = undefined;
        this.animalSelecionado.manejoAtual.reprodutivo.quantidadeFilhotes = undefined;
        this.animalSelecionado.manejoAtual.reprodutivo.filhotes = [];
      }
    }
  }

  // MÉTODOS AUXILIARES PARA ALERTAS
  private async mostrarAlertaSucesso(mensagem: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarAlertaErro(mensagem: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Erro',
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
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
    const descricoes: { [key: string]: string } = {
      '1': 'Costelas e processos vertebrais visíveis',
      '2': 'Costelas palpáveis, pouca cobertura muscular',
      '3': 'Costelas palpáveis com leve pressão, condição ideal',
      '4': 'Costelas difíceis de palpar, excesso de gordura',
      '5': 'Costelas não palpáveis, obesidade'
    };
    return descricoes[escore] || 'Selecione um escore';
  }
  alternarSegmento(event: any): void {
    this.segmento = event.detail.value;
  }

  temAnimalSelecionado(): boolean {
    return !!this.animalSelecionado?.id;
  }

  verHistorico(animal: any): void {
  if (animal?.id) {
    console.log('Navegando para detalhes do animal:', animal.id);
    this.router.navigate(['/detalhe-animal', animal.id]);
  } else {
    console.warn('ID do animal não disponível:', animal);
  }
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
        tipo: 'geral',
        manejoEmLote: false,
        observacao: '',
        sanitario: {
          vacinas: [],
          medicacoes: [],
          opg: false
        },
        fisico: {
          casqueamento: { realizado: false, observacao: '' },
          tosquia: false,
          caudectomia: false,
          descorna: false,
          castracao: false
        },
        tecnico: {
          peso: undefined,
          temperatura: undefined,
          escoreCorporal: undefined
        },
        nutricional: {},
        reprodutivo: {
          filhotes: []
        },
        fotos: []
      }
    };
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
  // ============================================================
  // MÉTODO ATUALIZADO - APLICAR MANEJO LOTE
  // ============================================================
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

    // Verificar dados técnicos incompletos
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
        return;
      }
    }

    // CHAMAR O NOVO MÉTODO DE SALVAR
    await this.salvarManejoLote();
  }

  voltarDashboard(): void {
    this.limparFormularios();
    this.router.navigate(['/dashboard'], {
      queryParams: { refresh: new Date().getTime() }
    });
  }

  async cancelarManejoLote(): Promise<void> {
    this.limparFormularios();

    // Espera um pouco igual no salvar
    await new Promise(resolve => setTimeout(resolve, 100));

    this.router.navigate(['/dashboard']);
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

  // Método para salvar no banco de dados (simulado)
  private async salvarManejos(manejos: any): Promise<void> {
    console.log('Salvando manejos no banco de dados:', manejos);
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  // Limpar todos os formulários após aplicação (LOTE)
  private limparFormularios(): void {

    // FECHA TODOS OS CARDS
    this.manejosExpandidos = {
      sanitario: false,
      fisico: false,
      tecnico: false,
      detalhesAnimais: false
    };

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
    if (nota === undefined || nota === null) {
      return 'linear-gradient(135deg, #CCCCCC 0%, #DDDDDD 100%)';
    }

    const cores = [
      'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
      'linear-gradient(135deg, #CD5C5C 0%, #F08080 100%)',
      'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
      'linear-gradient(135deg, #FFE4E1 0%, #FAF0F0 100%)',
      'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
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
      manejo.fisico.descorna === true ||
      manejo.fisico.castracao === true
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

  // ... métodos existentes ...

  // 🔥 MÉTODOS DO MODAL DE STATUS (ADICIONAR AQUI)
  abrirModalStatus(): void {
    this.novoStatus = this.animalSelecionado?.situacao || 'ativo';
    this.dataMudanca = new Date().toISOString().split('T')[0];
    this.motivoSelecionado = '';
    this.outroMotivo = '';
    this.observacoesStatus = '';
    this.modalStatusAberto = true;
  }

  fecharModalStatus(): void {
    this.modalStatusAberto = false;
  }

  onStatusChange(event: any): void {
    this.novoStatus = String(event.detail.value);
  }
async confirmarMudancaStatus(): Promise<void> {
  // CORREÇÃO: usar animalSelecionado em vez de animal
  if (!this.novoStatus || this.novoStatus === this.animalSelecionado?.situacao) {
    // Não deixa confirmar se não selecionou novo status ou se é o mesmo
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: 'Selecione um status diferente do atual',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  if (this.novoStatus && this.animalSelecionado?.id) {
    console.log('📤 Enviando para API:', {
      animalId: this.animalSelecionado.id,
      status: this.novoStatus,
      data: this.dataMudanca,
      observacoes: this.observacoesStatus
    });

    try {
      const response = await this.animalService.atualizarStatusAnimal(
        this.animalSelecionado.id,
        this.novoStatus,
        this.dataMudanca,
        this.observacoesStatus
      ).toPromise();

      console.log('✅ Status atualizado no banco:', response);

      // Atualizar o status localmente
      this.animalSelecionado.situacao = this.novoStatus;

      const alert = await this.alertController.create({
        header: 'Sucesso',
        message: 'Status atualizado com sucesso!',
        buttons: ['OK']
      });
      await alert.present();

      this.fecharModalStatus();
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Erro ao atualizar status. Tente novamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  } else {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: 'Selecione um status válido',
      buttons: ['OK']
    });
    await alert.present();
  }
}

  // 🔥 MÉTODO PARA CALCULAR IDADE (se não existir)
  calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return 'N/A';

    try {
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();

      if (isNaN(nascimento.getTime())) {
        return 'N/A';
      }

      const diffMs = hoje.getTime() - nascimento.getTime();
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDias < 0) return 'N/A';

      if (diffDias < 30) {
        return `${diffDias} dias`;
      } else if (diffDias < 365) {
        const diffMeses = Math.floor(diffDias / 30);
        return `${diffMeses} ${diffMeses === 1 ? 'mês' : 'meses'}`;
      } else {
        const diffAnos = Math.floor(diffDias / 365);
        const mesesRestantes = Math.floor((diffDias % 365) / 30);

        if (mesesRestantes > 0) {
          return `${diffAnos} ${diffAnos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
        } else {
          return `${diffAnos} ${diffAnos === 1 ? 'ano' : 'anos'}`;
        }
      }
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return 'N/A';
    }
  }

}


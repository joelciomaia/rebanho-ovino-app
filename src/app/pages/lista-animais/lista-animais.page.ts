import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonIcon, IonButtons, IonBackButton, IonToggle
} from '@ionic/angular/standalone';
import { AnimalService } from '../../services/animal.service';

@Component({
  selector: 'app-lista-animais',
  templateUrl: './lista-animais.page.html',
  styleUrls: ['./lista-animais.page.scss'],
  standalone: true,
  imports: [IonToggle, IonBackButton, IonButtons,
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonIcon
  ]
})
export class ListaAnimaisPage implements OnInit {

  segmento: string = 'todos';
  termoBusca: string = '';
  mostrarInativos: boolean = false;
  filtroAtivo: string = '';
  crescimentoMes: number = 0;

  animais: any[] = [];
  gestantesCache: any[] = []; // Cache das gestantes para busca

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private animalService: AnimalService
  ) { }

  ngOnInit() {
    console.log('ListaAnimaisPage initialized');

    this.route.queryParams.subscribe(params => {
      this.filtroAtivo = params['filtro'] || '';
      console.log('Filtro recebido:', this.filtroAtivo);

      if (this.filtroAtivo === 'descarte') {
        this.mostrarInativos = true;
        this.carregarAnimais();
      } else if (this.filtroAtivo === 'gestante') {
        this.carregarGestantes();
      } else {
        this.carregarAnimais();
      }
    });
  }
  
  calcularCrescimentoMensal() {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const animaisMesAtual = this.animais.filter(a => {
      const data = new Date(a.data_cadastro);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;

    const animaisMesAnterior = this.animais.filter(a => {
      const data = new Date(a.data_cadastro);
      const mesAnterior = (mesAtual - 1 + 12) % 12;
      const anoComparado = mesAtual === 0 ? anoAtual - 1 : anoAtual;
      return data.getMonth() === mesAnterior && data.getFullYear() === anoComparado;
    }).length;

    this.crescimentoMes = animaisMesAtual - animaisMesAnterior;
  }

  carregarAnimais() {
    this.animalService.getAnimais().subscribe({
      next: (animais) => {
        console.log('Animais carregados da API:', animais);

        if (this.filtroAtivo === 'descarte') {
          this.animais = animais.filter(animal =>
            animal.situacao === 'descarte'
          );
          console.log('Animais filtrados para descarte:', this.animais);
        } else {
          this.animais = animais;
        }

        // Pré-carrega a lista de gestantes para busca
        this.preCarregarGestantes();

        // Calcula crescimento mensal
        this.calcularCrescimentoMensal();
      },
      error: (error) => {
        console.error('Erro ao carregar animais:', error);
        /*{ this.animais = [
          
            id: '1',
            brinco: '0145', 
            sexo: 'Fêmea', 
            categoria: 'Matriz', 
            data_nascimento: '2022-04-12', 
            peso_atual: 47, 
            data_atualizacao: new Date(), 
            situacao: 'ativo', 
            raca: 'Santa Inês' 
          },
          { 
            id: '2',
            brinco: '0146', 
            sexo: 'Fêmea', 
            categoria: 'Matriz', 
            data_nascimento: '2022-04-17', 
            peso_atual: 45, 
            data_atualizacao: new Date(), 
            situacao: 'ativo', 
            raca: 'Texel' 
          },
          { 
            id: '3',
            brinco: '0147', 
            sexo: 'Macho', 
            categoria: 'Cordeiro', 
            data_nascimento: '2024-01-15', 
            peso_atual: 25, 
            data_atualizacao: new Date(), 
            situacao: 'ativo', 
            raca: 'Dorper' 
          },
          { 
            id: '4',
            brinco: '0148', 
            sexo: 'Macho', 
            categoria: 'Borrego', 
            data_nascimento: '2023-08-10', 
            peso_atual: 35, 
            data_atualizacao: new Date(), 
            situacao: 'ativo', 
            raca: 'Suffolk' 
          },
          { 
            id: '5',
            brinco: '0149', 
            sexo: 'Macho', 
            categoria: 'Capão', 
            data_nascimento: '2021-05-20', 
            peso_atual: 65, 
            data_atualizacao: new Date(), 
            situacao: 'ativo', 
            raca: 'Ile de France' 
          
        ];}*/
      }
    });
  }

  // NOVO MÉTODO: Pré-carrega gestantes para busca
  preCarregarGestantes() {
    this.animalService.getFemeasGestantes().subscribe({
      next: (gestantes) => {
        this.gestantesCache = gestantes;
        console.log('Gestantes em cache para busca:', this.gestantesCache.length);
      },
      error: (error) => {
        console.error('Erro ao pré-carregar gestantes:', error);
      }
    });
  }

  carregarGestantes() {
    this.animalService.getFemeasGestantes().subscribe({
      next: (gestantes) => {
        console.log('Gestantes carregadas:', gestantes);
        this.animais = gestantes;
        this.gestantesCache = gestantes; // Atualiza o cache
      },
      error: (error) => {
        console.error('Erro ao carregar gestantes:', error);
        this.carregarAnimais();
      }
    });
  }

  limparFiltroDescarte() {
    this.filtroAtivo = '';
    this.mostrarInativos = false;
    this.carregarAnimais();
  }

  limparFiltros() {
    this.filtroAtivo = '';
    this.mostrarInativos = false;
    this.termoBusca = '';
    this.segmento = 'todos';
    this.carregarAnimais();
  }

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

  // NOVO MÉTODO: Verificar se animal é gestante
  private isAnimalGestante(animalId: string): boolean {
    return this.gestantesCache.some(gestante => gestante.id === animalId);
  }

  verDetalhes(animalId: string) {
    console.log('Navegando para detalhes do animal:', animalId);
    this.router.navigate(['/detalhe-animal', animalId]);
  }

  aplicarManejo(animalId: string) {
    console.log('Aplicando manejo para o animal:', animalId);
    this.router.navigate(['/manejos'], {
      queryParams: {
        animal: animalId,
        tab: 'individual',
        origem: 'lista-animais'
      }
    });
  }

  scrollToSelectedTab(tabValue: string) {
    setTimeout(() => {
      const segmentContainer = document.querySelector('.segment-container');
      const selectedTab = document.querySelector(`ion-segment-button[value="${tabValue}"]`);

      if (segmentContainer && selectedTab) {
        const container = segmentContainer as HTMLElement;
        const tab = selectedTab as HTMLElement;

        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  get animaisFiltrados() {
    let filtrados = this.animais;

    if (this.filtroAtivo === 'descarte' || this.filtroAtivo === 'gestante') {
      return filtrados;
    }

    // FILTRO POR SITUACAO
    if (!this.mostrarInativos) {
      filtrados = filtrados.filter(animal => {
        const situacao = animal.situacao?.toLowerCase();

        if (!situacao || situacao === 'undefined' || situacao === 'null' || situacao === '') {
          return true;
        }

        const situacoesInativas = [
          'inativo', 'inativado', 'morto', 'dead',
          'vendido', 'abate', 'abatido'
        ];

        return !situacoesInativas.includes(situacao);
      });
    }

    // FILTRO POR CATEGORIA
    if (this.segmento !== 'todos') {
      filtrados = filtrados.filter(animal => {
        const categoriaAnimal = animal.categoria?.toLowerCase();
        const segmentoSelecionado = this.segmento.toLowerCase();

        const mapeamentoCategorias: any = {
          'matriz': ['matriz', 'matrizes'],
          'carneiro': ['reprodutor', 'carneiro', 'carneiros', 'capão', 'capao'],
          'borrega': ['borrega', 'borregas', 'borregos', 'borrego'],
          'cordeiro': ['cordeiro', 'cordeiros']
        };

        return mapeamentoCategorias[segmentoSelecionado]?.includes(categoriaAnimal);
      });
    }

    // FILTRO POR BUSCA COM PALAVRAS-CHAVE DE GESTAÇÃO
    if (this.termoBusca) {
      const termo = this.termoBusca.toLowerCase().trim();

      // PALAVRAS-CHAVE PARA GESTAÇÃO - LISTA EXPANDIDA
      const palavrasGestacao = [
        'gestante', 'gestantes', 'gestação', 'gestacoes', 'gestaçao', 'gestacoe',
        'prenha', 'prenhas', 'gra', 'grav', 'grávida', 'gravida', 'grávidas', 'gravidas',
        'preñada', 'prenhez', 'pre', 'pren', 'ges', 'gest', 'gesta'
      ];

      // Verifica se o termo contém palavra de gestação
      const buscaPorGestacao = palavrasGestacao.some(palavra =>
        termo.includes(palavra)
      );

      if (buscaPorGestacao) {
        // Filtra apenas animais gestantes
        filtrados = filtrados.filter(animal =>
          this.isAnimalGestante(animal.id)
        );
      } else {
        // Busca normal (brinco, raça)
        filtrados = filtrados.filter(animal =>
          animal.brinco?.toLowerCase().includes(termo) ||
          animal.raca?.toLowerCase().includes(termo)
        );
      }
    }

    return filtrados;
  }

  get estatisticas() {
    const animaisAtivos = this.animais.filter(animal => {
      const situacao = animal.situacao?.toLowerCase();

      if (!situacao || situacao === 'undefined' || situacao === 'null' || situacao === '') {
        return true;
      }

      const situacoesInativas = [
        'inativo', 'inativado', 'morto', 'dead',
        'vendido', 'abate', 'abatido', 'doado'
      ];

      return !situacoesInativas.includes(situacao);
    });

    const matrizes = animaisAtivos.filter(a =>
      ['matriz', 'matrizes'].includes(a.categoria?.toLowerCase())
    ).length;

    const carneiros = animaisAtivos.filter(a =>
      ['reprodutor', 'carneiro', 'carneiros', 'capão', 'capao'].includes(a.categoria?.toLowerCase())
    ).length;

    const borregos = animaisAtivos.filter(a =>
      ['borrega', 'borregas', 'borregos', 'borrego'].includes(a.categoria?.toLowerCase())
    ).length;

    const cordeiros = animaisAtivos.filter(a =>
      ['cordeiro', 'cordeiros'].includes(a.categoria?.toLowerCase())
    ).length;

    const total = animaisAtivos.length;

    return { total, matrizes, carneiros, borregos, cordeiros };
  }

  getIconeStatus(situacao: string): string {
    const situacaoLower = situacao?.toLowerCase() || 'ativo';

    const icones: { [key: string]: string } = {
      'ativo': 'checkmark-circle',
      'descarte': 'warning',
      'morto': 'skull',
      'vendido': 'cash',
      'doado': 'heart',
      'abatido': 'close-circle'
    };

    return icones[situacaoLower] || 'help-circle';
  }

  getClasseStatus(situacao: string): string {
    const situacaoLower = situacao?.toLowerCase() || 'ativo';

    const classes: { [key: string]: string } = {
      'ativo': 'status-ativo',
      'descarte': 'status-descarte',
      'morto': 'status-inativo',
      'vendido': 'status-inativo',
      'doado': 'status-inativo',
      'abatido': 'status-inativo'
    };

    return classes[situacaoLower] || 'status-desconhecido';
  }

  getTooltipStatus(situacao: string): string {
    const situacaoLower = situacao?.toLowerCase() || 'ativo';

    const tooltips: { [key: string]: string } = {
      'ativo': 'Animal Ativo',
      'descarte': 'Marcado para Descarte',
      'morto': 'Animal Morto',
      'vendido': 'Animal Vendido',
      'doado': 'Animal Doado',
      'abatido': 'Animal Abatido'
    };

    return tooltips[situacaoLower] || 'Situação Desconhecida';
  }

  onSearchChange(event: any) {
    this.termoBusca = event.detail.value;
  }

  onSegmentChange(event: any) {
    this.segmento = event.detail.value;
    this.scrollToSelectedTab(event.detail.value);
  }

  onToggleInativos(event: any) {
    this.mostrarInativos = event.detail.checked;
  }
}

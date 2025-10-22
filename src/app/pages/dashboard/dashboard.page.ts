import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimalService } from '../../services/animal.service';
import { AuthService } from '../../services/auth.service';
import { WeatherService } from '../../services/weather.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AtividadeService, Atividade } from '../../services/atividade.service';

// ⬇️ Import do modal de Ajuda (ajuste o caminho se necessário)
import { AjudaModal } from '../../ajuda/ajuda.modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {

  constructor(
    private router: Router,
    private animalService: AnimalService,
    private authService: AuthService,
    private weatherService: WeatherService,
    private rascunhoService: RascunhoService,
    private atividadeService: AtividadeService,
    private modalCtrl: ModalController
  ) { }

  // NOVAS VARIÁVEIS PARA RASCUNHOS
  rascunhosPendentes: any[] = [];
  atividadesRecentes: Atividade[] = [];

  navegarPara(rota: string) {
    this.router.navigate([rota]);
  }

  sair() {
    console.log('Saindo do sistema...');
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  // MÉTODO ATUALIZADO: Abrir perfil no modo edição
  abrirPerfil() {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      console.log('🔍 DEBUG - Usuário atual:', currentUser);
      console.log('🔍 DEBUG - ID do usuário:', currentUser.id);
      console.log('🔍 DEBUG - Tipo do ID:', typeof currentUser.id);

      // Navega para a tela de auth no modo edição
      this.router.navigate(['/auth'], {
        queryParams: {
          modo: 'edicao',
          userId: currentUser.id
        }
      });
    } else {
      console.log('🔍 DEBUG - Nenhum usuário logado');
      // Se não estiver logado, vai para login normal
      this.navegarPara('/auth');
    }
  }

  // NOVO MÉTODO PARA ANIMAIS DESCARTE
  navegarParaAnimaisDescarte() {
    this.router.navigate(['/lista-animais'], {
      queryParams: { filtro: 'descarte' }
    });
  }

  openMenu() {
    const menuDrawer = document.getElementById('menuDrawer');
    const menuOverlay = document.getElementById('menuOverlay');
    if (menuDrawer && menuOverlay) {
      menuDrawer.classList.add('open');
      menuOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenu() {
    const menuDrawer = document.getElementById('menuDrawer');
    const menuOverlay = document.getElementById('menuOverlay');
    if (menuDrawer && menuOverlay) {
      menuDrawer.classList.remove('open');
      menuOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // DADOS DO DASHBOARD - AGORA DINÂMICOS
  dadosDashboard: any = {
    totalAnimais: 0,
    variacaoAnimais: 0,
    femeasGestantes: 0,
    variacaoGestantes: 0,
    animaisDescarte: 0,
    variacaoDescarte: 0,
    alertas: [],
    atividadesRecentes: [],
    clima: {
      temperatura: 0,
      umidade: 0,
      vento: 0,
      chuva: 0,
      previsao: 'Carregando dados climáticos...'
    }
  };

  // ⬇️ Método de abrir ajuda (usado no botão do menu lateral)
  async abrirAjuda() {
    const modal = await this.modalCtrl.create({
      component: AjudaModal,
      cssClass: 'ajuda-modal'
    });
    await modal.present();
  }

  // OBTER ÍCONE DO CLIMA BASEADO NA TEMPERATURA
  getWeatherIcon(): string {
    const temp = this.dadosDashboard.clima.temperatura;
    if (temp >= 30) return 'sunny';
    if (temp >= 20) return 'partly-sunny';
    if (temp >= 10) return 'cloud';
    return 'snow';
  }

  infoFazenda = {
    nome: 'Sistema OvinoGest',
    status: 'Conectado',
    ultimaAtualizacao: new Date()
  };

  ngOnInit() {
    console.log('Dashboard carregado!');
    this.carregarTodosDados();
  }

  // 🔥 NOVO MÉTODO: Executa SEMPRE que a página fica visível
  ionViewWillEnter() {
    console.log('🔄 Dashboard em foco - atualizando dados...');
    this.carregarTodosDados();
  }

  // 🔥 MÉTODO UNIFICADO para carregar tudo
  carregarTodosDados() {
    this.carregarDadosReais();
    this.carregarDadosClima();
    this.carregarRascunhosPendentes();
    this.carregarAtividadesRecentes();
  }

  // NOVO: CARREGAR ATIVIDADES RECENTES
  carregarAtividadesRecentes() {
    this.atividadeService.getAtividadesRecentes().subscribe({
      next: (atividades) => {
        console.log('📊 Atividades recentes carregadas:', atividades.length);
        this.atividadesRecentes = atividades;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar atividades:', error);
        this.atividadesRecentes = [];
      }
    });
  }

  // NOVO: VERIFICAR SE TEM ATIVIDADES
  temAtividadesRecentes(): boolean {
    return this.atividadesRecentes.length > 0;
  }

  // NOVO: FORMATAR DATA DA ATIVIDADE
  formatarDataAtividade(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // NOVO: OBTER ÍCONE DA ATIVIDADE
  getAtividadeIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'nascimento': '🐑',
      'compra': '💰', 
      'manejo': '💉',
      'manejo_lote': '📊',
      'descarte': '⚠️',
      'categoria': '🏷️'
    };
    return icons[tipo] || '📝';
  }

  // NOVO: CARREGAR RASCUNHOS PENDENTES
  carregarRascunhosPendentes() {
    this.rascunhosPendentes = this.rascunhoService.getRascunhos();
    console.log('📂 Rascunhos pendentes:', this.rascunhosPendentes);
  }

  // CORRIGIDO: Continuar rascunho usando localStorage
  continuarRascunho(rascunho: any) {
    console.log('➤ Continuando rascunho com dados:', rascunho);
    localStorage.setItem('rascunho_continuar', JSON.stringify(rascunho));
    this.router.navigate(['/cadastro-animais']);
  }

  /// CORRIGIDO: Excluir por ID do rascunho
  async excluirRascunho(rascunho: any) {
    console.log('🗑️ Excluindo rascunho:', rascunho);
    const confirmacao = confirm(`Deseja excluir o rascunho da mãe ${rascunho.mae_brinco}?`);
    if (confirmacao) {
      this.rascunhoService.excluirRascunho(rascunho.id);
      this.carregarRascunhosPendentes();
    }
  }

  // NOVO: FORMATAR DATA PARA EXIBIÇÃO
  formatarDataRascunho(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // NOVO: VERIFICAR SE TEM ALERTAS (PARA LÓGICA INTELIGENTE)
  temRascunhosPendentes(): boolean {
    return this.rascunhosPendentes.length > 0;
  }

  carregarDadosReais() {
    console.log('Carregando dados reais do dashboard...');

    this.animalService.getAnimais().subscribe({
      next: (ovinos) => {
        console.log('Ovinos carregados:', ovinos);
        this.processarDadosOvinos(ovinos);
        this.carregarFemeasGestantes();
      },
      error: (error) => {
        console.error('Erro ao carregar ovinos:', error);
        this.dadosDashboard.totalAnimais = 0;
        this.dadosDashboard.animaisDescarte = 0;
      }
    });
  }

  // BUSCAR DADOS REAIS DO CLIMA
  carregarDadosClima() {
    const cidade = this.getCidadeUsuario() || 'Abelardo Luz';

    this.weatherService.getCurrentWeather(cidade).subscribe({
      next: (apiData) => {
        const weatherData = this.weatherService.parseWeatherData(apiData);
        this.dadosDashboard.clima = {
          temperatura: weatherData.temperatura,
          umidade: weatherData.umidade,
          vento: weatherData.vento,
          chuva: weatherData.chuva,
          previsao: weatherData.previsao
        };
        console.log('Dados do clima carregados:', weatherData);
      },
      error: (error) => {
        console.error('Erro ao carregar dados do clima:', error);
        this.dadosDashboard.clima = {
          temperatura: 22,
          umidade: 65,
          vento: 12,
          chuva: 0,
          previsao: 'Condições ideais para pastoreio'
        };
      }
    });
  }

  // OBTER CIDADE DO USUÁRIO
  getCidadeUsuario(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.cabanha_municipio || '';
  }

  processarDadosOvinos(ovinos: any[]) {
    const ovinosAtivos = ovinos.filter(ovino =>
      ovino.situacao === 'ativo' || ovino.situacao === 'descarte'
    );

    this.dadosDashboard.totalAnimais = ovinosAtivos.length;

    this.dadosDashboard.animaisDescarte = ovinos.filter(ovino =>
      ovino.situacao === 'descarte'
    ).length;

    console.log('Dados reais processados:', this.dadosDashboard);
  }

  atualizarDashboard(event: any) {
    console.log('Atualizando dashboard...');

    this.animalService.getAnimais().subscribe({
      next: (ovinos) => {
        this.processarDadosOvinos(ovinos);
        this.carregarFemeasGestantes();
        this.carregarDadosClima();
        this.carregarRascunhosPendentes();
        this.carregarAtividadesRecentes();
        event.target.complete();
        console.log('Dashboard atualizado com dados reais!');
      },
      error: (error) => {
        console.error('Erro ao atualizar dashboard:', error);
        event.target.complete();
      }
    });
  }

  // OBTER NOME DA CABANHA EM MAIÚSCULO
  getNomeCabanha(): string {
    const currentUser = this.authService.getCurrentUser();
    let nome: string;

    if (currentUser?.cabanha_nome) {
      nome = currentUser.cabanha_nome;
    } else if (currentUser?.nome_completo) {
      nome = currentUser.nome_completo;
    } else {
      nome = 'Fazenda';
    }

    return nome.toUpperCase();
  }

  // OBTER NOME DO USUÁRIO
  getNomeUsuario(): string {
    const currentUser = this.authService.getCurrentUser();
    const nome = currentUser?.nome_completo || 'Usuário';

    return nome.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  navegarParaGestantes() {
    this.router.navigate(['/lista-animais'], {
      queryParams: { filtro: 'gestante' }
    });
  }

  carregarFemeasGestantes() {
    this.animalService.getFemeasGestantes().subscribe({
      next: (gestantes) => {
        console.log('Fêmeas gestantes:', gestantes);
        this.dadosDashboard.femeasGestantes = gestantes.length;
      },
      error: (error) => {
        console.error('Erro ao carregar gestantes:', error);
        this.dadosDashboard.femeasGestantes = 0;
      }
    });
  }

  handleAlertaClick(alerta: any) {
    console.log('Alerta clicado:', alerta.titulo);

    switch (alerta.tipo) {
      case 'vacinação':
        break;
      case 'reproducao':
        break;
      case 'pesagem':
        break;
    }
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularVariacaoPercentual(valorAtual: number, valorAnterior: number): string {
    if (valorAnterior === 0) return '+100%';

    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return variacao > 0 ? `+${variacao.toFixed(1)}%` : `${variacao.toFixed(1)}%`;
  }

  buscarDadosTempoReal() {
    console.log('Buscando dados em tempo real...');
  }
}
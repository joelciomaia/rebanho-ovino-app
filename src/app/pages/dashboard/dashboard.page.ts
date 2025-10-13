import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimalService } from '../../services/animal.service';
import { AuthService } from '../../services/auth.service';
import { WeatherService } from '../../services/weather.service';

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
    private weatherService: WeatherService
  ) { }

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
    totalAnimais: 0, // ← SERÁ PREENCHIDO DO BANCO
    variacaoAnimais: 0,
    femeasGestantes: 0, // ← SERÁ PREENCHIDO DO BANCO
    variacaoGestantes: 0,
    animaisDescarte: 0, // ← SERÁ PREENCHIDO DO BANCO
    variacaoDescarte: 0,
    alertas: [
      // TODO: IMPLEMENTAR ALERTAS REAIS DO BANCO
      /* EXEMPLO FUTURO:
      {
        tipo: 'vacinação',
        icone: 'medical',
        titulo: 'Vacinação',
        data: 'Hoje',
        descricao: '15 animais precisam da vacina contra clostridiose',
        cor: 'alert-vaccine'
      }
      */
    ],
    atividadesRecentes: [
      // TODO: IMPLEMENTAR ATIVIDADES REAIS DO BANCO
      /* EXEMPLO FUTURO:
      {
        tipo: 'nascimento',
        icone: 'heart',
        titulo: 'Nascimento registrado',
        descricao: 'Cordeiro #249',
        tempo: '2 horas atrás'
      }
      */
    ],
    clima: {
      temperatura: 0, // ← SERÁ PREENCHIDO DA API
      umidade: 0,     // ← SERÁ PREENCHIDO DA API
      vento: 0,       // ← SERÁ PREENCHIDO DA API
      chuva: 0,       // ← SERÁ PREENCHIDO DA API
      previsao: 'Carregando dados climáticos...' // ← SERÁ PREENCHIDO DA API
    }
  };

  // OBTER ÍCONE DO CLIMA BASEADO NA TEMPERATURA
getWeatherIcon(): string {
  const temp = this.dadosDashboard.clima.temperatura;
  if (temp >= 30) return 'sunny';
  if (temp >= 20) return 'partly-sunny';
  if (temp >= 10) return 'cloud';
  return 'snow';
}

  infoFazenda = {
    nome: 'Sistema OvinoGest', // Nome genérico do sistema
    status: 'Conectado',
    ultimaAtualizacao: new Date()
  };

  ngOnInit() {
    console.log('Dashboard carregado!');
    this.carregarDadosReais();
    this.carregarDadosClima(); // ← CARREGA DADOS DO CLIMA
  }

  carregarDadosReais() {
    console.log('Carregando dados reais do dashboard...');
    
    this.animalService.getAnimais().subscribe({
      next: (ovinos) => {
        console.log('Ovinos carregados:', ovinos);
        this.processarDadosOvinos(ovinos);
        
        // CARREGAR FÊMEAS GESTANTES
        this.carregarFemeasGestantes();
      },
      error: (error) => {
        console.error('Erro ao carregar ovinos:', error);
        // Dados de fallback em caso de erro
        this.dadosDashboard.totalAnimais = 0;
        this.dadosDashboard.animaisDescarte = 0;
      }
    });
  }

  // BUSCAR DADOS REAIS DO CLIMA
  carregarDadosClima() {
    const cidade = this.getCidadeUsuario() || 'Abelardo Luz'; // Cidade padrão
    
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
        // Dados simulados em caso de erro na API
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
        this.carregarFemeasGestantes(); // Recarrega gestantes também
        this.carregarDadosClima(); // Recarrega dados do clima
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

    // Converte PARA MAIÚSCULO
    return nome.toUpperCase();
  }

  // OBTER NOME DO USUÁRIO
  getNomeUsuario(): string {
    const currentUser = this.authService.getCurrentUser();
    const nome = currentUser?.nome_completo || 'Usuário';
    
    // Primeira letra maiúscula de cada palavra
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
    
    switch(alerta.tipo) {
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
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {
openMenu() {
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.add('open');
    menuOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  }
}

closeMenu() {
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.remove('open');
    menuOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restaura scroll
  }
}

  // Dados fictícios para o dashboard - depois vêm do banco
  dadosDashboard: any = {
    totalAnimais: 63,
    variacaoAnimais: 12,
    femeasGestantes: 42,
    variacaoGestantes: 5,
    animaisDescarte: 11,
    variacaoDescarte: 2,
    alertas: [
      {
        tipo: 'vacinação',
        icone: 'medical',
        titulo: 'Vacinação',
        data: 'Hoje',
        descricao: '15 animais precisam da vacina contra clostridiose',
        cor: 'alert-vaccine'
      },
      {
        tipo: 'reproducao',
        icone: 'heart',
        titulo: 'Reprodução',
        data: 'Amanhã',
        descricao: '3 fêmeas em período de cobertura',
        cor: 'alert-breeding'
      },
      {
        tipo: 'pesagem',
        icone: 'speedometer',
        titulo: 'Pesagem',
        data: 'Esta semana',
        descricao: '12 cordeiros para pesagem mensal',
        cor: 'alert-weighing'
      }
    ],
    atividadesRecentes: [
      {
        tipo: 'nascimento',
        icone: 'heart',
        titulo: 'Nascimento registrado',
        descricao: 'Cordeiro #249',
        tempo: '2 horas atrás'
      },
      {
        tipo: 'vacinacao',
        icone: 'medical',
        titulo: 'Vacinação aplicada',
        descricao: 'Ovelha #087',
        tempo: '4 horas atrás'
      },
      {
        tipo: 'pesagem',
        icone: 'speedometer',
        titulo: 'Pesagem realizada',
        descricao: 'Borrego #0132',
        tempo: '6 horas atrás'
      }
    ],
    clima: {
      temperatura: 22,
      umidade: 65,
      vento: 12,
      chuva: 0,
      previsao: 'Condições ideais para pastoreio. Sem previsão de chuva para os próximos 3 dias'
    }
  };

  // Informações do usuário e fazenda
  infoFazenda = {
    nome: 'Fazenda São Bento',
    status: 'Relatório atualizado',
    ultimaAtualizacao: new Date()
  };

  constructor() { }

  ngOnInit() {
    console.log('Dashboard carregado!');
    this.carregarDadosDashboard();
  }

  // Método para carregar dados do dashboard
  carregarDadosDashboard() {
    // Aqui depois vai buscar dados reais da API
    console.log('Carregando dados do dashboard...');
    
    // Simula um delay de carregamento
    setTimeout(() => {
      console.log('Dados carregados com sucesso!');
    }, 1000);
  }

  // Método para atualizar os dados manualmente
  atualizarDashboard(event: any) {
    console.log('Atualizando dashboard...');
    
    // Simula uma atualização
    setTimeout(() => {
      this.dadosDashboard.totalAnimais += 1; // Exemplo de atualização
      event.target.complete(); // Finaliza o refresh
      console.log('Dashboard atualizado!');
    }, 1500);
  }

  
  // Método para lidar com cliques nos alertas
  handleAlertaClick(alerta: any) {
    console.log('Alerta clicado:', alerta.titulo);
    
    // Aqui podemos navegar para a tela específica
    switch(alerta.tipo) {
      case 'vacinação':
        // this.navCtrl.navigateForward('/vacinas');
        break;
      case 'reproducao':
        // this.navCtrl.navigateForward('/reproducao');
        break;
      case 'pesagem':
        // this.navCtrl.navigateForward('/pesagem');
        break;
    }
  }

  // Método para formatar a data de atualização
  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para calcular variação percentual (exemplo)
  calcularVariacaoPercentual(valorAtual: number, valorAnterior: number): string {
    if (valorAnterior === 0) return '+100%';
    
    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return variacao > 0 ? `+${variacao.toFixed(1)}%` : `${variacao.toFixed(1)}%`;
  }

  // Método para buscar dados em tempo real
  buscarDadosTempoReal() {
    // Aqui implementaremos websockets ou polling para dados em tempo real
    console.log('Buscando dados em tempo real...');
  }
  
}
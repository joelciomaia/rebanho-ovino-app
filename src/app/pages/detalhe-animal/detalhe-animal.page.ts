import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonSegment, IonSegmentButton, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon, IonLabel, IonModal, IonRadioGroup, IonRadio, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonFooter, AlertController, LoadingController } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { AnimalService } from '../../services/animal.service';
import { ManejoService } from '../../services/manejo.service';
import { OvinoService } from '../../services/ovino.service';

@Component({
  selector: 'app-detalhe-animal',
  templateUrl: './detalhe-animal.page.html',
  styleUrls: ['./detalhe-animal.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel,
    IonModal, IonRadioGroup, IonRadio, IonItem, IonInput, IonSelect,
    IonSelectOption, IonTextarea, CommonModule, IonFooter]
})
export class DetalheAnimalPage implements OnInit {
  animal: any = null;
  animalFotos: any[] = [];
  manejos: any[] = [];
  manejosFiltrados: any[] = [];
  abaAtiva: string = 'todos';
  isCardExpanded: boolean = true;

  // ✅ PROPRIEDADES PARA OS GENITORES COMPLETOS
  maeCompleta: any = null;
  paiCompleto: any = null;
  carregandoGenitores: boolean = false;

  // VARIÁVEIS DO MODAL DE STATUS
  modalStatusAberto: boolean = false;
  novoStatus: string = 'ativo';
  dataMudanca: string = '';
  motivoSelecionado: string = '';
  outroMotivo: string = '';
  observacoesStatus: string = '';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private manejoService: ManejoService,
    private ovinoService: OvinoService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.carregarAnimal();
  }

  // ✅ NAVEGAR PARA EDIÇÃO
  editarAnimal() {
    if (this.animal && this.animal.id) {
      this.router.navigate(['/cadastro-animais', this.animal.id]);
    } else {
      console.error('Animal ou ID não disponível para edição');
      alert('Erro: Não foi possível editar o animal');
    }
  }

  carregarAnimal() {
    const animalId = this.route.snapshot.paramMap.get('id');

    if (animalId) {
      this.animalService.getAnimalById(animalId).subscribe({
        next: (animal) => {
          console.log('📥 Animal CARREGADO nos detalhes:', animal);
          this.animal = animal;
          this.carregarDadosAdicionais();
          this.carregarDadosGenitores();

          // ✅ SE FOR MACHO E ABA ATIVA FOR REPRODUTIVOS, MUDA PARA TODOS
          if (!this.mostrarAbaReprodutivos() && this.abaAtiva === 'reprodutivos') {
            this.abaAtiva = 'todos';
            this.filtrarManejos('todos');
          }
        },
        error: (error) => {
          console.error('Erro ao carregar animal:', error);
        }
      });
    } else {
      console.error('ID do animal não encontrado na rota');
    }
  }

  // ✅ CARREGAR DADOS COMPLETOS DOS GENITORES
  async carregarDadosGenitores() {
    this.carregandoGenitores = true;

    try {
      if (this.animal.mae_id) {
        this.maeCompleta = await this.animalService.getAnimalById(this.animal.mae_id).toPromise();
        console.log('Mãe carregada:', this.maeCompleta);
      }

      if (this.animal.pai_id) {
        this.paiCompleto = await this.animalService.getAnimalById(this.animal.pai_id).toPromise();
        console.log('Pai carregado:', this.paiCompleto);
      }

    } catch (error) {
      console.error('Erro ao carregar dados dos genitores:', error);
    } finally {
      this.carregandoGenitores = false;
    }
  }

  carregarDadosAdicionais() {
    this.carregarFotos();
    this.carregarManejosReais();
    this.filtrarManejos(this.abaAtiva);
  }

  carregarFotos() {
    this.animalFotos = [
      {
        url: 'https://via.placeholder.com/400x300/4CAF50/white?text=Animal+' + (this.animal?.brinco || ''),
        descricao: 'Foto frontal do animal'
      },
      {
        url: 'https://via.placeholder.com/400x300/2196F3/white?text=Animal+Lateral',
        descricao: 'Foto lateral do animal'
      },
      {
        url: 'https://via.placeholder.com/400x300/FF9800/white?text=Animal+Detalhe',
        descricao: 'Detalhe do animal'
      }
    ];
  }

  // ✅ MÉTODO ATUALIZADO - CARREGA MANEJOS REAIS DO BACKEND
  carregarManejosReais() {
    const animalId = this.route.snapshot.paramMap.get('id');

    if (animalId) {
      this.manejoService.getHistoricoAnimal(animalId).subscribe({
        next: (manejos) => {
          console.log('📊 Manejos REAIS carregados do backend:', manejos);
          this.manejos = manejos;
          this.filtrarManejos(this.abaAtiva);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar manejos reais:', error);
          this.manejos = [];
          this.manejosFiltrados = [];
        }
      });
    }
  }

  // ✅ MÉTODO PARA CONTROLAR VISIBILIDADE DA ABA REPRODUTIVOS
  mostrarAbaReprodutivos(): boolean {
    if (!this.animal?.sexo) return false;

    const sexo = this.animal.sexo.toLowerCase();
    // Mostrar apenas para fêmeas
    return sexo.includes('fêmea') || sexo.includes('femea') || sexo === 'fêmea';
  }

  // ✅ MÉTODO NOVO - DETECTAR TIPOS AUTOMATICAMENTE
  detectarTiposManejo(manejo: any): string[] {
    const tipos: string[] = [];

    // Verificar se é TÉCNICO
    if (manejo.tecnico_peso || manejo.tecnico_escore_corporal || manejo.tecnico_temperatura) {
      tipos.push('tecnico');
    }

    // Verificar se é FÍSICO
    if (manejo.fisico_tosquia || manejo.fisico_casqueamento_realizado ||
      manejo.fisico_caudectomia || manejo.fisico_descorna || manejo.fisico_castracao) {
      tipos.push('fisico');
    }

    // Verificar se é SANITÁRIO
    if (manejo.sanitario_famacha || manejo.sanitario_opg ||
      (manejo.vacinas && manejo.vacinas.length > 0) ||
      (manejo.vermifugos && manejo.vermifugos.length > 0) ||
      (manejo.medicacoes && manejo.medicacoes.length > 0)) {
      tipos.push('sanitario');
    }

    // Verificar se é REPRODUTIVO
    if (manejo.reprodutivo_acao || manejo.reprodutivo_tipo_parto ||
      manejo.reprodutivo_habilidade_materna || manejo.reprodutivo_quantidade_filhotes) {
      tipos.push('reprodutivo');
    }

    return tipos.length > 0 ? tipos : ['geral'];
  }

  // MÉTODO PARA OBTER TIPOS (USA DETECÇÃO AUTOMÁTICA SE NECESSÁRIO)
  obterTiposManejo(manejo: any): string[] {
    // Se já tem tipos definidos no banco, usa eles
    if (manejo.tipos && manejo.tipos !== '') {
      return manejo.tipos.split(',');
    }
    // Senão, detecta automaticamente
    return this.detectarTiposManejo(manejo);
  }

  toggleCard() {
    this.isCardExpanded = !this.isCardExpanded;
  }

  // MÉTODO PARA CALCULAR IDADE
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

  // MÉTODOS DO MODAL DE STATUS
  abrirModalStatus(): void {
    this.novoStatus = this.animal?.situacao || 'ativo';
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
    console.log('🔍 Status selecionado:', this.novoStatus);
  }

voltar(): void {
  this.location.back(); // volta para a tela anterior real
}


  confirmarMudancaStatus(): void {
    if (!this.novoStatus || this.novoStatus === this.animal?.situacao) {
      // Não deixa confirmar se não selecionou novo status ou se é o mesmo
      return;
    } else if (this.novoStatus && this.animal?.id) {
      console.log('📤 Enviando para API:', {
        animalId: this.animal.id,
        status: this.novoStatus === 'doacao' ? 'doado' : this.novoStatus,
        data: this.dataMudanca,
        observacoes: this.observacoesStatus,
        categoria: this.animal.categoria
      });

      this.animalService.atualizarStatusAnimal(
        this.animal.id,
        this.novoStatus,
        this.dataMudanca,
        this.observacoesStatus,
      ).subscribe({
        next: (response) => {
          console.log('✅ Status atualizado no banco:', response);
          this.animal.situacao = this.novoStatus;
          alert('Status atualizado com sucesso!');
          this.fecharModalStatus();
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar status:', error);
          alert('Erro ao atualizar status. Tente novamente.');
        }
      });
    } else {
      alert('Selecione um status válido');
    }
  }

  // MÉTODO PARA DEFINIR FOTO DE PERFIL
  setAsProfilePhoto(foto: any) {
    console.log('Definindo como foto de perfil:', foto);
    alert(`Foto definida como perfil: ${foto.descricao}`);
  }

  // MÉTODO PARA ADICIONAR NOVA FOTO
  addNewPhoto() {
    console.log('Adicionando nova foto...');
    const novaFoto = {
      url: 'https://via.placeholder.com/400x300/9C27B0/white?text=Nova+Foto',
      descricao: 'Nova foto adicionada'
    };

    this.animalFotos.push(novaFoto);
    alert('Nova foto adicionada com sucesso!');
  }

  // MÉTODO PARA VISUALIZAR FOTO
  viewPhoto(foto: any) {
    console.log('Visualizando foto:', foto);
    alert(`Visualizando foto: ${foto.descricao}\nURL: ${foto.url}`);
  }

  // MÉTODO PARA EXCLUIR FOTO
  deletePhoto(foto: any) {
    console.log('Excluindo foto:', foto);
    const index = this.animalFotos.indexOf(foto);
    if (index > -1) {
      this.animalFotos.splice(index, 1);
      alert('Foto excluída com sucesso!');
    }
  }

  // MÉTODO PARA SCROLL AUTOMÁTICO NA TAB SELECIONADA
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

  onSegmentChange(event: any) {
    const value = event.detail.value;
    if (value) {
      this.filtrarManejos(value);
      this.scrollToSelectedTab(value);
    } else {
      this.filtrarManejos('todos');
      this.scrollToSelectedTab('todos');
    }
  }

  // MÉTODO ATUALIZADO - USA DETECÇÃO AUTOMÁTICA DE TIPOS
  filtrarManejos(tipo: string) {
    this.abaAtiva = tipo;

    this.manejosFiltrados = this.manejos.filter(manejo => {
      const tipos = this.obterTiposManejo(manejo);

      switch (tipo) {
        case 'todos':
          return true;
        case 'reprodutivos':
          return tipos.includes('reprodutivo');
        case 'tecnicos':
          return tipos.includes('tecnico');
        case 'fisicos':
          return tipos.includes('fisico');
        case 'sanitarios':
          return tipos.includes('sanitario');
        default:
          return false;
      }
    });

    this.scrollToSelectedTab(tipo);
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  obterCorSituacao(situacao: string): string {
    const cores: { [key: string]: string } = {
      'ativo': 'success',
      'vendido': 'warning',
      'descartado': 'medium',
      'morto': 'danger',
      'inativo': 'medium',
      'abatido': 'danger'
    };

    return cores[situacao] || 'medium';
  }

  // MÉTODO PARA GERENCIAR NOME
  async gerenciarNome() {
    const alert = await this.alertController.create({
      header: this.animal?.nome ? 'Editar Nome' : 'Adicionar Nome',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Digite o nome do animal',
          value: this.animal?.nome || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (data.nome && data.nome.trim()) {
              await this.salvarNome(data.nome.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }


  // ✅ MÉTODO CORRIGIDO - usar os mesmos parâmetros da lista
  adicionarManejo() {
    if (this.animal && this.animal.id) {
      console.log('Aplicando manejo para o animal:', this.animal.id);
      this.router.navigate(['/manejos'], {
        queryParams: {
          animal: this.animal.id,
          tab: 'individual',
          origem: 'detalhe-animal'
        }
      });
    } else {
      console.error('Animal ou ID não disponível para manejo');
      alert('Erro: Não foi possível adicionar manejo');
    }
  }

  async salvarNome(nome: string) {
    const loading = await this.loadingController.create({
      message: 'Salvando nome...'
    });
    await loading.present();

    try {
      const nomeFormatado = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

      console.log('📤 Enviando nome para API:', nomeFormatado);

      // ✅ SOLUÇÃO: Enviar apenas os campos essenciais que sabemos que existem
      const dadosParaEnvio = {
        nome: nomeFormatado,
        categoria: this.animal.categoria || 'outro', // 🔥 CAMPO OBRIGATÓRIO
        situacao: this.animal.situacao || 'ativo',   // 🔥 CAMPO OBRIGATÓRIO
        sexo: this.animal.sexo,                      // 🔥 CAMPO OBRIGATÓRIO
        brinco: this.animal.brinco,                  // 🔥 CAMPO OBRIGATÓRIO
        origem: this.animal.origem || 'nascido'      // 🔥 CAMPO OBRIGATÓRIO
      };

      console.log('📤 Dados para envio:', dadosParaEnvio);

      await this.ovinoService.atualizarOvino(this.animal.id, dadosParaEnvio).toPromise();

      this.animal.nome = nomeFormatado;
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Sucesso',
        message: 'Nome salvo com sucesso!',
        buttons: ['OK']
      });
      await alert.present();

    } catch (error: any) {
      await loading.dismiss();

      console.error('❌ Erro ao salvar nome:', error);

      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Erro ao salvar nome. Verifique o console do servidor.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
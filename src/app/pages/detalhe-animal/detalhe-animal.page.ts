import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSegment, IonSegmentButton, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon, IonLabel, IonModal, IonRadioGroup, IonRadio, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonFooter } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { AnimalService } from '../../services/animal.service';

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
  abaAtiva: string = 'vacinas';
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
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService
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
    this.filtrarManejos('vacinas');
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

  carregarManejosReais() {
    const animalId = this.route.snapshot.paramMap.get('id');

    if (animalId) {
      this.animalService.getManejosByAnimalId(animalId).subscribe({
        next: (manejos) => {
          console.log('Manejos REAIS carregados:', manejos);
          this.manejos = manejos;
          this.filtrarManejos(this.abaAtiva);
        },
        error: (error) => {
          console.error('Erro ao carregar manejos reais:', error);
        }
      });
    }
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
  }

  confirmarMudancaStatus(): void {
  if (this.novoStatus && this.animal?.id) {
    console.log('📤 Enviando para API:', {
      animalId: this.animal.id,
      status: this.novoStatus,
      data: this.dataMudanca,
      observacoes: this.observacoesStatus,
      categoria: this.animal.categoria // ✅ Categoria atual
    });

    // ✅ CHAMADA CORRIGIDA - incluindo categoria
    this.animalService.atualizarStatusAnimal(
      this.animal.id,
      this.novoStatus,
      this.dataMudanca,
      this.observacoesStatus,
      //this.animal.categoria // ✅ Passa a categoria atual
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
      this.filtrarManejos('vacinas');
      this.scrollToSelectedTab('vacinas');
    }
  }

  filtrarManejos(tipo: string) {
    this.abaAtiva = tipo;

    this.manejosFiltrados = this.manejos.filter(manejo => {
      switch (tipo) {
        case 'vacinas':
          return manejo.sanitario?.vacinas?.length > 0;
        case 'partos':
          return manejo.tipo === 'reprodutivo' && manejo.reprodutivo?.acao === 'parto';
        case 'sanitarios':
          return manejo.sanitario?.medicacoes?.length > 0;
        case 'tecnicos':
          return manejo.tipo === 'tecnico';
        case 'fotos':
          return true;
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
}
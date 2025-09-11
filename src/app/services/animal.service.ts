import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Componentes Ionic
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
  IonList, IonItem, IonLabel, IonRadioGroup, IonRadio, IonNote,
  IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
  IonDatetime, IonRange, IonIcon, IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cadastro-animais',
  templateUrl: './cadastro-animais.page.html',
  styleUrls: ['./cadastro-animais.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Componentes Ionic
    IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
    IonList, IonItem, IonLabel, IonRadioGroup, IonRadio, IonNote,
    IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
    IonDatetime, IonRange, IonIcon, IonSegment, IonSegmentButton
  ]
})
export class CadastroAnimaisPage implements OnInit {
  
  segmento: string = 'nascidos';
  formNascidos!: FormGroup;
  formComprados!: FormGroup;
  
  // Dados mockados temporariamente
  matrizes: any[] = [
    { numeroBrinco: 'OV2023-001', nome: 'Matriz 1', raca: 'Santa Inês' },
    { numeroBrinco: 'OV2023-002', nome: 'Matriz 2', raca: 'Dorper' }
  ];
  
  reprodutores: any[] = [
    { numeroBrinco: 'OV2022-001', nome: 'Reprodutor 1', raca: 'Santa Inês' },
    { numeroBrinco: 'OV2022-002', nome: 'Reprodutor 2', raca: 'Dorper' }
  ];
  
  racasOvinas: string[] = [
    'Santa Inês', 'Dorper', 'Somalis', 'Morada Nova', 
    'Texel', 'Ile de France', 'Bergamácia', 'Outra'
  ];
  
  fotos: string[] = [];
  
  private fb = inject(FormBuilder);
  
  ngOnInit() {
    this.initForms();
  }
  
  initForms() {
    // Formulário para animais nascidos
    this.formNascidos = this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      peso: [''],
      tipoParto: ['', [Validators.required]],
      viabilidade: ['vivo'],
      mamouColostro: [true],
      identificacaoMae: ['', [Validators.required]],
      origemPai: ['proprio'],
      identificacaoPai: [''],
      identificacaoDoador: [''],
      escoreCorporalMae: [3, [Validators.required]],
      avaliacaoUbere: [3, [Validators.required]],
      viabilidadeMae: [5, [Validators.required]],
      habilidadeMaterna: [3, [Validators.required]],
      observacoes: ['']
    });

    // Formulário para animais comprados
    this.formComprados = this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      dataCompra: ['', [Validators.required]],
      valorCompra: [''],
      vendedor: [''],
      origem: [''],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      statusReprodutivo: ['vazia'],
      peso: [''],
      idadeAproximada: [''],
      numeroDentes: [''],
      escoreCorporal: [3],
      possuiRegistro: [false],
      numeroRegistro: [''],
      entidadeRegistro: ['arco'],
      observacoes: ['']
    });
  }

  // DESCOMENTAR quando o service estiver pronto
  /*
  async carregarDados() {
    try {
      this.matrizes = await this.animalService.getMatrizesAtivas();
      this.reprodutores = await this.animalService.getReprodutoresAtivos();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }
  */

  // Métodos para os labels das avaliações
  getEscoreLabel(valor: number): string {
    const labels: { [key: number]: string } = {
      1: 'Muito Magro', 2: 'Magro', 3: 'Ideal', 4: 'Gordo', 5: 'Muito Gordo'
    };
    return labels[valor] || '';
  }

  getUbereLabel(valor: number): string {
    const labels: { [key: number]: string } = {
      1: 'Muito Ruim', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente'
    };
    return labels[valor] || '';
  }

  getViabilidadeLabel(valor: number): string {
    const labels: { [key: number]: string } = {
      0: 'Óbito', 1: 'Muito Ruim', 2: 'Ruim', 3: 'Regular', 4: 'Boa', 5: 'Excelente'
    };
    return labels[valor] || '';
  }

  getHabilidadeLabel(valor: number): string {
    const labels: { [key: number]: string } = {
      1: 'Muito Ruim', 2: 'Ruim', 3: 'Regular', 4: 'Boa', 5: 'Excelente'
    };
    return labels[valor] || '';
  }

  mudarSegmento() {
    console.log('Segmento alterado para:', this.segmento);
  }

  atualizarValidadoresPai(origem: string) {
    // Lógica para atualizar validadores
    console.log('Origem do pai alterada para:', origem);
  }

  async adicionarFoto() {
    console.log('Adicionar foto');
    this.fotos.push('assets/imagens/placeholder-animal.jpg');
  }

  removerFoto(foto: string) {
    this.fotos = this.fotos.filter(f => f !== foto);
  }

  alternarCamposRegistro() {
    const possuiRegistro = this.formComprados.get('possuiRegistro')?.value;
    console.log('Possui registro:', possuiRegistro);
  }

  async cadastrarNascido() {
    if (this.formNascidos.valid) {
      console.log('Dados do animal nascido:', this.formNascidos.value);
      // DESCOMENTAR quando o service estiver pronto
      // await this.animalService.cadastrarAnimalNascido(this.formNascidos.value);
      alert('Animal nascido cadastrado com sucesso!');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  async cadastrarComprado() {
    if (this.formComprados.valid) {
      console.log('Dados do animal comprado:', this.formComprados.value);
      // DESCOMENTAR quando o service estiver pronto
      // await this.animalService.cadastrarAnimalComprado(this.formComprados.value);
      alert('Animal comprado cadastrado com sucesso!');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }
}
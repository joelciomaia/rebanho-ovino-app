import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Componentes Ionic
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
  IonList, IonItem, IonLabel, IonNote,
  IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
  IonDatetime, IonIcon, IonSegment, IonSegmentButton, IonListHeader,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cadastro-animais',
  templateUrl: './cadastro-animais.page.html',
  styleUrls: ['./cadastro-animais.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Components Ionic
    IonListHeader,
    IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
    IonList, IonItem, IonLabel, IonNote,
    IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox, IonIcon, IonSegment, IonSegmentButton, //IonDatetime
  ],
  providers: [ModalController]
})
export class CadastroAnimaisPage implements OnInit {
  
  segmento: string = 'nascidos';
  segmentoControl = new FormControl('nascidos'); 
  formNascidos!: FormGroup;
  formComprados!: FormGroup;
  
  // NOVAS PROPRIEDADES ADICIONADAS
  animaisFemeas: any[] = [
    { id: 1, brinco: 'OV2023-001', nome: 'Matriz 1' },
    { id: 2, brinco: 'OV2023-002', nome: 'Matriz 2' }
  ];
  
  animaisMachos: any[] = [
    { id: 1, brinco: 'OV2022-001', nome: 'Reprodutor 1' },
    { id: 2, brinco: 'OV2022-002', nome: 'Reprodutor 2' }
  ];
  
  racasOvinas: string[] = [
    'Santa Inês', 'Dorper', 'Somalis', 'Morada Nova', 
    'Texel', 'Ile de France', 'Bergamácia', 'Outra'
  ];
  
  fotos: string[] = [];
  arquivoAnexo: any = null;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

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
      //origemMae: ['proprio'],
      identificacaoMae: [''],
      identificacaoMaeTerceiros: [''],
      origemPai: ['proprio'],
      identificacaoPai: [''],
      identificacaoPaiTerceiros: [''],
      identificacaoSemen: [''],
      escoreCorporalMae: [3],
      avaliacaoUbere: [3],
      viabilidadeMae: [5],
      habilidadeMaterna: [3],
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

  // MÉTODO PARA ABRIR CALENDÁRIO - NASCIMENTO
  async abrirCalendario() {
    const modal = await this.modalController.create({
      component: IonDatetime,
      componentProps: {
        presentation: 'date',
        value: this.formNascidos.get('dataNascimento')?.value,
        showDefaultButtons: true,
        doneText: 'Selecionar',
        cancelText: 'Cancelar'
      },
      cssClass: 'calendario-modal'
    });
    
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.formNascidos.get('dataNascimento')?.setValue(result.data);
      }
    });
    
    await modal.present();
  }


  alternarIdentificacaoMae() {
    const origemMae = this.formNascidos.get('origemMae')?.value;
    
    if (origemMae === 'proprio') {
      this.formNascidos.get('identificacaoMae')?.setValidators([Validators.required]);
      this.formNascidos.get('identificacaoMaeTerceiros')?.clearValidators();
    } else {
      this.formNascidos.get('identificacaoMae')?.clearValidators();
      this.formNascidos.get('identificacaoMaeTerceiros')?.setValidators([Validators.required]);
    }
    
    this.formNascidos.get('identificacaoMae')?.updateValueAndValidity();
    this.formNascidos.get('identificacaoMaeTerceiros')?.updateValueAndValidity();
  }

  alternarIdentificacaoPai() {
    const origemPai = this.formNascidos.get('origemPai')?.value;
    
    if (origemPai === 'proprio') {
      this.formNascidos.get('identificacaoPai')?.setValidators([Validators.required]);
      this.formNascidos.get('identificacaoPaiTerceiros')?.clearValidators();
      this.formNascidos.get('identificacaoSemen')?.clearValidators();
    } else if (origemPai === 'terceiros') {
      this.formNascidos.get('identificacaoPai')?.clearValidators();
      this.formNascidos.get('identificacaoPaiTerceiros')?.setValidators([Validators.required]);
      this.formNascidos.get('identificacaoSemen')?.clearValidators();
    } else {
      this.formNascidos.get('identificacaoPai')?.clearValidators();
      this.formNascidos.get('identificacaoPaiTerceiros')?.clearValidators();
      this.formNascidos.get('identificacaoSemen')?.setValidators([Validators.required]);
    }
    
    this.formNascidos.get('identificacaoPai')?.updateValueAndValidity();
    this.formNascidos.get('identificacaoPaiTerceiros')?.updateValueAndValidity();
    this.formNascidos.get('identificacaoSemen')?.updateValueAndValidity();
  }

  selecionarAnexo() {
    this.arquivoAnexo = { name: 'documento.pdf' };
  }

  mudarSegmento() {
    this.segmento = this.segmentoControl.value || 'nascidos';
  }

  async adicionarFoto() {
    this.fotos.push('assets/imagens/placeholder-animal.jpg');
  }

  removerFoto(foto: string) {
    this.fotos = this.fotos.filter(f => f !== foto);
  }

  alternarCamposRegistro() {
    const possuiRegistro = this.formComprados.get('possuiRegistro')?.value;
  }

  async cadastrarNascido() {
    if (this.formNascidos.valid) {
      console.log('Dados do animal nascido:', this.formNascidos.value);
      alert('Animal nascido cadastrado com sucesso!');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  async cadastrarComprado() {
    if (this.formComprados.valid) {
      console.log('Dados do animal comprado:', this.formComprados.value);
      alert('Animal comprado cadastrado com sucesso!');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

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
}
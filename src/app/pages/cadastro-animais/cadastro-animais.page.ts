import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
  IonList, IonItem, IonLabel, IonNote,
  IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
  IonDatetime, IonIcon, IonSegment, IonSegmentButton, IonListHeader,
  ModalController, LoadingController, AlertController
} from '@ionic/angular/standalone';
import { OvinoService, Genitor, RacaOvina } from '../../services/ovino.service';

@Component({
  selector: 'app-cadastro-animais',
  templateUrl: './cadastro-animais.page.html',
  styleUrls: ['./cadastro-animais.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonListHeader,
    IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
    IonList, IonItem, IonLabel, IonNote,
    IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
    IonIcon, IonSegment, IonSegmentButton,
  ],
  providers: [ModalController]
})
export class CadastroAnimaisPage implements OnInit {
  animalEditando: any = null;
  modoEdicao: boolean = false;
  segmento: string = 'nascidos';
  segmentoControl = new FormControl('nascidos');
  formNascidos!: FormGroup;
  formComprados!: FormGroup;

  paiDisplay: string = '';
  maeDisplay: string = '';
  animaisFemeas: Genitor[] = [];
  animaisMachos: Genitor[] = [];
  racasOvinas: RacaOvina[] = [];

  fotos: string[] = [];
  arquivoAnexo: any = null;
  carregandoGenitores: boolean = false;
  carregandoAnimal: boolean = false;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private http = inject(HttpClient);
  private loadingController = inject(LoadingController);
  private ovinoService = inject(OvinoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async ngOnInit() {
    this.initForms();
    await this.carregarRacas();

    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.modoEdicao = true;
      await this.carregarAnimalParaEdicao(animalId);
    } else {
      this.carregarGenitores();
    }
  }

  async carregarRacas() {
  try {
    console.log('🔍 [DEBUG] Carregando raças...');
    const racas = await this.ovinoService.getRacasOvinas().toPromise();
    console.log('🔍 [DEBUG] Raças retornadas:', racas);
    console.log('🔍 [DEBUG] Número de raças:', racas?.length);
    this.racasOvinas = racas || [];
  } catch (error) {
    console.error('❌ Erro ao carregar raças ovinas:', error);
  }
}

  async carregarAnimalParaEdicao(animalId: string) {
    this.carregandoAnimal = true;
    const loading = await this.loadingController.create({
      message: 'Carregando dados do animal...'
    });
    await loading.present();

    try {
      const animal = await this.ovinoService.getOvinoById(animalId).toPromise();
      this.animalEditando = animal;
      await this.carregarDadosGenitores(animal);

      if (!animal?.data_nascimento) {
        this.segmento = 'comprados';
        this.segmentoControl.setValue('comprados');
        this.preencherFormularioCompradoEdicao(animal);
      } else {
        this.segmento = 'nascidos';
        this.segmentoControl.setValue('nascidos');
        this.preencherFormularioNascidoEdicao(animal);
        await this.carregarGenitores(this.formatarDataParaExibicao(animal.data_nascimento));
      }

      await loading.dismiss();
      this.carregandoAnimal = false;
    } catch (error) {
      await loading.dismiss();
      this.carregandoAnimal = false;
      console.error('Erro ao carregar animal para edição:', error);
      this.mostrarAlerta('Erro', 'Erro ao carregar dados do animal');
    }
  }

  async carregarDadosGenitores(animal: any) {
    try {
      if (animal.mae_id) {
        const mae = await this.ovinoService.getOvinoById(animal.mae_id).toPromise();
        if (mae) this.maeDisplay = this.formatarExibicaoGenitor(mae);
      }
      if (animal.pai_id) {
        const pai = await this.ovinoService.getOvinoById(animal.pai_id).toPromise();
        if (pai) this.paiDisplay = this.formatarExibicaoGenitor(pai);
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos genitores:', error);
    }
  }

  initForms() {
    this.formNascidos = this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimento: [this.obterDataAtualFormatada(), [Validators.required]],
      peso: [''],
      tipoParto: ['simples', [Validators.required]],
      viabilidade: ['vivo'],
      mamouColostro: [true],
      identificacaoMae: ['', [Validators.required]],
      identificacaoMaeTerceiros: [''],
      origemPai: ['proprio'],
      identificacaoPai: [''],
      identificacaoPaiTerceiros: [''],
      identificacaoSemen: [''],
      escoreCorporalMae: ['3'],
      avaliacaoUbere: ['3'],
      viabilidadeMae: ['5'],
      habilidadeMaterna: ['3'],
      observacoes: ['']
    });

    this.formComprados = this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      dataCompra: [this.obterDataAtualFormatada(), [Validators.required]],
      valorCompra: [''],
      vendedor: [''],
      origem: [''],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      statusReprodutivo: ['vazia'],
      peso: [''],
      idadeAproximada: [''],
      numeroDentes: [''],
      escoreCorporal: ['3'],
      possuiRegistro: [false],
      nomeAnimal: [''],
      numeroRegistro: [''],
      entidadeRegistro: ['arco'],
      observacoes: ['']
    });

    this.formNascidos.get('dataNascimento')?.valueChanges.subscribe(data => {
      if (data) this.carregarGenitores(data);
    });

    this.formNascidos.get('identificacaoMae')?.valueChanges.subscribe(() => {
      this.determinarRacaAutomaticamente();
    });

    this.formNascidos.get('identificacaoPai')?.valueChanges.subscribe(() => {
      this.determinarRacaAutomaticamente();
    });

    this.formNascidos.get('origemPai')?.valueChanges.subscribe(() => {
      this.alternarIdentificacaoPai();
    });

    this.formComprados.get('possuiRegistro')?.valueChanges.subscribe(() => {
      this.alternarCamposRegistro();
    });

    this.formComprados.get('sexo')?.valueChanges.subscribe(sexo => {
      if (sexo === 'macho') {
        // Se for macho, limpa o status reprodutivo
        this.formComprados.get('statusReprodutivo')?.setValue('');
      }
    });
  }

  preencherFormularioCompradoEdicao(animal: any) {
    this.formComprados.patchValue({
      numeroBrinco: animal?.brinco || '',
      sexo: animal?.sexo || '',
      dataCompra: this.formatarDataParaExibicao(animal?.data_compra) || this.obterDataAtualFormatada(),
      valorCompra: animal?.valor_compra ?? '',
      vendedor: animal?.vendedor ?? '',
      origem: animal?.origem ?? '',
      raca: animal?.raca_id?.toString() ?? '',
      peso: animal?.peso_atual ?? '',
      idadeAproximada: animal?.idade_aproximada ?? '',
      numeroDentes: animal?.numero_dentes ?? '',
      escoreCorporal: (animal?.escore_corporal ?? '3').toString(),
      possuiRegistro: !!animal?.possui_registro,
      nomeAnimal: animal?.nome ?? '',
      numeroRegistro: animal?.numero_registro ?? '',
      entidadeRegistro: animal?.entidade_registro ?? 'arco',
      statusReprodutivo: animal?.status_reprodutivo ?? 'vazia',
      observacoes: animal?.observacao_compra ?? animal?.observacao_nascimento ?? ''
    });
  }

  preencherFormularioNascidoEdicao(animal: any) {
    this.formNascidos.patchValue({
      numeroBrinco: animal?.brinco || '',
      sexo: animal?.sexo || '',
      dataNascimento: this.formatarDataParaExibicao(animal?.data_nascimento) || this.obterDataAtualFormatada(),
      peso: animal?.peso_nascimento ?? '',
      tipoParto: animal?.tipo_parto_nascimento ?? 'simples',
      viabilidade: this.mapearNumeroParaViabilidade(animal?.vigor_nascimento),
      mamouColostro: animal?.mamou_colostro !== undefined ? Boolean(animal.mamou_colostro) : true,
      identificacaoMae: animal?.mae_id ?? '',
      identificacaoPai: animal?.pai_id ?? '',
      escoreCorporalMae: (animal?.escore_corporal_mae ?? '3').toString(),
      avaliacaoUbere: (animal?.avaliacao_ubre ?? '3').toString(),
      viabilidadeMae: (animal?.viabilidade_mae ?? '5').toString(),
      habilidadeMaterna: (animal?.habilidade_materna_nascimento ?? '3').toString(),
      observacoes: animal?.observacao_nascimento ?? ''
    });

    if (animal?.pai_id) {
      this.formNascidos.patchValue({ origemPai: 'proprio' });
    }
  }

  alternarIdentificacaoPai() {
    const origemPai = this.formNascidos.get('origemPai')?.value;
    if (origemPai === 'proprio') {
      this.formNascidos.get('identificacaoPai')?.setValidators([]);
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

  async carregarGenitores(dataNascimento?: string) {
  console.log('🔍 [DEBUG] Iniciando carregarGenitores com data:', dataNascimento);
  
  this.carregandoGenitores = true;
  try {
    const dataParaBusca = dataNascimento ? this.formatarDataParaBanco(dataNascimento) : undefined;
    
    console.log('🔍 [DEBUG] Data para busca no banco:', dataParaBusca);
    console.log('🔍 [DEBUG] Chamando APIs...');
    
    const [femeas, machos] = await Promise.all([
      this.ovinoService.getFemeasParaMaternidade(dataParaBusca).toPromise(),
      this.ovinoService.getMachosParaReproducao(dataParaBusca).toPromise()
    ]);
    
    console.log('🔍 [DEBUG] Fêmeas retornadas:', femeas);
    console.log('🔍 [DEBUG] Machos retornados:', machos);
    console.log('🔍 [DEBUG] Número de fêmeas:', femeas?.length);
    console.log('🔍 [DEBUG] Número de machos:', machos?.length);
    
    this.animaisFemeas = femeas || [];
    this.animaisMachos = machos || [];
    
  } catch (error) {
    console.error('❌ Erro ao carregar genitores:', error);
    this.animaisFemeas = [];
    this.animaisMachos = [];
  } finally {
    this.carregandoGenitores = false;
    console.log('🔍 [DEBUG] Carregamento finalizado');
  }
}

  async determinarRacaAutomaticamente() {
    const maeId = this.formNascidos.get('identificacaoMae')?.value;
    const paiId = this.formNascidos.get('identificacaoPai')?.value;
    if (maeId && paiId) {
      try {
        const resultado = await this.ovinoService.determinarRacaCordeiro(maeId, paiId).toPromise();
        console.log('Raça determinada automaticamente:', resultado?.raca_id);
      } catch (error) {
        console.error('Erro ao determinar raça:', error);
      }
    }
  }

  formatarExibicaoGenitor(genitor: any): string {
    if (!genitor) return '';
    return `${genitor.brinco}${genitor.nome ? ' - ' + genitor.nome : ''}`;
  }

  private obterDataAtualFormatada(): string {
    const data = new Date();
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private formatarDataParaExibicao(data: string): string {
    if (!data) return '';
    if (data.includes('-')) {
      const partes = data.split('-');
      if (partes.length === 3) {
        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2].substring(0, 2);
        return `${dia}/${mes}/${ano}`;
      }
    }
    return data;
  }

  private formatarDataParaBanco(data: string): string {
    if (!data) return '';
    if (data.includes('/')) {
      const partes = data.split('/');
      if (partes.length === 3) {
        const dia = partes[0];
        const mes = partes[1];
        const ano = partes[2];
        return `${ano}-${mes}-${dia}`;
      }
    }
    return data;
  }

  private mapearNumeroParaViabilidade(numero: number): string {
    const mapeamento: { [key: number]: string } = {
      5: 'vivo', 3: 'fraco', 0: 'natimorto'
    };
    return mapeamento[numero] || 'vivo';
  }

  private mapearViabilidadeParaNumero(viabilidade: string): number {
    const mapeamento: { [key: string]: number } = {
      'vivo': 5, 'fraco': 3, 'natimorto': 0
    };
    return mapeamento[viabilidade] || 3;
  }

  private determinarCategoriaNascido(sexo: string): string {
    return sexo === 'macho' ? 'cordeiros' : 'borregas';
  }

  private determinarCategoriaComprado(formData: any): string {
    const sexo = formData.sexo;
    const idade = formData.idadeAproximada;
    if (sexo === 'macho') {
      return (idade && idade.includes('ano')) ? 'reprodutor' : 'capao';
    } else {
      return (formData.statusReprodutivo === 'prenha' || formData.statusReprodutivo === 'lactante')
        ? 'matriz' : 'borregas';
    }
  }

  async cadastrarNascido() {
    if (this.formNascidos.valid) {
      const loading = await this.loadingController.create({
        message: this.modoEdicao ? 'Atualizando animal...' : 'Cadastrando animal...'
      });
      await loading.present();

      try {
        const formData = this.formNascidos.value;
        const maeId = formData.identificacaoMae;
        let paiId = null;

        if (formData.origemPai === 'proprio') {
          paiId = formData.identificacaoPai;
        }

        let racaDeterminada: number | null = null;
        if (maeId && paiId) {
          try {
            const resultado = await this.ovinoService.determinarRacaCordeiro(maeId, paiId).toPromise();
            racaDeterminada = resultado?.raca_id || null;
          } catch (error) {
            console.warn('Erro ao determinar raça:', error);
          }
        }

        const dadosParaEnvio: any = {
          brinco: formData.numeroBrinco,
          sexo: formData.sexo,
          data_nascimento: this.formatarDataParaBanco(formData.dataNascimento),
          peso_nascimento: formData.peso ? parseFloat(formData.peso) : null,
          tipo_parto_nascimento: formData.tipoParto,
          vigor_nascimento: this.mapearViabilidadeParaNumero(formData.viabilidade),
          mamou_colostro: formData.mamouColostro ? 1 : 0,
          habilidade_materna_nascimento: parseInt(formData.habilidadeMaterna) || 3,
          mae_id: maeId || null,
          pai_id: paiId || null,
          escore_corporal_mae: parseInt(formData.escoreCorporalMae) || 3,
          avaliacao_ubre: parseInt(formData.avaliacaoUbere) || 3,
          viabilidade_mae: parseInt(formData.viabilidadeMae) || 5,
          observacao_nascimento: formData.observacoes || '',
          situacao: 'ativo',
          categoria: this.determinarCategoriaNascido(formData.sexo),
          origem: 'nascido',
          produtor_id: 'd4a3b2c1-1234-5678-90ab-cdef12345678'
        };

        if (racaDeterminada) {
          dadosParaEnvio.raca_id = racaDeterminada;
        }

        let response;
        if (this.modoEdicao && this.animalEditando) {
          response = await this.ovinoService.atualizarOvino(this.animalEditando.id, dadosParaEnvio).toPromise();
        } else {
          response = await this.ovinoService.criarOvino(dadosParaEnvio).toPromise();
        }

        await loading.dismiss();
        this.mostrarAlerta('Sucesso',
          this.modoEdicao ? 'Animal atualizado com sucesso!' : 'Animal nascido cadastrado com sucesso!'
        );

        if (this.modoEdicao) {
          this.router.navigate(['/detalhe-animal', this.animalEditando.id]);
        } else {
          this.formNascidos.reset({
            dataNascimento: this.obterDataAtualFormatada(),
            origemPai: 'proprio',
            mamouColostro: true,
            viabilidade: 'vivo',
            tipoParto: 'simples',
            escoreCorporalMae: '3',
            avaliacaoUbere: '3',
            viabilidadeMae: '5',
            habilidadeMaterna: '3'
          });
          this.fotos = [];
          this.carregarGenitores();
        }

      } catch (error: any) {
        await loading.dismiss();
        console.error('Erro no cadastro:', error);
        if (error?.status === 409) {
          this.mostrarAlerta('Erro', 'Já existe um animal ativo com este número de brinco.');
        } else {
          this.mostrarAlerta('Erro', 'Erro ao processar animal. Tente novamente.');
        }
      }
    } else {
      this.marcarCamposInvalidos(this.formNascidos);
      this.mostrarAlerta('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
    }
  }

  async cadastrarComprado() {
    if (this.formComprados.valid) {
      const loading = await this.loadingController.create({
        message: this.modoEdicao ? 'Atualizando animal...' : 'Cadastrando animal...'
      });
      await loading.present();

      try {
        const formData = this.formComprados.value;
        const dadosParaEnvio: any = {
          brinco: formData.numeroBrinco,
          sexo: formData.sexo,
          raca_id: formData.raca ? parseInt(formData.raca) : null,
          peso_atual: formData.peso ? parseFloat(formData.peso) : null,
          categoria: this.determinarCategoriaComprado(formData),
          situacao: 'ativo',
          observacao_nascimento: formData.observacoes,
          origem: 'comprado',
          produtor_id: 'd4a3b2c1-1234-5678-90ab-cdef12345678',
          data_nascimento: null,
          data_compra: formData.dataCompra ? this.formatarDataParaBanco(formData.dataCompra) : null,
          valor_compra: formData.valorCompra ? parseFloat(formData.valorCompra) : null,
          vendedor: formData.vendedor || null,
          numero_dentes: formData.numeroDentes || null,
          escore_corporal: parseInt(formData.escoreCorporal) || 3,
          possui_registro: formData.possuiRegistro || false,
          numero_registro: formData.numeroRegistro || null,
          entidade_registro: formData.entidadeRegistro || null,
          status_reprodutivo: formData.statusReprodutivo || null,
          idade_aproximada: formData.idadeAproximada || null
        };

        if (formData.possuiRegistro && formData.nomeAnimal) {
          dadosParaEnvio.nome = formData.nomeAnimal;
        }

        let response;
        if (this.modoEdicao && this.animalEditando) {
          response = await this.ovinoService.atualizarOvino(this.animalEditando.id, dadosParaEnvio).toPromise();
        } else {
          response = await this.ovinoService.criarOvino(dadosParaEnvio).toPromise();
        }

        await loading.dismiss();
        this.mostrarAlerta('Sucesso',
          this.modoEdicao ? 'Animal atualizado com sucesso!' : 'Animal comprado cadastrado com sucesso!'
        );

        if (this.modoEdicao) {
          this.router.navigate(['/detalhe-animal', this.animalEditando.id]);
        } else {
          this.formComprados.reset({
            dataCompra: this.obterDataAtualFormatada(),
            escoreCorporal: '3',
            statusReprodutivo: 'vazia',
            possuiRegistro: false,
            entidadeRegistro: 'arco'
          });
          this.fotos = [];
        }

      } catch (error: any) {
        await loading.dismiss();
        console.error('Erro ao processar animal comprado:', error);
        if (error.status === 409) {
          this.mostrarAlerta('Erro', 'Já existe um animal ativo com este número de brinco.');
        } else {
          this.mostrarAlerta('Erro', 'Erro ao processar animal. Tente novamente.');
        }
      }
    } else {
      this.marcarCamposInvalidos(this.formComprados);
      this.mostrarAlerta('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
    }
  }

  private marcarCamposInvalidos(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  private async mostrarAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
  }

  mudarSegmento() {
    this.segmento = this.segmentoControl.value || 'nascidos';
  }

  async abrirCalendario() {
    // Implementação do calendário
  }

  selecionarAnexo() {
    this.arquivoAnexo = { name: 'documento.pdf' };
  }

  async adicionarFoto() {
    this.fotos.push('assets/imagens/placeholder-animal.jpg');
  }

  removerFoto(foto: string) {
    this.fotos = this.fotos.filter(f => f !== foto);
  }

  alternarCamposRegistro() {
    const possuiRegistro = this.formComprados.get('possuiRegistro')?.value;

    if (possuiRegistro) {
      // Mostrar campos de registro
      this.formComprados.get('nomeAnimal')?.setValidators([Validators.required]);
      this.formComprados.get('numeroRegistro')?.setValidators([Validators.required]);
    } else {
      // Ocultar campos de registro
      this.formComprados.get('nomeAnimal')?.clearValidators();
      this.formComprados.get('numeroRegistro')?.clearValidators();
    }

    this.formComprados.get('nomeAnimal')?.updateValueAndValidity();
    this.formComprados.get('numeroRegistro')?.updateValueAndValidity();
  }
}
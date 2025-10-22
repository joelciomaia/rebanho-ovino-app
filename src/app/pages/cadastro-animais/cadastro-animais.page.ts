import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
  IonList, IonItem, IonLabel, IonNote,
  IonInput, IonButton, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
  IonDatetime, IonIcon, IonSegment, IonSegmentButton, IonListHeader,
  ModalController, LoadingController, AlertController
} from '@ionic/angular/standalone';
import { OvinoService, Genitor, RacaOvina } from '../../services/ovino.service';
import { ManejoService } from '../../services/manejo.service';
import { RascunhoService } from '../../services/rascunho.service';


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

  // NOVAS VARIÁVEIS PARA CAROUSEL
  indiceFilhoteAtual: number = 0;
  totalFilhotes: number = 1;

  paiDisplay: string = '';
  maeDisplay: string = '';
  animaisFemeas: Genitor[] = [];
  animaisMachos: Genitor[] = [];
  racasOvinas: RacaOvina[] = [];

  fotos: string[] = [];
  arquivoAnexo: any = null;
  carregandoGenitores: boolean = false;
  carregandoAnimal: boolean = false;

  // VARIÁVEIS AUTO-SAVE
  private rascunhoService = inject(RascunhoService);
  private saveTimeout: any;
  private ultimoSave: string = '';
  private maeAtualId: string = '';

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private http = inject(HttpClient);
  private loadingController = inject(LoadingController);
  private ovinoService = inject(OvinoService);
  private manejoService = inject(ManejoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private detector = inject(ChangeDetectorRef);

  async ngOnInit() {
    this.initForms();
    await this.carregarRacas();

    const rascunhoStorage = localStorage.getItem('rascunho_continuar');
    if (rascunhoStorage) {
      const rascunho = JSON.parse(rascunhoStorage);
      console.log('📥 Rascunho recebido do localStorage:', rascunho);
      this.carregarRascunho(rascunho);
      localStorage.removeItem('rascunho_continuar');
    } else {
      console.log('❌ Nenhum rascunho encontrado');
    }

    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.modoEdicao = true;
      await this.carregarAnimalParaEdicao(animalId);
    } else {
      this.carregarGenitores();
      this.iniciarAutoSave();
    }
  }

  private iniciarAutoSave() {
    window.addEventListener('beforeunload', () => {
      this.salvarRascunhoSeNecessario();
    });
  }

  private carregarRascunho(rascunho: any) {
    console.log('🔄 Carregando rascunho no formulário...');

    this.maeAtualId = rascunho.mae_id;
    this.formNascidos.patchValue(rascunho.dados);

    if (rascunho.dados.filhotes && rascunho.dados.filhotes.length > 0) {
      this.filhotesArray.clear();
      rascunho.dados.filhotes.forEach((filhote: any) => {
        this.filhotesArray.push(this.fb.group(filhote));
      });
      this.totalFilhotes = rascunho.dados.filhotes.length;
      this.indiceFilhoteAtual = 0;
      console.log(`✅ ${this.totalFilhotes} filhotes carregados do rascunho`);
    }

    console.log('✅ Rascunho carregado com sucesso!');
  }

  private salvarRascunhoSeNecessario() {
    const maeId = this.formNascidos.get('identificacaoMae')?.value;
    const dadosAtuais = JSON.stringify(this.formNascidos.value);

    if (this.segmento === 'nascidos' && maeId && dadosAtuais !== this.ultimoSave) {
      const maeSelecionada = this.animaisFemeas.find(f => f.id === maeId);
      const maeBrinco = maeSelecionada?.brinco || 'Mãe não identificada';

      this.rascunhoService.salvarRascunho(this.formNascidos, maeId, maeBrinco);
      this.ultimoSave = dadosAtuais;
      this.maeAtualId = maeId;

      console.log('💾 Auto-save executado para mãe:', maeBrinco);
    }
  }

  async carregarRacas() {
    try {
      const racas = await this.ovinoService.getRacasOvinas().toPromise();
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
      dataParto: [this.obterDataAtualFormatada(), [Validators.required]],
      tipoParto: ['simples', [Validators.required]],
      identificacaoMae: ['', [Validators.required]],
      nomeAnimal: [''],
      escoreCorporalMae: ['3'],
      avaliacaoUbere: ['3'],
      viabilidadeMae: ['5'],
      habilidadeMaterna: ['3'],
      origemPai: ['proprio'],
      identificacaoPai: [''],
      identificacaoPaiTerceiros: [''],
      identificacaoSemen: [''],
      filhotes: this.fb.array([this.criarFormFilhote()]),
      observacoes: ['']
    });

    this.formComprados = this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      nomeAnimal: [''],
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
      numeroRegistro: [''],
      entidadeRegistro: ['arco'],
      observacoes: ['']
    });

    this.formNascidos.get('tipoParto')?.valueChanges.subscribe(tipo => {
      console.log('🔄 Tipo de parto alterado para:', tipo);
      this.ajustarQuantidadeFilhotes();
    });

    this.formNascidos.get('dataParto')?.valueChanges.subscribe(data => {
      if (data) this.carregarGenitores(data);
    });

    this.formNascidos.get('identificacaoMae')?.valueChanges.subscribe(maeId => {
      if (maeId) {
        this.maeAtualId = maeId;
      }
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
        this.formComprados.get('statusReprodutivo')?.setValue('');
      }
    });

    this.filhotesArray.valueChanges.subscribe(() => {
      console.log('🔄 Validação dos filhotes alterada');
    });
  }

  criarFormFilhote(): FormGroup {
    return this.fb.group({
      numeroBrinco: ['', [Validators.required]],
      nomeAnimal: [''],
      sexo: ['', [Validators.required]],
      peso: [''],
      viabilidade: ['vivo'],
      mamouColostro: [true]
    });
  }

  get filhotesArray(): FormArray {
    return this.formNascidos.get('filhotes') as FormArray;
  }

  getFilhoteAtual(): FormGroup {
    return this.filhotesArray.at(this.indiceFilhoteAtual) as FormGroup;
  }

  verificarDadosFilhotes() {
    console.log('🔍 DADOS ATUAIS DOS FILHOTES:');
    this.filhotesArray.controls.forEach((filhote, index) => {
      const dados = (filhote as FormGroup).value;
      console.log(`👶 Filhote ${index + 1}:`, dados);
    });
    console.log('🎯 Filhote atual:', this.indiceFilhoteAtual + 1);
  }

  proximoFilhote() {
    if (this.indiceFilhoteAtual < this.totalFilhotes - 1) {
      this.indiceFilhoteAtual++;
      console.log(`➡️ Próximo filhote: ${this.indiceFilhoteAtual + 1}/${this.totalFilhotes}`);
      this.verificarDadosFilhotes();
    }
  }

  filhoteAnterior() {
    if (this.indiceFilhoteAtual > 0) {
      this.indiceFilhoteAtual--;
      console.log(`⬅️ Filhote anterior: ${this.indiceFilhoteAtual + 1}/${this.totalFilhotes}`);
      this.verificarDadosFilhotes();
    }
  }

  private limparFormularioFilhotes() {
    this.filhotesArray.controls.forEach((filhote, index) => {
      (filhote as FormGroup).reset({
        numeroBrinco: '',
        nomeAnimal: '',
        sexo: '',
        peso: '',
        viabilidade: 'vivo',
        mamouColostro: true
      });
    });
  }

  ajustarQuantidadeFilhotes() {
    const tipoParto = this.formNascidos.get('tipoParto')?.value;
    const quantidades: { [key: string]: number } = {
      'simples': 1,
      'duplo': 2,
      'triplo': 3,
      'quadruplo': 4
    };

    const novaQuantidade = quantidades[tipoParto] || 1;
    console.log(`🔄 Ajustando filhotes: ${this.totalFilhotes} → ${novaQuantidade}`);

    this.limparFormularioFilhotes();
    this.totalFilhotes = novaQuantidade;

    const currentLength = this.filhotesArray.length;

    if (this.totalFilhotes > currentLength) {
      for (let i = currentLength; i < this.totalFilhotes; i++) {
        this.filhotesArray.push(this.criarFormFilhote());
        console.log(`➕ Adicionado filhote ${i + 1}`);
      }
    } else if (this.totalFilhotes < currentLength) {
      for (let i = currentLength - 1; i >= this.totalFilhotes; i--) {
        this.filhotesArray.removeAt(i);
        console.log(`➖ Removido filhote ${i + 1}`);
      }
    }

    if (this.indiceFilhoteAtual >= this.totalFilhotes) {
      this.indiceFilhoteAtual = this.totalFilhotes - 1;
    }

    console.log(`✅ Carousel ajustado: ${this.totalFilhotes} filhotes, índice: ${this.indiceFilhoteAtual}`);
    this.detector.detectChanges();
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
      dataParto: this.formatarDataParaExibicao(animal?.data_nascimento) || this.obterDataAtualFormatada(),
      tipoParto: animal?.tipo_parto_nascimento ?? 'simples',
      identificacaoMae: animal?.mae_id ?? '',
      identificacaoPai: animal?.pai_id ?? '',
      nomeAnimal: animal?.nome ?? '',
      escoreCorporalMae: (animal?.escore_corporal_mae ?? '3').toString(),
      avaliacaoUbere: (animal?.avaliacao_ubre ?? '3').toString(),
      viabilidadeMae: (animal?.viabilidade_mae ?? '5').toString(),
      habilidadeMaterna: (animal?.habilidade_materna_nascimento ?? '3').toString(),
      observacoes: animal?.observacao_nascimento ?? ''
    });

    if (this.filhotesArray.length > 0) {
      this.filhotesArray.at(0).patchValue({
        numeroBrinco: animal?.brinco || '',
        nomeAnimal: animal?.nome || '',
        sexo: animal?.sexo || '',
        peso: animal?.peso_nascimento ?? '',
        viabilidade: this.mapearNumeroParaViabilidade(animal?.vigor_nascimento),
        mamouColostro: animal?.mamou_colostro !== undefined ? Boolean(animal.mamou_colostro) : true
      });
    }

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

      const [femeas, machos] = await Promise.all([
        this.ovinoService.getFemeasParaMaternidade(dataParaBusca).toPromise(),
        this.ovinoService.getMachosParaReproducao(dataParaBusca).toPromise()
      ]);

      this.animaisFemeas = femeas || [];
      this.animaisMachos = machos || [];

    } catch (error) {
      console.error('❌ Erro ao carregar genitores:', error);
      this.animaisFemeas = [];
      this.animaisMachos = [];
    } finally {
      this.carregandoGenitores = false;
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
    console.log('🔄 Iniciando cadastro de nascido...');
    console.log('📋 Form válido:', this.formNascidos.valid);
    console.log('👶 Filhotes válidos:', this.validarFilhotes());
    console.log('👥 Número de filhotes:', this.totalFilhotes);

    if (this.formNascidos.valid && this.validarFilhotes()) {
      const loading = await this.loadingController.create({
        message: 'Cadastrando parto completo...'
      });
      await loading.present();

      try {
        const formData = this.formNascidos.value;
        const maeId = formData.identificacaoMae;
        const dataParto = this.formatarDataParaBanco(formData.dataParto);

        console.log('📝 Dados do parto:', {
          maeId,
          dataParto,
          tipoParto: formData.tipoParto,
          totalFilhotes: this.totalFilhotes
        });

        const manejoData = {
          produtor_id: 'd4a3b2c1-1234-5678-90ab-cdef12345678',
          ovino_id: maeId,
          data: new Date().toISOString(),
          tipos: ['reprodutivo'],
          reprodutivo_acao: 'parto',
          reprodutivo_tipo_parto: formData.tipoParto,
          reprodutivo_habilidade_materna: parseInt(formData.habilidadeMaterna) || 3,
          reprodutivo_quantidade_filhotes: this.totalFilhotes,
          tecnico_escore_corporal: parseInt(formData.escoreCorporalMae) || 3,
          observacao: `Parto ${formData.tipoParto} - ${formData.observacoes || 'Sem observações'}`
        };

        await this.manejoService.salvarManejo(manejoData).toPromise();
        console.log('✅ Manejo reprodutivo criado para a mãe');

        let primeiroAnimalId: string | null = null;

        // ✅ CORREÇÃO: DIFERENCIAR ENTRE EDIÇÃO E CRIAÇÃO
        if (this.modoEdicao && this.animalEditando) {
          // ✅ MODO EDIÇÃO - ATUALIZAR APENAS O ANIMAL EM EDIÇÃO
          const filhote = formData.filhotes[0];
          console.log(`👶 Editando filhote existente:`, filhote);

          const dadosFilhote = await this.prepararDadosFilhote(filhote, formData, maeId, dataParto);
          const response = await this.ovinoService.atualizarOvino(this.animalEditando.id, dadosFilhote).toPromise();

          primeiroAnimalId = this.animalEditando.id;
          console.log('✅ Animal atualizado:', primeiroAnimalId);
        } else {
          // ✅ MODO CRIAÇÃO - CRIAR TODOS OS FILHOTES
          for (let i = 0; i < formData.filhotes.length; i++) {
            const filhote = formData.filhotes[i];
            console.log(`👶 Processando filhote ${i + 1}:`, filhote);

            const dadosFilhote = await this.prepararDadosFilhote(filhote, formData, maeId, dataParto);
            const response = await this.ovinoService.criarOvino(dadosFilhote).toPromise();

            if (i === 0 && response && response.id) {
              primeiroAnimalId = response.id;
              console.log('🎯 Primeiro animal criado com ID:', primeiroAnimalId);
            }
          }
          console.log('✅ Todos os filhotes cadastrados');
        }

        this.rascunhoService.limparRascunho(maeId);

        await loading.dismiss();

        if (primeiroAnimalId) {
          this.mostrarAlertaESeguir('Sucesso', 'Parto cadastrado com sucesso!', primeiroAnimalId);
        } else {
          this.mostrarAlerta('Sucesso', 'Parto cadastrado com sucesso!');
          this.limparFormularioNascimento();
        }

      } catch (error: any) {
        await loading.dismiss();
        console.error('Erro no cadastro do parto:', error);
        if (error?.status === 409) {
          this.mostrarAlerta('Erro', 'Já existe um animal ativo com este número de brinco.');
        } else {
          this.mostrarAlerta('Erro', 'Erro ao cadastrar parto. Tente novamente.');
        }
      }
    } else {
      console.log('❌ Formulário inválido - marcando campos...');
      this.marcarCamposInvalidos(this.formNascidos);
      this.mostrarAlerta('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
    }
  }

  validarFilhotes(): boolean {
    const todosValidos = this.filhotesArray.controls.every((filhote, index) => {
      const form = filhote as FormGroup;
      const brincoValido = form.get('numeroBrinco')?.valid && form.get('numeroBrinco')?.value;
      const sexoValido = form.get('sexo')?.valid && form.get('sexo')?.value;

      console.log(`👶 Filhote ${index + 1}: brinco=${brincoValido}, sexo=${sexoValido}`);

      return brincoValido && sexoValido;
    });

    console.log(`✅ Todos os ${this.filhotesArray.length} filhotes válidos: ${todosValidos}`);
    return todosValidos;
  }

  private async mostrarAlertaESeguir(titulo: string, mensagem: string, animalId: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: [
        {
          text: 'Ver Animal',
          handler: () => {
            this.router.navigate(['/detalhe-animal', animalId]);
          }
        },
        {
          text: 'Cadastrar Outro',
          role: 'cancel',
          handler: () => {
            this.limparFormularioNascimento();
          }
        }
      ]
    });
    await alert.present();
  }

  async prepararDadosFilhote(filhote: any, formData: any, maeId: string, dataParto: string): Promise<any> {
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

    return {
      brinco: filhote.numeroBrinco,
      nome: filhote.nomeAnimal || formData.nomeAnimal || null,
      sexo: filhote.sexo,
      data_nascimento: dataParto,
      peso_nascimento: filhote.peso ? parseFloat(filhote.peso) : null,
      tipo_parto_nascimento: formData.tipoParto,
      vigor_nascimento: this.mapearViabilidadeParaNumero(filhote.viabilidade),
      mamou_colostro: filhote.mamouColostro ? 1 : 0,
      habilidade_materna_nascimento: parseInt(formData.habilidadeMaterna) || 3,
      mae_id: maeId,
      pai_id: paiId,
      escore_corporal_mae: parseInt(formData.escoreCorporalMae) || 3,
      avaliacao_ubre: parseInt(formData.avaliacaoUbere) || 3,
      viabilidade_mae: parseInt(formData.viabilidadeMae) || 5,
      observacao_nascimento: formData.observacoes || '',
      situacao: 'ativo',
      categoria: this.determinarCategoriaNascido(filhote.sexo),
      origem: 'nascido',
      produtor_id: 'd4a3b2c1-1234-5678-90ab-cdef12345678',
      ...(racaDeterminada && { raca_id: racaDeterminada })
    };
  }

  ngOnDestroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }

  limparFormularioNascimento() {
    this.formNascidos.reset({
      dataParto: this.obterDataAtualFormatada(),
      tipoParto: 'simples',
      origemPai: 'proprio',
      escoreCorporalMae: '3',
      avaliacaoUbere: '3',
      viabilidadeMae: '5',
      habilidadeMaterna: '3'
    });

    this.filhotesArray.clear();
    this.filhotesArray.push(this.criarFormFilhote());
    this.indiceFilhoteAtual = 0;
    this.totalFilhotes = 1;

    this.fotos = [];
    this.carregandoGenitores = false;
    this.carregarGenitores();
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
          nome: formData.nomeAnimal || null,
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
          await loading.dismiss();
          this.mostrarAlerta('Sucesso', 'Animal atualizado com sucesso!');
          this.router.navigate(['/detalhe-animal', this.animalEditando.id]);
        } else {
          response = await this.ovinoService.criarOvino(dadosParaEnvio).toPromise();
          await loading.dismiss();

          if (response && response.id) {
            this.mostrarAlertaESeguir('Sucesso', 'Animal comprado cadastrado com sucesso!', response.id);
          } else {
            this.mostrarAlerta('Sucesso', 'Animal comprado cadastrado com sucesso!');
            this.formComprados.reset({
              dataCompra: this.obterDataAtualFormatada(),
              escoreCorporal: '3',
              statusReprodutivo: 'vazia',
              possuiRegistro: false,
              entidadeRegistro: 'arco'
            });
            this.fotos = [];
          }
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
      this.formComprados.get('nomeAnimal')?.setValidators([Validators.required]);
      this.formComprados.get('numeroRegistro')?.setValidators([Validators.required]);
    } else {
      this.formComprados.get('nomeAnimal')?.clearValidators();
      this.formComprados.get('numeroRegistro')?.clearValidators();
    }

    this.formComprados.get('nomeAnimal')?.updateValueAndValidity();
    this.formComprados.get('numeroRegistro')?.updateValueAndValidity();
  }

  //Voltar para a tela de origem
  private location = inject(Location);
  voltar() {
    this.location.back();
  }
}
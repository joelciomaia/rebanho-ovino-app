import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, CommonModule]
})
export class AuthPage implements OnInit {
  // Controle de modo (login/cadastro/edição)
  isLogin: boolean = true;
  isModoEdicao: boolean = false;
  userId: string = '';

  // Dados para login
  loginEmail: string = '';
  loginPassword: string = '';

  // Controle de visualização de senha
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  // Dados para cadastro - NOVA ESTRUTURA
  registerData = {
    nomeCompleto: '',
    email: '',
    telefoneWhatsapp: '',
    preferenciaRecuperacao: 'whatsapp',
    senha: '',
    cabanha: {
      nome: '',
      municipio: '',
      estado: '',
      localizacaoLivre: '',
      coordenadas: {
        latitude: null,
        longitude: null
      }
    }
  };

  registerConfirmPassword: string = '';
  aceitouTermos: boolean = false;

  // Estados de loading
  isLoading: boolean = false;

  // Lista de estados brasileiros
  estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    console.log('🔍 [AuthPage] Componente inicializado');

    // Verifica se está no modo edição
    this.route.queryParams.subscribe(params => {
      console.log('📋 [AuthPage] Parâmetros da URL:', params);
      if (params['modo'] === 'edicao' && params['userId']) {
        this.isModoEdicao = true;
        this.userId = params['userId'];
        console.log('🔄 [AuthPage] Modo edição ativado para userId:', this.userId);
        this.carregarDadosUsuario();
      }
    });
  }

  // Carregar dados do usuário para edição
  carregarDadosUsuario() {
    this.isLoading = true;
    console.log('🔍 [AuthPage] Carregando dados do usuário...');

    // PRIMEIRO muda para o modo cadastro/edição
    this.isLogin = false;

    console.log('👤 [AuthPage] Tentando carregar perfil para userId:', this.userId);

    // SOLUÇÃO ALTERNATIVA: Usa os dados já salvos no AuthService
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.id === this.userId) {
      this.isLoading = false;
      console.log('✅ [AuthPage] Usando dados do usuário logado:', currentUser);

      // Preenche os dados do formulário
      this.registerData.nomeCompleto = currentUser.nome_completo;
      this.registerData.email = currentUser.email;
      this.registerData.telefoneWhatsapp = currentUser.telefone_whatsapp || '';
      this.registerData.preferenciaRecuperacao = currentUser.preferencia_recuperacao || 'whatsapp';

      // Dados da cabanha
      this.registerData.cabanha.nome = currentUser.cabanha_nome || '';
      this.registerData.cabanha.municipio = currentUser.cabanha_municipio || '';
      this.registerData.cabanha.estado = currentUser.cabanha_estado || '';
      this.registerData.cabanha.localizacaoLivre = currentUser.cabanha_localizacao_livre || '';

    } else {
      // Se não tiver os dados, tenta pela API (sem parseInt - UUID é string)
      this.authService.getProfile(this.userId).subscribe({
        next: (user) => {
          this.isLoading = false;
          console.log('✅ [AuthPage] Dados recebidos do backend:', user);

          // Preenche os dados do formulário
          this.registerData.nomeCompleto = user.nome_completo;
          this.registerData.email = user.email;
          this.registerData.telefoneWhatsapp = user.telefone_whatsapp || '';
          this.registerData.preferenciaRecuperacao = user.preferencia_recuperacao || 'whatsapp';

          // Dados da cabanha
          this.registerData.cabanha.nome = user.cabanha_nome || '';
          this.registerData.cabanha.municipio = user.cabanha_municipio || '';
          this.registerData.cabanha.estado = user.cabanha_estado || '';
          this.registerData.cabanha.localizacaoLivre = user.cabanha_localizacao_livre || '';
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ [AuthPage] Erro ao carregar dados da API:', error);
          this.showAlert('Erro', 'Não foi possível carregar os dados do perfil');
        }
      });
    }
  }

  // Alternar entre login e cadastro
  toggleAuthMode() {
    console.log('🔄 [AuthPage] Alternando modo:', this.isLogin ? 'LOGIN → CADASTRO' : 'CADASTRO → LOGIN');
    this.isLogin = !this.isLogin;
    this.clearFormFields();
  }

  // Limpar campos do formulário
  private clearFormFields() {
    console.log('🧹 [AuthPage] Limpando campos do formulário');
    if (this.isLogin) {
      // Limpa dados do cadastro
      this.registerData = {
        nomeCompleto: '',
        email: '',
        telefoneWhatsapp: '',
        preferenciaRecuperacao: 'whatsapp',
        senha: '',
        cabanha: {
          nome: '',
          municipio: '',
          estado: '',
          localizacaoLivre: '',
          coordenadas: {
            latitude: null,
            longitude: null
          }
        }
      };
      this.registerConfirmPassword = '';
      this.aceitouTermos = false;
    } else {
      // Limpa dados do login
      this.loginEmail = '';
      this.loginPassword = '';
    }
  }

  // Validar formulário de cadastro/edição
  formularioValido(): boolean {
    if (this.isModoEdicao) {
      // No modo edição, apenas nome e email são obrigatórios
      const valido = !!(this.registerData.nomeCompleto && this.registerData.email);
      console.log('✅ [AuthPage] Formulário edição válido:', valido);
      return valido;
    } else {
      // No modo cadastro: nome, email, senha, confirmação de senha e termos
      const valido = !!(this.registerData.nomeCompleto &&
        this.registerData.email &&
        this.registerData.senha &&
        this.registerConfirmPassword &&
        this.aceitouTermos);
      console.log('✅ [AuthPage] Formulário cadastro válido:', valido);
      return valido;
    }
  }

  // Método de login com debug NA TELA
  async loginComDebug() {
    let debugInfo = '=== 🔍 DEBUG - INICIANDO LOGIN ===\n\n';

    debugInfo += `📧 Email: ${this.loginEmail}\n`;
    debugInfo += `🔑 Senha presente: ${!!this.loginPassword ? 'SIM' : 'NÃO'}\n`;
    debugInfo += `📍 URL do backend: http://192.168.1.195:3000/auth/login\n`;
    debugInfo += `📱 Platform: Cordova/Android\n\n`;
    debugInfo += `📡 Tentando conectar...`;

    // Mostra alerta com informações de debug
    const alertDialog = await this.alertController.create({
      header: '🔍 DEBUG - Informações',
      message: `<pre style="font-size: 12px">${debugInfo}</pre>`,
      buttons: [
        {
          text: 'Continuar Login',
          handler: () => {
            console.log('=== 🚀 CHAMANDO LOGIN ORIGINAL ===');
            this.login();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alertDialog.present();
  }

  // Processar login
  async login() {
    console.log('🔍 [AuthPage] Iniciando processo de login...');
    console.log('📧 [AuthPage] Email:', this.loginEmail);
    console.log('🔑 [AuthPage] Senha:', '[PROTEGIDO]');

    // Validação
    if (!this.loginEmail || !this.loginPassword) {
      console.log('❌ [AuthPage] Campos não preenchidos');
      this.showAlert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    this.isLoading = true;
    console.log('⏳ [AuthPage] Loading iniciado');

    const loading = await this.loadingController.create({
      message: 'Entrando...'
    });

    await loading.present();
    console.log('⏳ [AuthPage] Loading apresentado');

    // Login REAL com backend
    console.log('🚀 [AuthPage] Chamando AuthService.login()');
    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        console.log('✅ [AuthPage] Login bem-sucedido no componente');
        this.isLoading = false;
        loading.dismiss();
        console.log('🏠 [AuthPage] Navegando para /tabs');

        //this.showSuccessAlert('Login realizado com sucesso!');
        this.router.navigate(['/tabs']);
      },
      error: (error) => {
        console.error('❌ [AuthPage] Erro no login no componente:', error);
        this.isLoading = false;
        loading.dismiss();

        const errorMessage = error.error?.erro || 'Erro ao fazer login';
        console.error('💬 [AuthPage] Mensagem de erro:', errorMessage);

        // Mostra alerta de erro com detalhes
        this.showAlert('Erro no Login',
          `Mensagem: ${errorMessage}\n\n` +
          `Status: ${error.status || 'N/A'}\n` +
          `URL: ${error.url || 'N/A'}\n` +
          `Detalhes: ${JSON.stringify(error.error || {})}`
        );
      }
    });
  }

  // Processar cadastro OU atualização
  async register() {
    console.log('🔍 [AuthPage] Iniciando processo de registro...');

    if (!this.formularioValido()) {
      console.log('❌ [AuthPage] Formulário inválido');
      this.showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios' + (this.isModoEdicao ? '' : ' e aceite os termos'));
      return;
    }

    this.isLoading = true;
    console.log('⏳ [AuthPage] Loading iniciado para registro');

    const loading = await this.loadingController.create({
      message: this.isModoEdicao ? 'Atualizando perfil...' : 'Criando conta...'
    });

    await loading.present();

    if (this.isModoEdicao) {
      // ATUALIZAR perfil existente (sem parseInt - UUID é string)
      console.log('🔄 [AuthPage] Atualizando perfil existente');
      this.authService.updateProfile(this.userId, this.registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          loading.dismiss();

          console.log('✅ [AuthPage] Perfil atualizado:', response);
          this.showSuccessAlert('Perfil atualizado com sucesso!');

          // Atualiza os dados locais também (sem criar objeto complexo)
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            // Atualiza apenas os dados necessários
            const userAtualizado = {
              ...currentUser,
              nome_completo: this.registerData.nomeCompleto,
              email: this.registerData.email,
              telefone_whatsapp: this.registerData.telefoneWhatsapp,
              preferencia_recuperacao: this.registerData.preferenciaRecuperacao,
              cabanha_nome: this.registerData.cabanha.nome,
              cabanha_municipio: this.registerData.cabanha.municipio,
              cabanha_estado: this.registerData.cabanha.estado,
              cabanha_localizacao_livre: this.registerData.cabanha.localizacaoLivre
            };
            this.authService.setUser(userAtualizado);
          }

          // Volta para o dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          loading.dismiss();

          const errorMessage = error.error?.erro || 'Erro ao atualizar perfil';
          this.showAlert('Erro', errorMessage);
        }
      });
    } else {
      // CRIAR nova conta
      console.log('🆕 [AuthPage] Criando nova conta');
      // No método register(), antes de chamar this.authService.register()
      console.log('📦 Dados enviados para registro:', {
        ...this.registerData,
        senha: '[PROTEGIDO]'
      });
      this.authService.register(this.registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          loading.dismiss();

          console.log('✅ [AuthPage] Conta criada:', response);
          this.showSuccessAlert('Conta criada com sucesso! Faça login para continuar.');

          // Volta para o login após cadastro
          this.isLogin = true;
          this.clearFormFields();
        },
        error: (error) => {
          this.isLoading = false;
          loading.dismiss();

          const errorMessage = error.error?.erro || 'Erro ao criar conta';
          this.showAlert('Erro', errorMessage);
        }
      });
    }
  }

  // Esqueci a senha
  async forgotPassword() {
    console.log('🔍 [AuthPage] Esqueci a senha clicado');
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: 'Digite seu email para recuperar a senha:',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'seu@email.com'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              this.showAlert('Sucesso', 'Email de recuperação enviado!');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Abrir termos de uso
  async abrirTermos(event: Event) {
    event.preventDefault();
    this.showAlert('Termos de Uso', 'Aqui serão exibidos os termos de uso da aplicação.');
  }

  // Abrir política de privacidade
  async abrirPolitica(event: Event) {
    event.preventDefault();
    this.showAlert('Política de Privacidade', 'Aqui será exibida a política de privacidade da aplicação.');
  }

  // Formatar telefone (opcional)
  formatarTelefone(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    if (value.length > 10) {
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    this.registerData.telefoneWhatsapp = value;
  }

  // Alertas genéricos
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }


  async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Sucesso!',
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Login rápido para teste (opcional)
  quickLogin(email: string = 'teste@email.com', password: string = '123456') {
    this.loginEmail = email;
    this.loginPassword = password;
    this.login();
  }

  // Método para cancelar edição
  cancelarEdicao() {
    this.router.navigate(['/dashboard']);
  }


  // Método de teste rápido:
  async testarConexoes() {
    console.log('=== 🧪 TESTE DE CONEXÕES ===');

    // Testa API externa
    this.http.get('https://jsonplaceholder.typicode.com/todos/1').subscribe({
      next: (data) => {
        console.log('✅ CONEXÃO EXTERNA FUNCIONA!', data);
        this.showAlert('Teste', '✅ Conexão externa: OK');
      },
      error: (err) => {
        console.error('❌ CONEXÃO EXTERNA FALHOU:', err);
        this.showAlert('Teste', '❌ Conexão externa: FALHOU - ' + err.message);
      }
    });

    // Testa backend LOCAL
    this.http.get('http://192.168.1.195:3000/ovinos').subscribe({
      next: (data) => {
        console.log('✅ BACKEND LOCAL FUNCIONA!', data);
        this.showAlert('Teste', '✅ Backend local: OK');
      },
      error: (err) => {
        console.error('❌ BACKEND LOCAL FALHOU:', err);
        this.showAlert('Teste', '❌ Backend local: FALHOU - ' + err.message);
      }
    });
  }

}
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, CommonModule]
})
export class AuthPage {
  // Controle de modo (login/cadastro)
  isLogin: boolean = true;
  
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
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  // Alternar entre login e cadastro
  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.clearFormFields();
  }

  // Limpar campos do formulário
  private clearFormFields() {
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

  // Validar formulário de cadastro
  formularioValido(): boolean {
    if (!this.registerData.nomeCompleto || 
        !this.registerData.email || 
        !this.registerData.telefoneWhatsapp || 
        !this.registerData.senha || 
        !this.registerData.cabanha.nome || 
        !this.registerData.cabanha.municipio || 
        !this.registerData.cabanha.estado) {
      return false;
    }

    if (this.registerData.senha !== this.registerConfirmPassword) {
      return false;
    }

    if (this.registerData.senha.length < 6) {
      return false;
    }

    if (!this.aceitouTermos) {
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      return false;
    }

    return true;
  }

  // Processar login
  async login() {
    // Validação
    if (!this.loginEmail || !this.loginPassword) {
      this.showAlert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Entrando...',
      duration: 1500
    });
    
    await loading.present();

    // Simulação de autenticação
    setTimeout(() => {
      this.isLoading = false;
      loading.dismiss();
      
      // Login sempre bem-sucedido para teste
      this.showSuccessAlert('Login realizado com sucesso!');
      this.router.navigate(['/tabs']);
    }, 1500);
  }

  // Processar cadastro
  async register() {
    if (!this.formularioValido()) {
      this.showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios e aceite os termos');
      return;
    }

    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Criando conta...',
      duration: 2000
    });
    
    await loading.present();

    // Simulação de cadastro
    setTimeout(() => {
      this.isLoading = false;
      loading.dismiss();
      
      // Adiciona data de cadastro
      const dadosCompletos = {
        ...this.registerData,
        dataCadastro: new Date().toISOString()
      };

      console.log('Dados do cadastro:', dadosCompletos);
      
      this.showSuccessAlert('Conta criada com sucesso!');
      
      // Volta para o login após cadastro
      this.isLogin = true;
      this.clearFormFields();
    }, 2000);
  }

  // Esqueci a senha
  async forgotPassword() {
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
}
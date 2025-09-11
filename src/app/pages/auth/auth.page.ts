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

  // Dados para cadastro
  registerEmail: string = '';
  registerPassword: string = '';
  registerConfirmPassword: string = '';
  registerName: string = '';
  
  // Estados de loading
  isLoading: boolean = false;

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
      this.registerEmail = '';
      this.registerPassword = '';
      this.registerConfirmPassword = '';
      this.registerName = '';
    } else {
      this.loginEmail = '';
      this.loginPassword = '';
    }
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
    // Validações
    if (!this.registerEmail || !this.registerPassword || !this.registerConfirmPassword || !this.registerName) {
      this.showAlert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showAlert('Erro', 'As senhas não coincidem');
      return;
    }

    if (this.registerPassword.length < 6) {
      this.showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres');
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
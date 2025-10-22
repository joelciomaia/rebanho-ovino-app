import { Component, ViewEncapsulation } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ajuda-modal',
  templateUrl: './ajuda.modal.html',
  styleUrls: ['./ajuda.modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None, // 🔹 Permite que o CSS global tenha prioridade
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AjudaModal {
  abaSelecionada: string = 'sobre'; // Aba inicial
  nome: string = '';
  email: string = '';
  mensagem: string = '';

  constructor(private modalCtrl: ModalController) {}

  fecharModal() {
    this.modalCtrl.dismiss();
  }

  enviarEmail() {
    if (!this.nome || !this.email || !this.mensagem) {
      alert('Por favor, preencha todos os campos antes de enviar.');
      return;
    }

    const assunto = encodeURIComponent(`Feedback do OvinoGest - ${this.nome}`);
    const corpo = encodeURIComponent(
      `Nome: ${this.nome}\nE-mail: ${this.email}\n\nMensagem:\n${this.mensagem}`
    );

    const destinatario = 'suporte@ovinogest.com';

    window.location.href = `mailto:${destinatario}?subject=${assunto}&body=${corpo}`;
    this.fecharModal();
  }
}

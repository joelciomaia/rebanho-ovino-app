import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSegment, IonSegmentButton, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon, IonLabel } from "@ionic/angular/standalone";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalhe-animal',
  templateUrl: './detalhe-animal.page.html',
  styleUrls: ['./detalhe-animal.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
           IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, CommonModule]
})
export class DetalheAnimalPage implements OnInit {
  animal: any = {};
  animalFotos: any[] = [];
  manejos: any[] = [];
  manejosFiltrados: any[] = [];
  abaAtiva: string = 'vacinas';
  isCardExpanded: boolean = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.carregarDadosMockados();
  }

  toggleCard() {
    this.isCardExpanded = !this.isCardExpanded;
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
    // Pequeno delay para garantir que o DOM esteja atualizado
    setTimeout(() => {
      const segmentContainer = document.querySelector('.segment-container');
      const selectedTab = document.querySelector(`ion-segment-button[value="${tabValue}"]`);
      
      if (segmentContainer && selectedTab) {
        const container = segmentContainer as HTMLElement;
        const tab = selectedTab as HTMLElement;
        
        // Calcula a posição para centralizar a tab
        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        
        // Scroll suave para a posição calculada
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  carregarDadosMockados() {
    // Dados do animal
    this.animal = {
      brinco: '0145',
      sexo: 'Fêmea',
      dataNascimento: '2021-02-15',
      raca: 'Dorper',
      categoria: 'Matriz',
      pesoAtual: 47,
      situacao: 'ativo'
    };

    // Fotos do animal mockadas
    this.animalFotos = [
      {
        url: 'https://via.placeholder.com/400x300/4CAF50/white?text=Animal+0145',
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

    // Dados de manejos mockados
    this.manejos = [
      {
        data: '2024-05-12',
        tipo: 'sanitario',
        sanitario: {
          vacinas: [{ produto: 'Policlost', dose: '2.5 ml', via: 'Subcutânea', lote: 'L123', fabricante: 'Labovet' }]
        },
        observacao: 'Animal reagiu normalmente'
      },
      {
        data: '2024-04-28', 
        tipo: 'sanitario',
        sanitario: {
          medicacoes: [{ produto: 'Ivomec Gold', tipo: 'vermífugo', dose: '2.5 ml', via: 'Subcutânea' }]
        },
        observacao: 'Leve desconforto ao aplicar'
      },
      {
        data: '2024-03-15',
        tipo: 'reprodutivo',
        reprodutivo: {
          acao: 'parto',
          tipoParto: 'natural',
          habilidadeMaterna: 4,
          quantidadeFilhotes: 2,
          observacao: 'Parto sem complicações'
        }
      },
      {
        data: '2024-02-10',
        tipo: 'tecnico',
        tecnico: {
          peso: 45,
          temperatura: 38.5,
          escoreCorporal: 3
        },
        observacao: 'Controle mensal de peso'
      },
      {
        data: '2024-01-20',
        tipo: 'sanitario',
        sanitario: {
          vacinas: [{ produto: 'Raiva', dose: '1.0 ml', via: 'Intramuscular', lote: 'R456', fabricante: 'VetLab' }]
        },
        observacao: 'Vacinação anual contra raiva'
      },
      {
        data: '2023-12-05',
        tipo: 'reprodutivo',
        reprodutivo: {
          acao: 'monta',
          touro: 'Brinco 0789',
          observacao: 'Cobertura natural'
        }
      }
    ];

    this.filtrarManejos('vacinas');
  }

  onSegmentChange(event: any) {
    const value = event.detail.value;
    if (value) {
      this.filtrarManejos(value);
      this.scrollToSelectedTab(value); // CHAMA O SCROLL AUTOMÁTICO
    } else {
      this.filtrarManejos('vacinas');
      this.scrollToSelectedTab('vacinas'); // CHAMA O SCROLL AUTOMÁTICO
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
          return true; // Para a aba de fotos
        default:
          return false;
      }
    });

    this.scrollToSelectedTab(tipo); // CHAMA O SCROLL AUTOMÁTICO
  }

  calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return 'Idade não informada';
    
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const anos = hoje.getFullYear() - nascimento.getFullYear();
    const meses = hoje.getMonth() - nascimento.getMonth();
    
    let mesesAjustados = meses;
    if (mesesAjustados < 0) {
      mesesAjustados += 12;
    }
    
    return `${anos} anos, ${mesesAjustados} meses`;
  }

  formatarSituacao(situacao: string): string {
    const situacoes: {[key: string]: string} = {
      'ativo': 'Ativo',
      'vendido': 'Vendido',
      'descartado': 'Descartado',
      'morto': 'Morto'
    };
    
    return situacoes[situacao] || situacao;
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  obterCorSituacao(situacao: string): string {
    const cores: {[key: string]: string} = {
      'ativo': 'success',
      'vendido': 'warning',
      'descartado': 'medium',
      'morto': 'danger'
    };
    
    return cores[situacao] || 'medium';
  }
}
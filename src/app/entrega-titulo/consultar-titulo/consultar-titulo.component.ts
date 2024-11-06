import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-consultar-titulo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
    ReactiveFormsModule,NgxPaginationModule, NgxSpinnerModule,
    NgxImageZoomModule
  ],
  templateUrl: './consultar-titulo.component.html',
  styleUrl: './consultar-titulo.component.css'
})
export class ConsultarTituloComponent {



  currentForm:  'baixaEntrega' | null = null;
  p: number = 1;
  mensagem: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  titulos: any[] = [];
  titulo: any = {};
  tit: any;
  datas: any[] = []
  imagemAmpliadaUrl: string | null = null;
  zoomLevel: string = 'scale(1)';
  matricula: string = '';
  senha: string = '';
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  baixaTitulo: any;
  idBaixaTitulo: number | null = null;
  originalTitulos: any[] = [];
  expression: string = '';


  formi = new FormGroup({
    numeroNota: new FormControl('', [Validators.required]),
    nomeCliente: new FormControl(''),
    valor: new FormControl(''),
    usuarioId: new FormControl(''),
    observacao: new FormControl(''),
    dataVenda: new FormControl(''),
    vendedor: new FormControl(''),
    loja: new FormControl(''),
    telefone: new FormControl(''),
   


  });


  form: FormGroup = this.formBiulder.group({
    id: [''],
    numeroNota: ['', Validators.required],
    nomeCliente: [''],
    valor: [''],
    usuarioId: [''],
    observacao: [''],
    dataVenda: [''],
    vendedor: [''],
    loja: [''],
    telefone: [''],
   

  });


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }


  filtrarTitulo(): void {
    console.log(`Filtrando títulos com a expressão: "${this.expression}"`);

    // Se a expressão de pesquisa estiver vazia, restaura as entregas do array original
    if (this.expression.trim() === '') {
        this.titulos = [...this.originalTitulos]; // Restaura todas as entregas
       
        console.log('Nenhuma expressão fornecida, todos os títulos foram restaurados.');
        return;
    }

    // Limpa as entregas antes de aplicar o filtro
    this.datas.forEach(data => {
        data.entregas = []; // Inicializa como vazio
    });

    // Remove os dias que não têm entregas
    this.datas = this.datas.filter(data => data.entregas.length > 0);
}


convertToBrazilTime(date: Date): Date {
  const pstDate = new Date(date);
  const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);
  const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);
  return brazilTime;
}



loadUserName(tituloo: any): void {
  this.httpClient.get<any>(`${this.userApiUrl}?matricula=${tituloo.usuarioId}`)
    .subscribe({
      next: (userData) => {
        tituloo.nome = userData.nome;
      },
      error: (error) => {
        console.error('Erro ao carregar o nome do usuário:', error);
      }
    });
}
ngOnInit(): void {
  const currentDate = new Date();
  this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Definir a data atual
  const today = new Date().toISOString().split('T')[0];

  const ocorrencId = this.route.snapshot.queryParams['id'];
  if (ocorrencId) {
    // Requisição para obter dados das entregas
    this.httpClient.get<any[]>(`${environment.entregatitulo}tituloreceber/${ocorrencId}`)
      .subscribe({
        next: (titulosData) => {
          this.titulos = titulosData.map(titulo => {
            titulo.dataTime = this.convertToBrazilTime(new Date(titulo.dataTime));
            this.loadUserName(titulo);
            this.originalTitulos = [...this.titulos];

            return titulo;
          });
         
          // Ordena por dataEntrega em ordem crescente
          this.titulos.sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
          
        },
        error: (error) => {
          console.error('Erro ao carregar as títulos:', error);
        }
      });
  } else {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/tituloreceber`)
      .subscribe({
        next: (titulosData) => {
          this.titulos = titulosData.map(titulo => {
            titulo.dataTime = this.convertToBrazilTime(new Date(titulo.dataTime));
            this.loadUserName(titulo);
            return titulo;
          });
         
          // Ordena por dataEntrega em ordem crescente
          this.titulos.sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
        
          this.originalTitulos = [...this.titulos];
         
        },
        error: (error) => {
          console.error('Erro ao carregar  os títulos', error);
        }
      });
  }
}

formatarValor(valor: string): string {
  // Remove espaços
  valor = valor.trim();

  // Detecta se o separador decimal é vírgula ou ponto
  const separadorDecimal = valor.includes(',') ? ',' : '.';
  const separadorMilhar = separadorDecimal === ',' ? '.' : ',';

  // Normaliza o valor, removendo o separador de milhar
  const valorSemMilhar = valor.replace(new RegExp(`\\${separadorMilhar}`, 'g'), '');

  // Substitui o separador decimal por ponto
  const valorComPonto = valorSemMilhar.replace(separadorDecimal, '.');

  // Converte para número e formata com separador decimal e milhar
  const valorNumerico = parseFloat(valorComPonto);

  if (isNaN(valorNumerico)) {
    return '0,00';
  }

  // Formata com separador de milhar e vírgula como separador decimal
  const partes = valorNumerico.toFixed(2).split('.');
  const inteiro = partes[0];
  const decimal = partes[1];

  const inteiroComMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${inteiroComMilhar},${decimal}`;
}

concluirTitulo(baixaTituloo: any): void {
  this.tit = baixaTituloo;
  const params = { matricula: this.matricula, senha: this.senha, id: this.tit.id };


  
  console.log('Dados enviados:', params);

  this.httpClient.post<any>(`${environment.entregatitulo}/tituloreceber/baixatitulo`,  { params })
    .subscribe({
      next: (response: any) => {
        console.log('Resposta do backend:', response);
        this.mensagem = response.message;
        // Captura o idBaixaEntrega gerado na resposta
        this.idBaixaTitulo = response.idBaixaTitulo;
        console.log('ID da baixa de título gerado:', this.idBaixaTitulo);

        this.spinner.hide();
        this.fecharFormularios();

      

      },
      error: (error) => {
        alert('Erro ao concluir ocorrência. Usuário e senha incorretos, tente novamente.');
        console.error('Erro ao concluir a título:', error);
        this.spinner.hide();
      }
    });
}


editartitulo(id: string): void {
  this.router.navigate(['/editar-titulo', id]);
}


controlarZoom(event: WheelEvent) {
  event.preventDefault();
  const incremento = event.deltaY < 0 ? 0.1 : -0.1;
  this.zoomLevel = this.calcularNovoZoom(incremento);
}

calcularNovoZoom(incremento: number): string {
  const match = this.zoomLevel.match(/scale\(([^)]+)\)/);
  if (match) {
    const currentScale = parseFloat(match[1]);
    const newScale = Math.max(0.1, currentScale + incremento);
    return `scale(${newScale})`;
  }
  return this.zoomLevel;
}

getFullImageUrl(imagemUrl: string): string {
  return `${environment.entregatitulo}/tituloreceber${imagemUrl}`;
}

expandirImagem(imagemUrl: string, dia: any = null): void {
  const target = dia || this; // Verifica se é dia de entrega ou pendente
  target.imagemAmpliadaUrl = this.getFullImageUrl(imagemUrl);
  const imagemAmpliada = document.querySelector('.imagem-ampliada');
  if (imagemAmpliada) {
    imagemAmpliada.classList.add('mostrar');
  }
}


abrirFormularioBaixaTitulo(baixatituloo: any): void {
  this.currentForm = 'baixaEntrega';
  this.baixaTitulo = baixatituloo;

}


// Fecha todos os formulários
fecharFormularios(): void {
  
  this.matricula = '';
  this.senha = '';
  
  this.baixaTitulo = null;
  
}
}

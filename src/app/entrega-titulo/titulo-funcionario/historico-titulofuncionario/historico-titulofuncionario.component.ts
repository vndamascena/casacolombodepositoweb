import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-historico-titulofuncionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './historico-titulofuncionario.component.html',
  styleUrl: './historico-titulofuncionario.component.css'
})
export class HistoricoTitulofuncionarioComponent implements OnInit {


  p: number = 1;
  startDate: Date = new Date();
  endDate: Date = new Date();
  expression: string = '';
  baixaTitulos: any[] = [];
  baixaTitulo: any = {};
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  mensagem: string = '';
  imagemAmpliadaUrl: string | null = null;
  zoomLevel: string = 'scale(1)';
  originalTitulos: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }


  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }

  convertToBrazilTime(date: Date): Date {
    // Cria um novo objeto Date baseado na data original
    const pstDate = new Date(date);

    // Calcula a diferença entre PST (UTC-8) e BRT (UTC-3)
    const timeZoneOffset = pstDate.getTimezoneOffset() + (-1 * 60);

    // Ajusta a data para o fuso horário do Brasil
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);

    return brazilTime;
  }

  ngOnInit(): void {


    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const tituloId = this.route.snapshot.queryParams['id'];


    if (tituloId) {
      this.httpClient.get<any[]>(environment.entregatitulo + '/tituloreceber/baixatitulo/${tituloId}')

        .subscribe({
          next: (baixaTituloData) => {

            this.baixaTitulos = baixaTituloData.map(baixaTitulo => {
              baixaTitulo.dataTime = this.convertToBrazilTime(new Date(baixaTitulo.dataTime));
              return baixaTitulo;

            });
            this.baixaTitulos.sort((a, b) => b.dataTime - a.dataTime);
            this.baixaTitulos.forEach(baixaTitulo => this.loadUserName(baixaTitulo));

            this.originalTitulos = [...this.baixaTitulos];




          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
    } else {
      // Se não houver ID da ocorrencia na URL, exibe todos os produtos
      this.httpClient.get<any[]>(environment.entregatitulo + '/tituloreceber/baixatitulo')
        .subscribe({
          next: (baixaTituloData) => {
            this.baixaTitulos = baixaTituloData.map(baixaTitulo => {


              baixaTitulo.dataTime = this.convertToBrazilTime(new Date(baixaTitulo.dataTime));

              return baixaTitulo;

            });
            this.baixaTitulos.sort((a, b) => b.dataTime - a.dataTime);
            this.baixaTitulos.forEach(baixaTitulo => this.loadUserName(baixaTitulo));
            this.originalTitulos = [...this.baixaTitulos];


          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });


    }




  }


  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);



      this.httpClient.get<any[]>(environment.entregatitulo + '/tituloreceber/baixatitulo').subscribe({
        next: (baixaTitulosData) => {
          this.baixaTitulos = baixaTitulosData.map(baixaTitulo => {
            baixaTitulo.dataTime = this.convertToBrazilTime(new Date(baixaTitulo.dataTime));
            return baixaTitulo;
          }).filter(baixaTitulo => {
            const entregaDate = new Date(baixaTitulo.dataTime);

            return entregaDate >= start && entregaDate < end;
          });

          this.baixaTitulos.sort((a, b) => b.dataTime - a.dataTime);
          this.baixaTitulos.forEach(baixaTitulo => this.loadUserName(baixaTitulo));


        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });

    }
  }

  filtrarTitulosBaixados(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos da lista original
      this.baixaTitulos = [...this.originalTitulos];
    } else {
      // Filtra os produtos com base na expressão de pesquisa na lista original
      this.baixaTitulos = this.originalTitulos.filter(p =>
        Object.values(p).some(value => {
          // Verifica se o valor é string ou número
          if (typeof value === 'string') {
            return value.toLowerCase().includes(this.expression.toLowerCase());
          } else if (typeof value === 'number') {
            // Converte o número para string e verifica se contém a expressão de pesquisa
            return value.toString().includes(this.expression);
          }
          return false;
        })
      );
    }
  }

  loadUserName(entregatituloo: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${entregatituloo.usuarioId}`)
      .subscribe({
        next: (userData) => {
          entregatituloo.nome = userData.nome; // Atribuir o nome do usuário
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
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

  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl); // Adicione esta linha
    this.imagemAmpliadaUrl = `${environment.entregatitulo}/tituloreceber${imagemUrl}`;
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }


  fecharImagemAmpliada(): void {
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
    }
  }


  exibirMenuImpressao(event: MouseEvent): void {
    event.preventDefault(); // Evita o menu de contexto padrão
    const imagem = event.target as HTMLImageElement;
    if (imagem) {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            const imgHTML = `<img src="${imagem.src}" style="width:100%;" onload="window.print();">`;
            printWindow.document.write(imgHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.onafterprint = () => {
                printWindow.close(); // Fecha a janela após a impressão
            };
        }
    }
}


}

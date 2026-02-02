import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =  '/assets/pdfjs/pdf.worker.min.js';

@Component({
    selector: 'app-historico-entrega',
    imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
    templateUrl: './historico-entrega.component.html',
    styleUrl: './historico-entrega.component.css'
})
export class HistoricoEntregaComponent implements OnInit {


  p: number = 1;
  startDate: Date = new Date();
  endDate: Date = new Date();
  expression: string = '';
  baixaEntregas: any[] = [];
  baixaEntrega: any = {};
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  mensagem: string = '';
  imagemAmpliadaUrl: string | null = null;
  zoomLevel: string = 'scale(1)';
  originalEntregas: any[] = [];


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
    limparPesquisa() {
  this.expression = '';
  this.filtrarEntregas(); // Chama filtro com campo limpo
}
  ngOnInit(): void {


    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const ocorrencId = this.route.snapshot.queryParams['id'];


    if (ocorrencId) {
      this.httpClient.get<any[]>(environment.entregatitulo + '/entrega/baixaentrega/${ocorrencId}')

        .subscribe({
          next: (ocorrenciasData) => {

            this.baixaEntregas = ocorrenciasData.map(bxEntrega => {
              bxEntrega.dataTime = this.convertToBrazilTime(new Date(bxEntrega.dataTime));
              return bxEntrega;

            });
            this.baixaEntregas.sort((a, b) => b.dataTime - a.dataTime);
            this.baixaEntregas.forEach(bxEntrega => this.loadUserName(bxEntrega));

            this.originalEntregas = [...this.baixaEntregas];




          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
    } else {
      // Se não houver ID da ocorrencia na URL, exibe todos os produtos
      this.httpClient.get<any[]>(environment.entregatitulo + '/entrega/baixaentrega')
        .subscribe({
          next: (bxEntregaData) => {
            this.baixaEntregas = bxEntregaData.map(bxEntrega => {


              bxEntrega.dataTime = this.convertToBrazilTime(new Date(bxEntrega.dataTime));

              return bxEntrega;

            });
            this.baixaEntregas.sort((a, b) => b.dataTime - a.dataTime);
            this.baixaEntregas.forEach(bxEntrega => this.loadUserName(bxEntrega));
            this.originalEntregas = [...this.baixaEntregas];


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



      this.httpClient.get<any[]>(environment.entregatitulo + '/entrega/baixaentrega').subscribe({
        next: (baixaEntregasData) => {
          this.baixaEntregas = baixaEntregasData.map(baixaEntrega => {
            baixaEntrega.dataTime = this.convertToBrazilTime(new Date(baixaEntrega.dataTime));
            return baixaEntrega;
          }).filter(baixaEntrega => {
            const entregaDate = new Date(baixaEntrega.dataTime);

            return entregaDate >= start && entregaDate < end;
          });

          this.baixaEntregas.sort((a, b) => b.dataTime - a.dataTime);
          this.baixaEntregas.forEach(baixaEntrega => this.loadUserName(baixaEntrega));


        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });

    }
  }

  
  filtrarEntregas(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos da lista original
      this.baixaEntregas = [...this.originalEntregas];
    } else {
      // Filtra os produtos com base na expressão de pesquisa na lista original
      this.baixaEntregas = this.originalEntregas.filter(p =>
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


  loadUserName(ocorrenciaa: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${ocorrenciaa.usuarioId}`)
      .subscribe({
        next: (userData) => {
          ocorrenciaa.nome = userData.nome; // Atribuir o nome do usuário
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
    return `${environment.entregatitulo}/entrega${imagemUrl}`;
  }

  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl); // Adicione esta linha
    this.imagemAmpliadaUrl = `${environment.entregatitulo}/entrega${imagemUrl}`;
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }
 expandirArquivo(url: string): void {
    if (!url) {
      alert('Arquivo não disponível');
      return;
    }

    const fullUrl = this.getFullImageUrl(url);

    // 🟢 PDF → encode + nova aba
    if (url.toLowerCase().endsWith('.pdf')) {
      window.open(encodeURI(fullUrl), '_blank');
      return;
    }

    // 🟢 IMAGEM → comportamento antigo
    this.expandirImagem(url);
  }
  isPdf(url: string): boolean {
    return !!url && url.toLowerCase().endsWith('.pdf');
  }

  fecharImagemAmpliada(): void {
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
    }
  }


  exportarParaExcel() {
    // Crie uma matriz com todos os dados da tabela, ignorando a paginação
    const dadosTabela = this.baixaEntregas.map(entrega => ({
      Nota: entrega.numeroNota,
      Usuário: entrega.nome,
      'N° Nota': entrega.numeroNota,
      Cliente: entrega.nomeCliente,
      Valor: entrega.valor,
      Vendedor: entrega.vendedor,
      Observação: entrega.observacao,
      Motorista: entrega.motorista,
      DataEntregaBaixa: entrega.dataEntregaBaixa,
      DataVenda: entrega.dataVenda,
      Loja: entrega.loja,
      Periodo: entrega.periodo,
      DiaSemana: entrega.diaSemanaBaixa,

    }));
  
    // Crie uma nova planilha
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dadosTabela);
  
    // Crie um novo arquivo de trabalho
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
  
    // Adicione a planilha ao arquivo de trabalho
    XLSX.utils.book_append_sheet(wb, ws, 'Entregas');
  
    // Gera o arquivo Excel
    XLSX.writeFile(wb, 'Entregas.xlsx');
  }

  
}

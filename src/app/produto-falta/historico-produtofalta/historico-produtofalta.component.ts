import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-historico-produtofalta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './historico-produtofalta.component.html',
  styleUrl: './historico-produtofalta.component.css'
})
export class HistoricoProdutofaltaComponent implements OnInit {

  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  mensagem: string = '';
  p: number = 1;
  startDate: Date = new Date();
  endDate: Date = new Date();
  baixaProdutoFalta: any[] =[];
  baixaProdutoFaltas: any[] =[];
expression: string = '';
 originalBaixaProdutoFalta: any[] =[];

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

  }

  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);



      this.httpClient.get<any[]>(environment.entregatitulo + '/entrega/baixaentrega').subscribe({
        next: (baixaProdutoFaltasData) => {
          this.baixaProdutoFaltas = baixaProdutoFaltasData.map(baixaProdutoFalta => {
            baixaProdutoFalta.dataTime = this.convertToBrazilTime(new Date(baixaProdutoFalta.dataTime));
            return baixaProdutoFalta;
          }).filter(baixaProdutoFalta => {
            const entregaDate = new Date(baixaProdutoFalta.dataTime);

            return entregaDate >= start && entregaDate < end;
          });

          this.baixaProdutoFaltas.sort((a, b) => b.dataTime - a.dataTime);
          this.baixaProdutoFaltas.forEach(baixaProdutoFalta => this.loadUserName(baixaProdutoFalta));


        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });

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
  filtrarEntregas(): void {
    if (this.expression.trim() === '') {
      
      this.baixaProdutoFaltas = [...this.originalBaixaProdutoFalta];
    } else {
    
      this.baixaProdutoFaltas = this.originalBaixaProdutoFalta.filter(p =>
        Object.values(p).some(value => {
        
          if (typeof value === 'string') {
            return value.toLowerCase().includes(this.expression.toLowerCase());
          } else if (typeof value === 'number') {
        
            return value.toString().includes(this.expression);
          }
          return false;
        })
      );
    }
  }











    exportarParaExcel() {}

}

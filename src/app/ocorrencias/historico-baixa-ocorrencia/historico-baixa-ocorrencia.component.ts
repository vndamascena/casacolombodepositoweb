import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
    selector: 'app-historico-baixa-ocorrencia',
    imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
    templateUrl: './historico-baixa-ocorrencia.component.html',
    styleUrl: './historico-baixa-ocorrencia.component.css'
})
export class HistoricoBaixaOcorrenciaComponent implements OnInit {

  p: number = 1;
  mensagem: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  matricula: string = '';
  senha: string = '';
  ocorrencias: any[] = [];
  ocorrencia: any = {};
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  ocorrenciaApiUrl: string = 'https://colombo01-001-site1.gtempurl.com/api/TipoOcorrencia';
  fornOcrApiUrl: string = 'https://colombo01-001-site1.gtempurl.com/api/fornecedorocorrencia';
  lojaApiurl: string = 'https://colombo01-001-site1.gtempurl.com/api/loja';
  grupoOcorrencias: any = {};
  expression: string = ''; 



  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {


    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

   
    
    
      // Se não houver ID da ocorrencia na URL, exibe todos os produtos
      this.httpClient.get<any[]>(environment.ocorrencApi + '/ocorrencia/baixaOcorrencia')
        .subscribe({
          next: (ocorrenciasData) => {
            this.ocorrencias = ocorrenciasData.map(ocorrencia => {
              
              
              ocorrencia.dataTime = this.convertToBrazilTime(new Date(ocorrencia.dataTime));
              
              return ocorrencia;
            
            });
            this.ocorrencias.sort((a, b) => b.dataTime - a.dataTime);
            this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));
            this.ocorrencias.forEach(ocorrencia => this.loadTipoOcorrencia(ocorrencia));
            this.ocorrencias.forEach(ocorrencia => this.loadFornecedorOcorrencia(ocorrencia));
            this.ocorrencias.forEach(ocorrencia => this.loadLoja(ocorrencia));
            
           

          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });


    

 


  }

  
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

  loadTipoOcorrencia(ocorrencia: any): void {
    this.httpClient.get<any>(`${this.ocorrenciaApiUrl}/${ocorrencia.tipoOcorrenciaId}`)
      .subscribe({
        next: (tipoOcorrenciaData) => {
          ocorrencia.tipoOcorrenciaNome = tipoOcorrenciaData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o tipo de ocorrência:', error);
        }
      });
  }
  loadFornecedorOcorrencia(ocorrencia: any): void {
    this.httpClient.get<any>(`${this.fornOcrApiUrl}/${ocorrencia.fornecedorGeralId}`)
      .subscribe({
        next: (fornecedorGeralData) => {
          ocorrencia.fornecedorGeralNome = fornecedorGeralData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o tipo de ocorrência:', error);
        }
      });
  }

  loadLoja(ocorrencia: any): void {
    this.httpClient.get<any>(`${this.lojaApiurl}/${ocorrencia.lojaId}`)
      .subscribe({
        next: (lojaData) => {
          ocorrencia.lojaNome = lojaData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o tipo de ocorrência:', error);
        }
      });
  }

  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);

      
      
      this.httpClient.get<any[]>(environment.ocorrencApi + '/ocorrencia/baixaOcorrencia').subscribe({
        next: (ocorrenciasData) => {
          this.ocorrencias = ocorrenciasData.map(ocorrencia => {
            ocorrencia.dataTime = this.convertToBrazilTime(new Date(ocorrencia.dataTime));
            return ocorrencia;
          }).filter(ocorrencia => {
            const ocorrenciaDate = new Date(ocorrencia.dataTime);

            return ocorrenciaDate >= start && ocorrenciaDate < end;
          });
           
          this.ocorrencias.sort((a, b) => b.dataTime - a.dataTime);
          this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));
          this.ocorrencias.forEach(ocorrencia => this.loadTipoOcorrencia(ocorrencia));
         
        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });

    }
  }

  filtrarOcorrencias(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todas as ocorrências
      this.ngOnInit();
    } else {
      // Filtra as ocorrências com base na expressão de pesquisa
      const lowerCaseExpression = this.expression.toLowerCase();
      this.ocorrencias = this.ocorrencias.filter(o =>
        o.tipoOcorrencia.nome.toLowerCase().includes(lowerCaseExpression) ||
        o.fornecedorOcorrencia.nome.toLowerCase().includes(lowerCaseExpression) ||
        o.id.toString().includes(lowerCaseExpression) ||
        Object.values(o).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(lowerCaseExpression)
        )
      );
    }
  }

}

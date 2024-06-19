import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-ocorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './ocorrencia.component.html',
  styleUrl: './ocorrencia.component.css'
})
export class OcorrenciaComponent implements OnInit {

  p: number = 1;
  mensagem: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  matricula: string = '';
  senha: string = '';
  ocorrencias: any[] = [];
  ocorrencia: any = {};
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  grupoVendas: any = {};



  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {


    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const ocorrencId = this.route.snapshot.queryParams['id'];

    if (ocorrencId) {
      this.httpClient.get(environment.ocorrencApi + 'ocorrencia/${ocorrencId}')

        .subscribe({
          next: (ocorrenciaData) => {

            this.ocorrencia = ocorrenciaData;



          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
    } else {
      // Se não houver ID da ocorrencia na URL, exibe todos os produtos
      this.httpClient.get(environment.ocorrencApi + '/ocorrencia')
        .subscribe({
          next: (ocorrenciasData) => {
            this.ocorrencias = ocorrenciasData.map(ocorr => {
              ocorr.dataOcorrencia = this.convertToBrazilTime(new Date(ocorr.dataOcorrencia))
              return ocorr;
            
            });
            this.ocorrencias = ocorrenciasData as any[];
            this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));

          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });


    }




  }

  convertToBrazilTime(date: Date): Date {
    // Cria um novo objeto Date baseado na data original
    const pstDate = new Date(date);

    // Calcula a diferença entre PST (UTC-8) e BRT (UTC-3)
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);

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

  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);


    }
  }


}

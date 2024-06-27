import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-ocorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule],
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
  grupoOcorrencias: any = {};
  expression: string = ''; 
  ocorr: any;
  tipoOcorrencias: any[] = [];
  fornecedorOcorrencias: any [] = [];
  



  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }

  form = new FormGroup({

    tipoOcorrenciaId: new FormControl('',[]),
    fornecedorOcorrenciaId: new FormControl('',[])
    
    
  });
  get f(): any {
    return this.form.controls;

  }

 

  ngOnInit(): void {


    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const ocorrencId = this.route.snapshot.queryParams['id'];

    if (ocorrencId) {
      this.httpClient.get<any[]>(environment.ocorrencApi + 'ocorrencia/${ocorrencId}')

        .subscribe({
          next: (ocorrenciasData) => {

            this.ocorrencias = ocorrenciasData.map(ocorrencia => {
              ocorrencia.dataTime = this.convertToBrazilTime(new Date(ocorrencia.dataTime));
              return ocorrencia;
            
            });
            this.ocorrencias.sort((a, b) => b.dataTime - a.dataTime);
            this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));
            



          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
    } else {
      // Se não houver ID da ocorrencia na URL, exibe todos os produtos
      this.httpClient.get<any[]>(environment.ocorrencApi + '/ocorrencia')
        .subscribe({
          next: (ocorrenciasData) => {
            this.ocorrencias = ocorrenciasData.map(ocorrencia => {
              
              
              ocorrencia.dataTime = this.convertToBrazilTime(new Date(ocorrencia.dataTime));
              
              return ocorrencia;
            
            });
            this.ocorrencias.sort((a, b) => b.dataTime - a.dataTime);
            this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));
           

          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });


    }




  }
  
  

  abrirFormularioCredenciais(ocorr: any): void{ 
    this.ocorr= ocorr ;
    console.log('id:', this.ocorr);
  }
  fecharFormularioCredenciais(): void {
    this.ocorr = null;
    this.matricula = '';
    this.senha = '';
  }

  concluirOcorrencia(ocorr: any): void{
    this.ocorrencias = ocorr;
    const options = { params: { matricula: this.matricula, senha: this.senha, id: this.ocorr} };
    //this.spinner.show();

    console.log('Dados enviados:', options); 

    this.httpClient.post<any>(`${environment.ocorrencApi}/ocorrencia/baixaOcorrencia`, { id: this.ocorr.id},  options)
        .subscribe({
            next: (response) => {
                
               
                this.spinner.hide();
                
                this.mensagem = response.message; // exibir mensagem de sucesso
               
                this.fecharFormularioCredenciais();
                
            },
            error: (error) => {
              alert('Erro ao concluir ocorrencia. Usuário e senha incorreto, tente novamente.');
                this.spinner.hide();
            }
        });
  }

  isDateOlderThanThreeDays(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 1));
    return date < threeDaysAgo;
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

  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);

      
      
      this.httpClient.get<any[]>(environment.ocorrencApi + '/ocorrencia').subscribe({
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
         
        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });

    }
  }


}

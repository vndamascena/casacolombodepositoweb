import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ocorrencia',
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
  ocorrenciaFiltrados: any[] = [];
  expression: string = '';
  ocorr: any;
  selecionados: number[] = [];
  fornecedores: any[] = [];
  lojas: any[] = [];
  tipoOcorrencias: any[] = [];
  ocorrenciasOriginais: any[] = [];


  form: FormGroup = this.formBiulder.group({
    id: [''],
    fornecedorGeralId: [''],
    codProduto: [''],
    produto: [''],
    numeroNota: [''],
    tipoOcorrenciaId: [''],
    observacao: [''],
    quantidade: [''],
    lojaId: [''],

  });




  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }


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
            this.ocorrenciasOriginais = ocorrenciasData.map(ocorrencia => {
              ocorrencia.dataTime = this.convertToBrazilTime(new Date(ocorrencia.dataTime));
              return ocorrencia;
            }).sort((a, b) => b.dataTime - a.dataTime);

            this.ocorrencias = [...this.ocorrenciasOriginais];
            this.ocorrencias.forEach(ocorrencia => this.loadUserName(ocorrencia));
          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
      this.httpClient.get(environment.ocorrencApi + "/fornecedorGeral")
        .subscribe({
          next: (data) => {
            this.fornecedores = data as any[];
          },
          error: (e) => {
            console.log(e.error);
          }
        });

      this.httpClient.get(environment.ocorrencApi + "/loja")
        .subscribe({
          next: (data) => {
            this.lojas = data as any[];
          },
          error: (e) => {
            console.log(e.error);
          }
        });
      this.httpClient.get(environment.ocorrencApi + "/tipoOcorrencia")
        .subscribe({
          next: (data) => {
            this.tipoOcorrencias = data as any[];
          },
          error: (e) => {
            console.log(e.error);
          }
        });


    }




  }

  limparPesquisa(): void {
    this.expression = '';
    this.startDate = undefined as any;
    this.endDate = undefined as any;
    this.ocorrencias = [...this.ocorrenciasOriginais];
  }

  abrirFormularioCredenciais(ocorr: any): void {
    this.ocorr = ocorr;
    console.log('id:', this.ocorr);
  }
  fecharFormularioCredenciais(): void {
    this.ocorr = null;
    this.matricula = '';
    this.senha = '';
  }

  concluirOcorrencia(ocorr: any): void {
    if (!this.matricula || !this.senha) {
      alert('Preencha matrícula e senha.');
      return;
    }

    const options = { params: { matricula: this.matricula, senha: this.senha, Id: ocorr.id } };

    this.spinner.show();

    this.httpClient.post<any>(`${environment.ocorrencApi}/ocorrencia/baixaOcorrencia`, {}, options)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.mensagem = response.message || 'Ocorrência concluída com sucesso!';

          // Remove a ocorrência concluída do array
          this.ocorrencias = this.ocorrencias.filter(o => o.id !== ocorr.id);

          this.fecharFormularioCredenciais();
        },
        error: () => {
          this.spinner.hide();
          alert('Erro ao concluir ocorrência. Usuário e senha incorretos, tente novamente.');
        }
      });
  }

  // Concluir múltiplas ocorrências selecionadas
  concluirSelecionados(): void {
    const selecionados = this.ocorrencias.filter(o => o.selected).map(o => o.id);

    if (selecionados.length === 0) {
      alert('Nenhuma ocorrência selecionada.');
      return;
    }

    if (!this.matricula || !this.senha) {
      alert('Preencha matrícula e senha.');
      return;
    }

    this.spinner.show();

    const requests = selecionados.map(id =>
      this.httpClient.post(
        `${environment.ocorrencApi}/ocorrencia/baixaOcorrencia`,
        {},
        { params: { matricula: this.matricula, senha: this.senha, Id: id } }
      )
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.spinner.hide();
        this.mensagem = 'Ocorrências concluídas com sucesso!';

        // Remove do array as ocorrências concluídas
        this.ocorrencias = this.ocorrencias.filter(o => !selecionados.includes(o.id));

        // Atualiza a tabela ou qualquer lógica adicional
        this.atualizarOcorrencias();

        // Limpa seleção
        this.selecionados = [];
      },
      error: () => {
        this.spinner.hide();
        alert('Erro ao concluir uma ou mais ocorrências.');
      }
    });
  }


  isDateOlderThanThreeDays(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 9));
    return date < threeDaysAgo;
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

aplicarFiltros(): void {
  let filtradas = [...this.ocorrenciasOriginais];

  // Filtro por datas (funciona com startDate, endDate, ou ambos)
  if (this.startDate || this.endDate) {
    const start = this.startDate ? new Date(this.startDate) : new Date(-8640000000000000); // mínimo possível
    const end = this.endDate ? new Date(this.endDate) : new Date(8640000000000000); // máximo possível

    if (this.endDate) {
      end.setDate(end.getDate() + 1); // inclui o dia final
    }

    filtradas = filtradas.filter(o => {
      const ocorrenciaDate = new Date(o.dataTime);
      return ocorrenciaDate >= start && ocorrenciaDate < end;
    });
  }

  // Filtro por texto (independente da data)
  const texto = this.expression.trim().toLowerCase();
  if (texto) {
    filtradas = filtradas.filter(o =>
      JSON.stringify(o).toLowerCase().includes(texto)
    );
  }

  this.ocorrencias = filtradas;
}


  onEdite(id: string): void {
    this.httpClient.get(environment.ocorrencApi + "/ocorrencia/" + id)
      .subscribe({
        next: (data: any) => {
          console.log('Dados da ocorrência:', data);

          this.form.patchValue({
            id: data.id,
            codProduto: data.codProduto,
            produto: data.produto,
            numeroNota: data.numeroNota,
            quantidade: data.quantidade,
            observacao: data.observacao,
            fornecedorGeralId: data.fornecedorGeral?.id,
            lojaId: data.loja?.id,
            tipoOcorrenciaId: data.tipoOcorrencia?.id
          });
        },
        error: (e) => {
          console.log('Erro ao buscar Ocorrência:', e.error);
        }
      });
  }


  onSubmit(): void {
    const formData = { ...this.form.value };


    formData.fornecedorGeralId = Number(formData.fornecedorGeralId);
    formData.lojaId = Number(formData.lojaId);
    formData.tipoOcorrenciaId = Number(formData.tipoOcorrenciaId);

    console.log('Payload enviado:', formData);

    this.httpClient.put(`${environment.ocorrencApi}/ocorrencia`, formData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;


          this.atualizarOcorrencias();


        },
        error: (error) => {
          console.error('Erro ao atualizar:', error);
          alert('Erro ao atualizar. Verifique os campos e tente novamente.');
        }
      });
  }

  private atualizarOcorrencias(): void {
    this.httpClient.get<any[]>(`${environment.ocorrencApi}/ocorrencia`)
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
          console.error('Erro ao atualizar lista de ocorrências:', error);
        }
      });
  }

  updateSelection(produto: any): void {
    if (produto.selected) {
      // Evita duplicados
      if (!this.selecionados.includes(produto.id)) {
        this.selecionados.push(produto.id);
      }
    } else {
      this.selecionados = this.selecionados.filter(id => id !== produto.id);
    }
  }


}

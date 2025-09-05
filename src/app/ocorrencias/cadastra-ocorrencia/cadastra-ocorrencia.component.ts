import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-cadastra-ocorrencia',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule, RouterModule,
    NgxSpinnerModule],
  templateUrl: './cadastra-ocorrencia.component.html',
  styleUrl: './cadastra-ocorrencia.component.css'
})
export class CadastraOcorrenciaComponent implements OnInit {

  matricula: string = '';
  senha: string = '';
  mensagem: string = '';
  tipoOcorrencias: any[] = [];
  ocorr: any = {};
  cadastrarOcorrencia: any;
  fornecedores: any[] = [];
  lojas: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private formBiulder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }


  form = new FormGroup({

    tipoOcorrenciaId: new FormControl('', [Validators.required,]),
    lojaId: new FormControl('', [Validators.required,]),
    produto: new FormControl('', [
      //campo 'nome'
      Validators.required,
      Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s]{4,100}$/)
    ]),
    codProduto: new FormControl('', []),
    observacao: new FormControl('', []),
    fornecedorGeralId: new FormControl('', []),

    numeroNota: new FormControl('', []),
    quantidade:new FormControl('',[])



  });


  ngOnInit(): void {
    // executando o endpoint de consulta de categorias na API
    this.httpClient.get(environment.ocorrencApi + "/tipoOcorrencia")
      .subscribe({
        next: (data) => {
          this.tipoOcorrencias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    // executando o endpoint de consulta de fornecedores na API
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


  }

  get f(): any {
    return this.form.controls;

  }


  abrirFormularioCredenciais(ocorr: any): void {
    this.cadastrarOcorrencia = ocorr;

  }
  fecharFormularioCredenciais(): void {
    this.cadastrarOcorrencia = null;
    this.matricula = '';
    this.senha = '';
  }

  onSubmit(): void {




    if (this.matricula && this.senha) {
      // Configuração dos parâmetros da solicitação PUT
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      this.spinner.show();
      const formData = this.form.value;

      console.log('Form Data:', formData);
      // Se o FormArray 'lotes' não estiver vazio, envia o formulário para o servidor
      this.httpClient.post(environment.ocorrencApi + "/ocorrencia", this.form.value, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message; // exibir mensagem de sucesso
            this.form.reset(); // limpar os campos do formulário
            this.fecharFormularioCredenciais();
            this.spinner.hide();

          },
          error: (e) => {
            console.log(e.error);
            alert('Falha ao cadastrar o produto. Verifique os campos preenchidos');
            this.spinner.hide();
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
      this.spinner.hide();
    }
  }

}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-edicao-produto-geral',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule, RouterModule, NgxSpinnerModule
    ],
    templateUrl: './edicao-produto-geral.component.html',
    styleUrl: './edicao-produto-geral.component.css'
})
export class EdicaoProdutoGeralComponent implements OnInit {

  categorias: any[] = [];
  fornecedorGeral: any[] = [];
  produtoGeral: any = {};
  mensagem: string = '';
  matricula: string = '';
  senha: string = '';
  editarprodutoGeral: any;
  imagemFile: File | null = null;
  produtoGeralId: number | null = null;
  depositos: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) { }

  form: FormGroup = this.formBuilder.group({
    nomeProduto: [''],
    marcaProduto: [''],
    un: [''],
    codigoSistema: [''],
    produtoDeposito: this.formBuilder.array([]),
    categoriaId: [''],
    fornecedorGeralId: [''],
  });

  get f(): any {
    return this.form.controls;
  }

  get produtoDepositos() {
    return this.form.get('produtoDeposito') as FormArray;
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      nomeProduto: ['', Validators.required],
      marcaProduto: [''],
      un: [''],
      codigoSistema: [''],
      produtoDeposito: this.formBuilder.array([]), // Inicializa vazio
      categoriaId: ['', Validators.required],
      fornecedorGeralId: ['', Validators.required],
    });

    // Busca os dados do produto
    this.httpClient.get(`${environment.apiUrl}/produtoGeral/${productId}`)
      .subscribe({
        next: (data: any) => {
          console.log('Dados recebidos do produto:', data);
          this.produtoGeral = data;
          this.form.patchValue(data); // Atualiza os outros campos do formulário
          
          if (data.produtoDeposito && Array.isArray(data.produtoDeposito)) {
            this.setProdutoDeposito(data.produtoDeposito); // Atualiza o FormArray
          }
        },
        error: (error) => {
          console.error('Erro ao recuperar detalhes do produto:', error);
        }
      });

    // Busca a lista de depósitos
    this.httpClient.get(environment.apiUrl + "/depositos")
      .subscribe({
        next: (data: any) => {
          this.depositos = data as any[]; // Armazena os depósitos no array
          console.log('Lista de depósitos:', this.depositos); // Adiciona o console.log aqui
        },
        error: (e) => {
          console.log('Erro ao buscar depósitos:', e.error);
        }
      });
  }

  onSubmit(): void {
    const productId = this.route.snapshot.params['id'];
    const formDataWithId = { ...this.form.value, id: productId };

    if (this.matricula && this.senha) {
      // Adiciona log para verificar os dados que estão sendo enviados
      console.log('Dados que serão enviados para a API:', formDataWithId);
      
      // Configuração dos parâmetros da solicitação PUT
      const options = { params: { matricula: this.matricula, senha: this.senha } };

      this.httpClient.put(`${environment.apiUrl}/produtoGeral`, formDataWithId, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message;
            //this.form.reset();
            this.router.navigate(['/consultar-produtoGeral']);
            this.fecharFormularioCredenciais();
          },
          error: (error) => {
            console.error('Erro ao atualizar produto:', error);
            alert('Erro ao atualizar o produto. Verifique os campos e tente novamente.');
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
    }
  }

  setProdutoDeposito(produtoDepositos: any[]): void {
    const produtoDepositoArray = this.form.get('produtoDeposito') as FormArray;
    produtoDepositoArray.clear(); // Limpa o array para evitar duplicação

    produtoDepositos.forEach(produtoDeposito => {
        produtoDepositoArray.push(this.formBuilder.group({
            depositoId: [produtoDeposito.depositoId],  // ID do depósito, necessário para a submissão
            quantidade: [produtoDeposito.quantidade],
           // Quantidade do produto nesse depósito
        }));
    });

    console.log('FormArray ProdutoDeposito após carregar dados:', produtoDepositoArray.value);
}

  adicionarProdutoDeposito(): void {
    const novoDeposito = this.formBuilder.group({
      depositoId: [],
      quantidade: [],
    });
    this.produtoDepositos.push(novoDeposito);
  }

  excluirProdutoDeposito(Id: string): void {
    this.produtoDepositos.removeAt(this.produtoDepositos.length - 1);
  }

  abrirFormularioCredenciais(produtoGeral: any): void {
    this.editarprodutoGeral = produtoGeral;
  }

  fecharFormularioCredenciais(): void {
    this.editarprodutoGeral = null;
    this.matricula = '';
    this.senha = '';
  }
}

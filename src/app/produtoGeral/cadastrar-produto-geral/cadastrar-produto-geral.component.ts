import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastrar-produto-geral',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, RouterModule, NgxSpinnerModule
  ],
  templateUrl: './cadastrar-produto-geral.component.html',
  styleUrl: './cadastrar-produto-geral.component.css'
})
export class CadastrarProdutoGeralComponent implements OnInit {

  categorias: any[] = [];
  fornecedorGeral: any[] = [];
  produtoGeral: any = {}; 
  mensagem: string = '';
  matricula: string = ''; 
  senha: string = '';
  cadastrarprodutoGeral: any;
  imagemFile: File | null = null; 
  produtoGeralId: number | null = null; 
  depositos: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  form = new FormGroup({
    nomeProduto: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s@#/\$&!\.\(\,\)\-]{4,100}$/)
    ]),
    marcaProduto: new FormControl('', []),
    un: new FormControl(''),
    codigoSistema: new FormControl(''),
    categoriaId: new FormControl('', [
      Validators.required
    ]),
    fornecedorGeralId: new FormControl('', [
      Validators.required
    ]),
    depositos: new FormArray([
      new FormGroup({
        
        depositoId: new FormControl(),
        quantidade: new FormControl(),
      })
    ]),
    imagemUrlGeral: new FormControl(''),
  });

  get f(): any {
    return this.form.controls;
  }

  get produtoDepositos() {
    return this.form.get('depositos') as FormArray;
  }

  ngOnInit(): void {
    // Log de inicialização de chamada à API de categorias
    console.log('Buscando categorias...');
    this.httpClient.get(environment.apiUrl + "/categoria")
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
          console.log('Categorias recebidas:', this.categorias);
        },
        error: (e) => {
          console.log('Erro ao buscar categorias:', e.error);
        }
      });

    // Log de inicialização de chamada à API de fornecedores
    console.log('Buscando fornecedores...');
    this.httpClient.get(environment.apiUrl + "/fornecedorGeral")
      .subscribe({
        next: (data) => {
          this.fornecedorGeral = data as any[];
          console.log('Fornecedores recebidos:', this.fornecedorGeral);
        },
        error: (e) => {
          console.log('Erro ao buscar fornecedores:', e.error);
        }
      });

    // Log de inicialização de chamada à API de depósitos
    console.log('Buscando depósitos...');
    this.httpClient.get(environment.apiUrl + "/Depositos")
      .subscribe({
        next: (data) => {
          this.depositos = data as any[];
          console.log('Depósitos recebidos:', this.depositos);
        },
        error: (e) => {
          console.log('Erro ao buscar depósitos:', e.error);
        }
      });
  }

  abrirFormularioCredenciais(produtoGeral: any): void {
    this.cadastrarprodutoGeral = produtoGeral;
  }

  fecharFormularioCredenciais(): void {
    this.cadastrarprodutoGeral = null;
    this.matricula = '';
    this.senha = '';
  }

  onSubmit(): void {
    const depositoArray = this.form.get('depositos') as FormArray;
  
    if (depositoArray && depositoArray.length === 0) {
      console.error('A lista de depósitos não pode estar vazia.');
      return;
    }
  
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      this.spinner.show();
  
      // Log dos dados que estão sendo enviados
      console.log('Dados enviados para a API:', this.form.value);
      console.log('Opções de autenticação:', options);
      console.log('FormArray de produtoDeposito:', this.produtoDepositos.value);

      this.httpClient.post(environment.apiUrl + "/produtoGeral", this.form.value, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message; 
            this.produtoGeralId = data.produtoGeralGetModel.id; 
            console.log('Produto cadastrado com sucesso. ID:', this.produtoGeralId);
            this.form.reset(); 
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            this.uploadImagem();
          },
          error: (e) => {
            console.log('Erro ao cadastrar produto:', e.error);
            alert('Falha ao cadastrar o produto. Verifique os campos preenchidos.');
            this.spinner.hide();
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
      this.spinner.hide();
    } 
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagemFile = file;
      console.log('Imagem selecionada:', file.name);
    }
  }

  uploadImagem(): void {
    if (!this.imagemFile) {
      alert('Por favor, selecione uma imagem para o produto cadastrado.');
      return;
    }
  
    if (!this.produtoGeralId) {
      alert('O ID do produto não está disponível. Por favor, cadastre o produto primeiro.');
      return;
    }
  
    console.log('Produto ID para upload de imagem:', this.produtoGeralId);
  
    const formData = new FormData();
    formData.append('imageFile', this.imagemFile as Blob);
  
    this.spinner.show();
  
    // Ajuste na URL para incluir o produtoId como parâmetro na URL
    this.httpClient.post(environment.apiUrl + `/produtoGeral/upload?produtoGeralId=${this.produtoGeralId}`, formData)
      .subscribe({
        next: (data: any) => {
          console.log('Imagem enviada com sucesso:', data);
          this.mensagem = 'Imagem enviada com sucesso!';
          this.spinner.hide();
  
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          this.imagemFile = null;
          this.form.reset(); 
        },
        error: (e) => {
          console.log('Erro ao enviar a imagem:', e.error);
          alert('Erro ao enviar a imagem. Tente novamente.');
          this.spinner.hide();
        }
      });
  }

  adicionarProdutoDeposito(): void {
    const produtoDeposito = new FormGroup({
      
      depositoId: new FormControl(''),
      quantidade: new FormControl('')
    });
    this.produtoDepositos.push(produtoDeposito);
    console.log('Produto depósito atualizado:', this.produtoDepositos.value); 
  }

  excluirProdutoDeposito(Id: string): void {
    this.produtoDepositos.removeAt(this.produtoDepositos.length - 1);
    console.log('Produto depósito removido. Lista atual:', this.produtoDepositos.value);
  }
}

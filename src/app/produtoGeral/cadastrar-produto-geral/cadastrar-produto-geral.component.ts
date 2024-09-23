import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
export class CadastrarProdutoGeralComponent implements OnInit{

  categorias: any[] = [];
  fornecedorGeral: any[] = [];
  produtoGeral: any = {}; 
  mensagem: string = '';
  matricula: string = ''; 
  senha: string = '';
  cadastrarprodutoGeral: any;
  imagemFile: File | null = null; 
  produtoGeralId: number | null = null; 
  depositos: string[] = ['CASTELO', 'JC1', 'JC2', 'VA', 'DEP DA 8', 'DEP DA 5-A', 'DEP DA 5-B'];

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  form = new FormGroup({
    nomeProduto: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s@#/\$&!\.\,\-]{4,100}$/)

    ]),
    marcaProduto: new FormControl('', []),
    un: new FormControl(''),
    codigoSistema: new FormControl(''),
   
   
    quantidadeProdutoDeposito: new FormArray([
      new FormGroup({
        quantidade: new FormControl(''),
        nomeDeposito: new FormControl(''),
       
        
      })
    ]),
    categoriaId: new FormControl('', [
      Validators.required
    ]),
    fornecedorGeralId: new FormControl('', [
      Validators.required
    ]),
    imagemUrlGeral: new FormControl(''),
  });

  get f(): any {
    return this.form.controls;
  }

  get quantidadeProdutoDepositos() {
    return this.form.get('quantidadeProdutoDeposito') as FormArray;
  }
  

  ngOnInit(): void {
    this.httpClient.get(environment.apiUrl + "/categoria")
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    this.httpClient.get(environment.apiUrl + "/fornecedorGeral")
      .subscribe({
        next: (data) => {
          this.fornecedorGeral = data as any[];
        },
        error: (e) => {
          console.log(e.error);
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
    const depositoArray = this.form.get('quantidadeProdutoDeposito') as FormArray;

    if (depositoArray && depositoArray.length === 0) {
      console.error('A lista de depositos não pode estar vazia.');
      return;
    }
    
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      this.spinner.show();

      this.httpClient.post(environment.apiUrl + "/produtoGeral", this.form.value, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message; 
            this.produtoGeralId = data.produtoGeralGetModel.id; 
            this.form.reset(); 
            this.fecharFormularioCredenciais();
            this.spinner.hide();
           
            this.uploadImagem();
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
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagemFile = file;
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

        // Resetar o formulário
        this.form.reset(); 
      },
        error: (e) => {
          console.log('Erro ao enviar a imagem:', e.error);
          alert('Erro ao enviar a imagem. Tente novamente.');
          this.spinner.hide();
        }
      });
  }

  adicionarQuantidadeProdutoDeposito(): void {
    const adicionarQuantidadeProdutoDeposito = new FormGroup({
      nomeDeposito: new FormControl(''),
      quantidade: new FormControl(''),
      
    });
    this.quantidadeProdutoDepositos.push(adicionarQuantidadeProdutoDeposito);
  }

  

  excluirQuantidadeProdutoDeposito(Id: string): void {
    this.quantidadeProdutoDepositos.removeAt(this.quantidadeProdutoDepositos.length - 1);
  }

}

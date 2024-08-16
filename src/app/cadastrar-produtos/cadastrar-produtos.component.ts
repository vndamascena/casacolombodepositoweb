import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-cadastro-produtos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, RouterModule,
    NgxSpinnerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cadastrar-produtos.component.html',
  styleUrls: ['./cadastrar-produtos.component.css']
})
export class CadastrarProdutosComponent implements OnInit {

  depositos: any[] = [];
  categorias: any[] = [];
  fornecedores: any[] = [];
  produto: any = {}; 
  mensagem: string = '';
  matricula: string = ''; 
  senha: string = '';
  cadastrarproduto: any;
  imagemFile: File | null = null; 
  produtoId: number | null = null; 

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  form = new FormGroup({
    nome: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s]{4,100}$/)
    ]),
    marca: new FormControl('', []),
    pei: new FormControl(''),
    descricao: new FormControl('', [
      Validators.required,
      Validators.maxLength(500),
      Validators.minLength(8)
    ]),
    pecascaixa: new FormControl(''),
    metroQCaixa: new FormControl(''),
    precoMetroQ: new FormControl(''),
    precoCaixa: new FormControl(''),
    categoriaId: new FormControl('', [
      Validators.required
    ]),
    fornecedorId: new FormControl('', [
      Validators.required
    ]),
    depositoId: new FormControl('', [
      Validators.required
    ]),
    imagemUrl: new FormControl(''),
    lote: new FormArray([
      new FormGroup({
        codigo: new FormControl(''),
        numeroLote: new FormControl(''),
        quantidadeLote: new FormControl(''),
        ala: new FormControl(''),
      })
    ]),
  });

  get f(): any {
    return this.form.controls;
  }

  get lotes() {
    return this.form.get('lote') as FormArray;
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
    this.httpClient.get(environment.apiUrl + "/fornecedor")
      .subscribe({
        next: (data) => {
          this.fornecedores = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });

    this.httpClient.get(environment.apiUrl + "/deposito")
      .subscribe({
        next: (data) => {
          this.depositos = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }

  abrirFormularioCredenciais(produto: any): void {
    this.cadastrarproduto = produto;
  }

  fecharFormularioCredenciais(): void {
    this.cadastrarproduto = null;
    this.matricula = '';
    this.senha = '';
  }

  onSubmit(): void {
    const lotesArray = this.form.get('lote') as FormArray;

    if (lotesArray && lotesArray.length === 0) {
      console.error('A lista de lotes não pode estar vazia.');
      return;
    }
    
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      this.spinner.show();

      this.httpClient.post(environment.apiUrl + "/produto", this.form.value, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message; 
            this.produtoId = data.produtoGetModel.id; 
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
  
    if (!this.produtoId) {
      alert('O ID do produto não está disponível. Por favor, cadastre o produto primeiro.');
      return;
    }
  
    console.log('Produto ID para upload de imagem:', this.produtoId);
  
    const formData = new FormData();
    formData.append('imageFile', this.imagemFile as Blob);
  
    this.spinner.show();
  
    // Ajuste na URL para incluir o produtoId como parâmetro na URL
    this.httpClient.post(environment.apiUrl + `/produto/upload?produtoId=${this.produtoId}`, formData)
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
  




  adicionarLote(): void {
    const novoLote = new FormGroup({
      codigo: new FormControl(''),
      numeroLote: new FormControl(''),
      quantidadeLote: new FormControl(''),
      ala: new FormControl(''),
    });
    this.lotes.push(novoLote);
  }

  atualizarPrecoCaixa(): void {
    const precoMetroQControl = this.form.get('precoMetroQ');
    const metroQCaixaControl = this.form.get('metroQCaixa');
    const precoCaixaControl = this.form.get('precoCaixa');

    if (precoMetroQControl && metroQCaixaControl && precoCaixaControl) {
      const precoMetroQValue = precoMetroQControl.value;
      const metroQCaixaValue = metroQCaixaControl.value;

      if (typeof precoMetroQValue === 'string' && typeof metroQCaixaValue === 'string') {
        const precoM2 = parseFloat(precoMetroQValue.replace(',', '.')) || 0;
        const m2CX = parseFloat(metroQCaixaValue.replace(',', '.')) || 0;

        if (!isNaN(precoM2) && !isNaN(m2CX)) {
          const precoCX = precoM2 * m2CX;
          precoCaixaControl.setValue(precoCX.toFixed(2).replace('.', ','));
        } else {
          precoCaixaControl.setValue('0,00');
        }
      } else {
        precoCaixaControl.setValue('0,00');
      }
    } else {
      console.error("Um dos controles é nulo.");
    }
  }

  excluirLote(loteId: string): void {
    this.lotes.removeAt(this.lotes.length - 1);
  }
}

import { HttpClient } from '@angular/common/http';
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
  styleUrl: './cadastrar-produtos.component.css'
})
export class CadastrarProdutosComponent implements OnInit {

  // atributos
  depositos: any[] = [];
  categorias: any[] = [];
  fornecedores: any[] = [];
  produto: any = {}; // objeto para armazenar os dados do produto
  mensagem: string = '';
  matricula: string = ''; 
  senha: string = '';
  cadastrarproduto: any;

  // construtor
  constructor(

    private formBiulder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  // criando a estrutura do formulário
  form = new FormGroup({

    nome: new FormControl('', [
      //campo 'nome'
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

  // getter para acessar o FormArray 'lotes'
  get lotes() {
    return this.form.get('lote') as FormArray;
  }

  // função executada no momento em que o componente é carregado
  ngOnInit(): void {
    // executando o endpoint de consulta de categorias na API
    this.httpClient.get(environment.apiUrl + "/categoria")
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    // executando o endpoint de consulta de fornecedores na API
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



  // método para realizar o cadastro
  onSubmit(): void {
    // Obtém o FormArray 'lotes'
    const lotesArray = this.form.get('lote') as FormArray;

    // Verifica se o FormArray 'lotes' tem algum controle
    if (lotesArray && lotesArray.length === 0) {
      // Se estiver vazio, exibe uma mensagem de erro
      console.error('A lista de lotes não pode estar vazia.');
      return;
    }
    
    if (this.matricula && this.senha) {
      // Configuração dos parâmetros da solicitação PUT
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      this.spinner.show();
    // Se o FormArray 'lotes' não estiver vazio, envia o formulário para o servidor
    this.httpClient.post(environment.apiUrl  + "/produto", this.form.value, options)
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
        }
      });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
    } 
  }






  // Função para lidar com a seleção de arquivo no frontend
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // A imagem foi carregada com sucesso
        const base64Image: string = e.target.result;
        // Defina o valor do campo imagemUrl no formulário como a imagem no formato base64
        this.form.get('imagemUrl')?.setValue(base64Image);
      };
      // Carrega o arquivo como base64
      reader.readAsDataURL(file);
    }
  }


  adicionarLote(): void {
    const novoLote = new FormGroup({
      codigo: new FormControl(''),
      numeroLote: new FormControl(''),
      quantidadeLote: new FormControl(''),
      ala: new FormControl(''),
    });
    // Adicione o novo lote ao FormArray 'lotes'
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
        // Substituir vírgulas por pontos
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


    // Remover o último campo de lote localmente
    this.lotes.removeAt(this.lotes.length - 1);

  }


}

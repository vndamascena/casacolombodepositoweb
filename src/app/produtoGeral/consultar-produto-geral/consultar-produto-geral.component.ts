import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-consultar-produto-geral',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './consultar-produto-geral.component.html',
  styleUrl: './consultar-produto-geral.component.css'
})
export class ConsultarProdutoGeralComponent implements OnInit {
  depositoSelecionado: any;
  matricula: string = ''; // Propriedade para armazenar a matrícula do usuário
  senha: string = ''; // Propriedade para armazenar a senha do usuário
  produtoGerals: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  imagemAmpliadaUrlGeral: string | null = null; // URL da imagem ampliada
  produtoGeralFiltrados: any[] = []; // Array para armazenar produtos filtrados
  termoPesquisa: string = ''; // String para armazenar o termo de pesquisa
  mensagem: string = '';
  produtoDeposito: any;
  file: File | null = null; // Para armazenar o arquivo selecionado

  produtoGeral: any = {}; // Objeto para armazenar os detalhes do produto atual
  depositos: any[] = []; // Array para armazenar os deposito do produto atual
  p: number = 1;
  originalProdutoGerals: any[] = [];
  allProdutos: any[] = [];





  // Construtor para inicializar os atributos da classe
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.queryParams['id'];

    if (productId) {
      this.httpClient.get(`${environment.apiUrl}/produtoGeral/${productId}`)
        .subscribe({
          next: (produtoGeralData: any) => {
            this.produtoGeral = produtoGeralData;
            this.depositos = produtoGeralData.produtoDeposito || [];
          },
          error: (error) => console.error('Erro ao carregar o produto:', error)
        });
    } else {
      this.httpClient.get(`${environment.apiUrl}/produtoGeral`)
        .subscribe({
          next: (produtosGeralData) => {
            this.allProdutos = produtosGeralData as any[];
            this.produtoGerals = [...this.allProdutos]; // começa mostrando tudo
          },
          error: (error) => console.error('Erro ao carregar os produtos:', error)
        });
    }
  }

  limparPesquisa() {
    this.expression = '';
    this.filtrarProdutos(); // Chama filtro com campo limpo
  }
  getFullImageUrlGeral(imagemUrlGeral: string): string {
    return `${environment.apiUrl + '/produtoGeral'}${imagemUrlGeral}`;
  }

  // Método para redirecionar para a página de edição do produto
  editarProdutoGeral(id: string): void {
    this.router.navigate(['/edicao-produtoGeral', id]);
  }

  // Método para expandir a imagem na mesma página
  expandirImagemGeral(imagemUrlGeral: string): void {

    this.imagemAmpliadaUrlGeral = `${environment.apiUrl + '/produtoGeral'}${imagemUrlGeral}`;

    // Adiciona uma classe para mostrar a imagem ampliada
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }

  // Método para fechar a imagem ampliada
  fecharImagemAmpliada(): void {
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
    }
  }
  abrirFormularioCredenciais(ProdutoDeposito: any): void {
    console.log('ProdutoDeposito:', ProdutoDeposito); // Verifica se o ProdutoDeposito possui o id correto
    this.depositoSelecionado = {
      ...ProdutoDeposito,
      id: ProdutoDeposito.id // Certifique-se de que o ID está sendo copiado corretamente
    };
    console.log('depositoSelecionado:', this.depositoSelecionado); // Verifica se o id foi atribuído corretamente
  }

  fecharFormularioCredenciais(): void {
    this.depositoSelecionado = null;
    this.matricula = '';
    this.senha = '';
    this.file = null;
  }






  confirmarVenda(deposito: any): void {
    this.depositoSelecionado = deposito;

    // Certifique-se de que o ID correto está sendo capturado
    console.log('depositoSelecionado ID:', this.depositoSelecionado.id); // Agora deve mostrar o ID correto

    if (this.depositoSelecionado) {
      if (this.depositoSelecionado.quantidadeVendida > 0) {
        // Aqui, passe o 'id' correto para os parâmetros da requisição
        const options = { params: { matricula: this.matricula, senha: this.senha, id: this.depositoSelecionado.id } };

        this.spinner.show();
        console.log('dados enviados da venda', options); // Verifique os dados antes de enviar

        this.httpClient.post<any>(environment.apiUrl + '/produtoGeral/venda',
          { quantidadeVendida: this.depositoSelecionado.quantidadeVendida }, options)
          .subscribe({
            next: (response) => {
              this.spinner.hide();
              this.mensagem = response.message;
              this.fecharFormularioCredenciais();

              // Atualiza lista de produtos
              this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral`).subscribe({
                next: (produtos: any[]) => {
                  this.produtoGerals = [...produtos];
                },
                error: (err) => console.error(err)
              });
            },
            error: (error) => {
              alert('Erro ao confirmar venda. Usuário e senha incorretos, tente novamente.');
              this.spinner.hide();
            }
          });

      } else {
        alert('Por favor, selecione uma quantidade válida para vender.');
        this.spinner.hide();
      }
    } else {
      alert('Por favor, selecione um lote para venda.');
      this.spinner.hide();
    }
  }




  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.file = fileInput.files[0];  // Armazena o arquivo na variável file
    } else {
      this.file = null; // Reseta o arquivo caso nada seja selecionado
    }
  }




  uploadVenda(): void {
    if (!this.file) {
      alert('Por favor, selecione um arquivo antes de fazer o upload.');
      return; // Não continua se não houver arquivo
    }

    const formData = new FormData();
    formData.append('file', this.file); // Adiciona o arquivo ao FormData

    // Adiciona as credenciais como parâmetros na URL
    const options = {
      params: {
        matricula: this.matricula,
        senha: this.senha
      }
    };

    this.spinner.show();

    this.httpClient.post<any>(`${environment.apiUrl}/produtoGeral/upload-venda`, formData, options)
      .subscribe({
        next: (response) => {
          this.spinner.hide();


          this.mensagem = response.message;
          this.fecharFormularioCredenciais();
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Erro ao fazer upload:', error);
          alert('Erro ao fazer upload. Verifique suas credenciais e o arquivo.');
        }
      });
  }








  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      this.produtoGerals = [...this.allProdutos];
    } else {
      const termo = this.expression.toLowerCase();
      this.produtoGerals = this.allProdutos.filter(p =>
        Object.values(p).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(termo);
          } else if (typeof value === 'number') {
            return value.toString().includes(termo);
          }
          return false;
        })
      );
    }
    this.p = 1; // sempre volta para a primeira página após pesquisar
  }





  toggleDetalhes(produtoGeral: any): void {
    produtoGeral.mostrarDetalhes = !produtoGeral.mostrarDetalhes;

    if (produtoGeral.mostrarDetalhes && produtoGeral.produtoDeposito) {
      // Atribui o array de depósitos ao ProdutoDepositos
      this.depositos = produtoGeral.produtoDeposito;
    }
  }

}

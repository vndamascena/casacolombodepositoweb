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
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './consultar-produto-geral.component.html',
  styleUrl: './consultar-produto-geral.component.css'
})
export class ConsultarProdutoGeralComponent implements OnInit {
  quantidadeProdutoDepositoSelecionado: any;
  matricula: string = ''; // Propriedade para armazenar a matrícula do usuário
  senha: string = ''; // Propriedade para armazenar a senha do usuário
  produtoGerals: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  imagemAmpliadaUrlGeral: string | null = null; // URL da imagem ampliada
  produtoGeralFiltrados: any[] = []; // Array para armazenar produtos filtrados
  termoPesquisa: string = ''; // String para armazenar o termo de pesquisa
  mensagem: string = '';
 

  produtoGeral: any = {}; // Objeto para armazenar os detalhes do produto atual
  quantidadeProdutoDepositos: any[] = []; // Array para armazenar os deposito do produto atual
  p: number = 1;
  originalProdutoGerals: any[] = [];




  // Construtor para inicializar os atributos da classe
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // Recupera o ID do produto da URL
    const productId = this.route.snapshot.queryParams['id'];

    // Verifica se o ID do produto está presente na URL
    if (productId) {
      this.httpClient.get(environment.apiUrl + '/produtoGeral/${productId}')

        .subscribe({
          next: (produtoGeralData) => {

            this.produtoGeral = produtoGeralData;


            // Carrega os lotes do produto após obter os dados do produto
            this.carregarDepositos(this.produtoGeral);
            this.originalProdutoGerals = [...this.produtoGerals];

          },
          error: (error) => {
            console.error('Erro ao carregar o produto:', error);
          }
        });
    } else {
      // Se não houver ID do produto na URL, exibe todos os produtos
      this.httpClient.get(environment.apiUrl + '/produtoGeral')
        .subscribe({
          next: (produtosGeralData) => {
            this.produtoGerals = produtosGeralData as any[];
            this.originalProdutoGerals = [...this.produtoGerals];

          },
          error: (error) => {
            console.error('Erro ao carregar os produtos:', error);
          }
        });
    }
  }
  carregarDepositos(produtoGeral: any): void {
    // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
    if (produtoGeral.quantidadeProdutoDepositos && produtoGeral.quantidadeProdutoDepositos.length > 0) {
      // Se os lotes já estiverem presentes no objeto do produto,
      // não precisamos fazer mais nada, pois eles já foram carregados anteriormente

    } else {
      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/${produtoGeral.id}/quantidadeDeposito`)
        .subscribe((quantidadeProdutoDepositosData) => {
          produtoGeral.quantidadeProdutoDepositos = Array.isArray(quantidadeProdutoDepositosData) ? quantidadeProdutoDepositosData : []; // Garante que lotesData seja um array

        }, (error) => {
          console.error('Erro ao carregar os deposito', error);
        });
    }
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

  abrirFormularioCredenciais(quantidadeProdutoDeposito: any): void {
    this.quantidadeProdutoDepositoSelecionado = quantidadeProdutoDeposito;
  }
  fecharFormularioCredenciais(): void {
    this.quantidadeProdutoDepositoSelecionado = null;
    this.matricula = '';
    this.senha = '';
  }
  





  confirmarVenda(deposito: any): void {
    // Verifica se um lote foi selecionado
    this.quantidadeProdutoDepositoSelecionado = deposito;

    if (this.quantidadeProdutoDepositoSelecionado) {
      // Verifica se a quantidade vendida é maior que 0
      if (this.quantidadeProdutoDepositoSelecionado.quantidadeVendida > 0) {
        // Configuração dos parâmetros da solicitação POST
        const options = { params: { matricula: this.matricula, senha: this.senha, Id: this.quantidadeProdutoDepositoSelecionado.id } };
        this.spinner.show();

        this.httpClient.post<any>(environment.apiUrl + '/produtoGeral/venda', { quantidadeVendida: this.quantidadeProdutoDepositoSelecionado.quantidadeVendida }, options)
          .subscribe({
            next: (response) => {
              // Atualiza a quantidade do lote no cliente
              this.quantidadeProdutoDepositoSelecionado.quantidadeLote -= this.quantidadeProdutoDepositoSelecionado.quantidadeVendida;
              this.quantidadeProdutoDepositoSelecionado.quantidadeVendida = 0;
              this.spinner.hide();

              this.mensagem = response.message; // exibir mensagem de sucesso

              this.fecharFormularioCredenciais();

            },
            error: (error) => {

              alert('Erro ao confirmar venda. Usuário e senha incorreto, tente novamente.');
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







  // Método para filtrar os produtos com base na expressão de pesquisa
  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos da lista original
      this.originalProdutoGerals = [...this.produtoGerals];
      window.location.reload();
    } else {
      // Filtra os produtos com base na expressão de pesquisa na lista original
      this.produtoGerals = this.originalProdutoGerals.filter(p =>
        Object.values(p).some(value => {
          // Verifica se o valor é string ou número
          if (typeof value === 'string') {
            return value.toLowerCase().includes(this.expression.toLowerCase());
          } else if (typeof value === 'number') {
            // Converte o número para string e verifica se contém a expressão de pesquisa
            return value.toString().includes(this.expression);
          }
          return false;
        })
      );
    }
  }

  
  // Método para alternar a exibição dos detalhes do produto
  toggleDetalhes(produtoGeral: any): void {
    produtoGeral.mostrarDetalhes = !produtoGeral.mostrarDetalhes;
    if (produtoGeral.mostrarDetalhes && !produtoGeral.lotes) {
      this.carregarDepositos(produtoGeral); // Carrega os lotes do produto se ainda não estiverem carregados
    }
  }

}

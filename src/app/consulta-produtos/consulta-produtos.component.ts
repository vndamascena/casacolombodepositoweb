import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';




@Component({
    selector: 'app-consulta-produtos',
    imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './consulta-produtos.component.html',
    styleUrls: ['./consulta-produtos.component.css']
})
export class ConsultaProdutosComponent implements OnInit {
  loteSelecionado: any;
  matricula: string = ''; // Propriedade para armazenar a matrícula do usuário
  senha: string = ''; // Propriedade para armazenar a senha do usuário
  produtosPiso: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  imagemAmpliadaUrl: string | null = null; // URL da imagem ampliada
  produtosFiltrados: any[] = []; // Array para armazenar produtos filtrados
  termoPesquisa: string = ''; // String para armazenar o termo de pesquisa
  mensagem: string = '';


  produtoPiso: any = {}; // Objeto para armazenar os detalhes do produto atual
  lotes: any[] = []; // Array para armazenar os lotes do produto atual
  p: number = 1;
  originalProdutos: any[] = [];




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
    this.spinner.show();
    // Verifica se o ID do produto está presente na URL
    if (productId) {
      this.httpClient.get(environment.apiUrl + '/produtoPiso/${productId}')

        .subscribe({
          next: (produtoData) => {

            this.produtoPiso = produtoData;


            // Carrega os lotes do produto após obter os dados do produto
            this.carregarLotes(this.produtoPiso);
            this.originalProdutos = [...this.produtosPiso];

          },
          error: (error) => {
            console.error('Erro ao carregar o produto:', error);
            this.spinner.hide();
          }
        });
    } else {
      // Se não houver ID do produto na URL, exibe todos os produtos
      this.httpClient.get(environment.apiUrl + '/produtoPiso')
        .subscribe({
          next: (produtosData) => {
            this.produtosPiso = produtosData as any[];
            this.originalProdutos = [...this.produtosPiso];
            this.spinner.hide();

          },
          error: (error) => {
            console.error('Erro ao carregar os produtos:', error);
            this.spinner.hide();
          }
        });
    }
  }
  getFullImageUrl(imagemUrl: string): string {
    return `${environment.apiUrl + '/produtoPiso'}${imagemUrl}`;
  }

  // Método para redirecionar para a página de edição do produto
  editarProduto(id: string): void {
    this.router.navigate(['/edicao-produtos', id]);
  }

  // Método para expandir a imagem na mesma página
  expandirImagem(imagemUrl: string): void {

    this.imagemAmpliadaUrl = `${environment.apiUrl + '/produtoPiso'}${imagemUrl}`;

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



  mostrarInformacoes(produto: any): void {
    const informacoes = `                                      INDICAÇÕES DE USO

👉 LA: Lavabos e banheiros residencias.

👉 LB: Salas, dormitórios, corredores, áreas de serviços e
           cozinhas residencias sem acessos para rua e locais LA.

👉 LC: Ambientes comerciais sem acesso para a rua, garagens, 
           varandas e ambientes residencias  com acesso para 
           a rua e locais LA e LB.

👉 LD: Àreas comecerciais com acesso para a rua 
           e locais LA, LB e LC.

👉 LE: Calçadas e ambientes externos com áreas planas
           e locais  LA, LB, LC e LD.

👉 LF: Fachadas (limitado a 5 metros de altura  e com uso 
           de argamassa apropriada).
           
👉 LR: Revestimentos para paredes internas.`;
    window.alert(informacoes);
  }

  abrirFormularioCredenciais(lote: any): void {
    this.loteSelecionado = lote;
  }
  fecharFormularioCredenciais(): void {
    this.loteSelecionado = null;
    this.matricula = '';
    this.senha = '';
  }
  





  confirmarVenda(lote: any): void {
    // Verifica se um lote foi selecionado
    this.loteSelecionado = lote;

    if (this.loteSelecionado) {
      // Verifica se a quantidade vendida é maior que 0
      if (this.loteSelecionado.quantidadeVendida > 0) {
        // Configuração dos parâmetros da solicitação POST
        const options = { params: { matricula: this.matricula, senha: this.senha, Id: this.loteSelecionado.id } };
        this.spinner.show();

        this.httpClient.post<any>(environment.apiUrl + '/produtoPiso/venda', { quantidadeVendida: this.loteSelecionado.quantidadeVendida }, options)
          .subscribe({
            next: (response) => {
              // Atualiza a quantidade do lote no cliente
              this.loteSelecionado.quantidadeLote -= this.loteSelecionado.quantidadeVendida;
              this.loteSelecionado.quantidadeVendida = 0;
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



  limparPesquisa() {
  this.expression = '';
  this.filtrarProdutos(); // Chama filtro com campo limpo
}



  // Método para filtrar os produtos com base na expressão de pesquisa
  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos da lista original
      this.originalProdutos = [...this.produtosPiso];
      window.location.reload();
    } else {
      // Filtra os produtos com base na expressão de pesquisa na lista original
      this.produtosPiso = this.originalProdutos.filter(p =>
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
  toggleDetalhes(produto: any): void {
    produto.mostrarDetalhes = !produto.mostrarDetalhes;
    if (produto.mostrarDetalhes && !produto.lotes) {
      this.carregarLotes(produto); // Carrega os lotes do produto se ainda não estiverem carregados
    }
  }



  carregarLotes(produto: any): void {
    // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
    if (produto.lotes && produto.lotes.length > 0) {
      // Se os lotes já estiverem presentes no objeto do produto,
      // não precisamos fazer mais nada, pois eles já foram carregados anteriormente

    } else {
      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/${produto.id}/lotes`)
        .subscribe((lotesData) => {
          produto.lotes = Array.isArray(lotesData) ? lotesData : []; // Garante que lotesData seja um array

        }, (error) => {
          console.error('Erro ao carregar os lotes:', error);
        });
    }
  }

}
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-consulta-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consulta-produtos.component.html',
  styleUrls: ['./consulta-produtos.component.css']
})
export class ConsultaProdutosComponent implements OnInit {

  produtos: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  imagemAmpliadaUrl: string | null = null; // URL da imagem ampliada
  produtosFiltrados: any[] = []; // Array para armazenar produtos filtrados
  termoPesquisa: string = ''; // String para armazenar o termo de pesquisa

  produto: any = {}; // Objeto para armazenar os detalhes do produto atual
  lotes: any[] = []; // Array para armazenar os lotes do produto atual

  // Construtor para inicializar os atributos da classe
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Recupera o ID do produto da URL
    const productId = this.route.snapshot.queryParams['id'];

    // Verifica se o ID do produto está presente na URL
    if (productId) {
      this.httpClient.get(`http://localhost:5096/api/produto/${productId}`)
        .subscribe({
          next: (produtoData) => {
            this.produto = produtoData;
            // Carrega os lotes do produto após obter os dados do produto
            this.carregarLotes(this.produto); 
          },
          error: (error) => {
            console.error('Erro ao carregar o produto:', error);
          }
        });
    } else {
      // Se não houver ID do produto na URL, exibe todos os produtos
      this.httpClient.get('http://localhost:5096/api/produto')
        .subscribe({
          next: (produtosData) => {
            this.produtos = produtosData as any[];
          },
          error: (error) => {
            console.error('Erro ao carregar os produtos:', error);
          }
        });
    }
  }

  // Método para redirecionar para a página de edição do produto
  editarProduto(id: string): void {
    this.router.navigate(['/edicao-produtos', id]);
  }

  // Método para expandir a imagem na mesma página
  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl);
    this.imagemAmpliadaUrl = imagemUrl;

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

  // Função para registrar a venda e atualizar a quantidade em estoque
  confirmarVenda(produto: any): void {
    // Verifica se a quantidade vendida é válida
    if (produto.quantidadeVendida > 0) {
      // Envia uma solicitação para a API para registrar a venda
      this.httpClient.post<any>('http://localhost:5096/api/venda', {
        produtoId: produto.id,
        quantidadeVendida: produto.quantidadeVendida
      })
        .subscribe({
          next: (response) => {
            // Atualiza a quantidade em estoque com base na resposta da API
            produto.quantidade -= response.quantidadeVendida;
            // Reinicia a quantidade vendida para 0 após a venda ser confirmada
            produto.quantidadeVendida = 0;
            alert('Venda confirmada com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao confirmar venda:', error);
            alert('Erro ao confirmar venda. Por favor, tente novamente mais tarde.');
          }
        });
    } else {
      alert('Por favor, selecione uma quantidade válida para vender.');
    }
  }

  // Método para filtrar os produtos com base na expressão de pesquisa
  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos
      this.ngOnInit();
    } else {
      // Filtra os produtos com base na expressão de pesquisa
      this.produtos = this.produtos.filter(p =>
        Object.values(p).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(this.expression.toLowerCase())
        )
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

  // Método para carregar os lotes do produto
  carregarLotes(produto: any): void {
    // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
    if (produto.lotes && produto.lotes.length > 0) {
      // Se os lotes já estiverem presentes no objeto do produto,
      // não precisamos fazer mais nada, pois eles já foram carregados anteriormente
      console.log('Lotes já carregados:', produto.lotes);
    } else {
      
  
      this.httpClient.get<any[]>(`http://localhost:5096/api/produto/${produto.id}/lotes`)
        .subscribe((lotesData) => {
          produto.lotes = Array.isArray(lotesData) ? lotesData : []; // Garante que lotesData seja um array
          console.log('Lotes carregados:', produto.lotes);
        }, (error) => {
          console.error('Erro ao carregar os lotes:', error);
        });
    }
  }}  
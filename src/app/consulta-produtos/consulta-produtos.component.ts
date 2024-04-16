import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, RouterModule, Router} from '@angular/router';



@Component({
  selector: 'app-consulta-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consulta-produtos.component.html',
  styleUrl: './consulta-produtos.component.css'
})
export class ConsultaProdutosComponent implements OnInit {

  produtos: any[] = []; //array de objetos
  expression: string = '';
  imagemAmpliadaUrl: string | null = null;
  produtosFiltrados: any[] = [];
  termoPesquisa: string = '';

  
  produto: any = {}; // Objeto para armazenar os detalhes do produto
  //construtor para inicializar os atributos da classe
  constructor(
    private route: ActivatedRoute, 
    private httpClient: HttpClient, 
    private router: Router) { }

 ngOnInit(): void {
    // Recuperar o ID do produto da URL
    
    const productId = this.route.snapshot.queryParams['id'];

    // Verificar se o ID do produto está presente na URL
    if (productId) {
      this.httpClient.get(`http://localhost:5096/api/produto/${productId}`)
        .subscribe({
          next: (data) => {
            this.produtos = [data];
          },
          error: (e) => {
            console.log(e);
          }
        });
    } else {
      // Se não houver ID do produto na URL, exibir todos os produtos
      this.httpClient.get('http://localhost:5096/api/produto')
        .subscribe({
          next: (data) => {
            this.produtos = data as any[];
          },
          error: (e) => {
            console.log(e);
          }
        });
    }
  }

  // Método para redirecionar para a página de edição com o ID do produto
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
  fecharImagemAmpliada(): void {
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
        imagemAmpliada.classList.remove('mostrar');
    }
  }
  // Função para registrar a venda e atualizar a quantidade em estoque
  confirmarVenda(produto: any) {
    // Verifica se a quantidade vendida é válida
    if (produto.quantidadeVendida > 0) {
      // Envia uma solicitação para a API para registrar a venda
      this.httpClient.post  <any>('http://localhost:5096/api', { 
        produtoId: produto.id,
        quantidadeVendida: produto.quantidadeVendida
      }).subscribe({
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
  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, carrega todos os produtos
      this.ngOnInit ();
    } else {
      // Filtra os produtos com base na expressão de pesquisa
      this.produtos = this.produtos.filter(p =>
        Object.values(p).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(this.expression.toLowerCase())
        )
      );
    }
} }


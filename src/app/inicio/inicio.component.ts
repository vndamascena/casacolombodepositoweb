import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  vendas: any[] = [];
  produtos: any[] = []; // Array de objetos para armazenar produtos
  grupoVendas: any = {};
  startDate: Date = new Date();
  endDate: Date = new Date();
  p: number = 1;
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  produtoMaisVendido: any = {};
  produtoMenosVendido: any = {};
  produtoMaisVendidoImagemUrl: string = '';
  produto: any ={};
  produtosComBaixaQuantidade: any[]= [];
  ocorrencias: any[] = []; 
  correncia: any ={};
  escala: any[] = [];
  imagemAmpliadaUrl: string | null = null;
  zoomLevel: string = 'scale(1)';

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {

    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

   

    this.httpClient.get(environment.apiUrl + '/produtoGeral')
      .subscribe({
        next: (produtosData) => {
          this.produtos = produtosData as any[];
          
          this.findProdutosComBaixaQuantidade();
        },
        error: (error) => {
          console.error('Erro ao carregar os produtos:', error);
        }
      });
     
      
  }

  controlarZoom(event: WheelEvent) {
    event.preventDefault();
    const incremento = event.deltaY < 0 ? 0.1 : -0.1;
    this.zoomLevel = this.calcularNovoZoom(incremento);
  }

  calcularNovoZoom(incremento: number): string {
    const match = this.zoomLevel.match(/scale\(([^)]+)\)/);
    if (match) {
      const currentScale = parseFloat(match[1]);
      const newScale = Math.max(0.1, currentScale + incremento);
      return `scale(${newScale})`;
    }
    return this.zoomLevel;
  }

  getFullImageUrl(imagemUrl: string): string {
    return `${environment.entregatitulo}/tituloreceber${imagemUrl}`;
  }

  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl); // Adicione esta linha
    this.imagemAmpliadaUrl = this.getFullImageUrl(imagemUrl);
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }

  fecharImagemAmpliada(dia: any = null): void {
    const target = dia || this;
    target.imagemAmpliadaUrl = null;
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
    }
  }
  findProdutoMaisVendido(): void {
    const produtoQuantidades: { [key: string]: { quantidade: number, nomeProduto: string } } = {};
  
    // Calcular a quantidade total vendida para cada produto
    this.vendas.forEach(venda => {
      if (venda.nomeProduto) {
        if (!produtoQuantidades[venda.nomeProduto]) {
          produtoQuantidades[venda.nomeProduto] = { quantidade: 0, nomeProduto: venda.nomeProduto };
        }
        produtoQuantidades[venda.nomeProduto].quantidade += venda.quantidade;
      } else {
        console.warn('Venda com nomeProduto undefined:', venda);
      }
    });
  
    // Transformar objeto em array para facilitar a ordenação
    const produtosArray = Object.keys(produtoQuantidades).map(key => produtoQuantidades[key]);
  
    // Ordenar os produtos por quantidade vendida em ordem decrescente
    produtosArray.sort((a, b) => b.quantidade - a.quantidade);
  
    // Selecionar os três primeiros produtos mais vendidos
    const produtosMaisVendidos = produtosArray.slice(0,1);
  
    // Encontrar a URL da imagem para cada produto mais vendido
    produtosMaisVendidos.forEach(produto => {
      const produtoEncontrado = this.produtos.find(p => p.nome === produto.nomeProduto);
      
    });
  
    // Armazenar os produtos mais vendidos no atributo da classe
    this.produtoMaisVendido = produtosMaisVendidos;
  
    console.log('Produtos Mais Vendidos:', this.produtoMaisVendido);
  }
  
  findProdutoMenosVendido(): void {
    const produtoQuantidades: { [key: string]: { quantidade: number, nomeProduto: string } } = {};
  
    // Calcular a quantidade total vendida para cada produto
    this.vendas.forEach(venda => {
      if (venda.nomeProduto) {
        if (!produtoQuantidades[venda.nomeProduto]) {
          produtoQuantidades[venda.nomeProduto] = { quantidade: 0, nomeProduto: venda.nomeProduto };
        }
        produtoQuantidades[venda.nomeProduto].quantidade += venda.quantidade;
      } else {
        console.warn('Venda com nomeProduto undefined:', venda);
      }
    });
  
    // Transformar objeto em array para facilitar a ordenação
    const produtosArray = Object.keys(produtoQuantidades).map(key => produtoQuantidades[key]);
  
    // Ordenar os produtos por quantidade vendida em ordem crescente para encontrar o menos vendido
    produtosArray.sort((a, b) => a.quantidade - b.quantidade);
  
    // Selecionar o produto menos vendido (primeiro da lista após ordenação)
    const produtosMenosVendidos = produtosArray.slice(0, 1);
    produtosMenosVendidos.forEach(produto => {
      const produtoEncontrado = this.produtos.find(p => p.nome === produto.nomeProduto);
      
    });
    this.produtoMenosVendido = produtosMenosVendidos;
  
    console.log('Produto Menos Vendido:', this.produtoMenosVendido);
  }


  findProdutosComBaixaQuantidade(): void {
    const produtosComBaixaQuantidade = this.produtos.filter(produto => produto.quantidade <= 20);
    //console.log('Produtos com Baixa Quantidade:', produtosComBaixaQuantidade);
   
    this.produtosComBaixaQuantidade = produtosComBaixaQuantidade;
  }

  convertToBrazilTime(date: Date): Date {
    // Criar um novo objeto Date baseado na data original
    const pstDate = new Date(date);

    // Calcular a diferença entre PST (UTC-8) e BRT (UTC-3)
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);

    // Ajustar a data para o fuso horário do Brasil
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);

    return brazilTime;
  }

  loadUserName(ocorrencia: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${ocorrencia.usuarioId}`)
      .subscribe({
        next: (userData) => {
          ocorrencia.nome = userData.nome; // Atribuir o nome do usuário
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
  }
  
}

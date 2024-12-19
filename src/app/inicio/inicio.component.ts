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

  isInicioComponent: boolean = true;

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
  produto: any = {};
  produtosPisosComBaixaQuantidade: any[] = [];
  produtosComBaixaQuantidade: any[] = [];
  ocorrencias: any[] = [];
  correncia: any = {};
  escalas: any[] = [];
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



    this.httpClient.get(environment.entregatitulo + '/home/escala')
      .subscribe({
        next: (produtosData) => {
          this.escalas = produtosData as any[];


        },
        error: (error) => {
          console.error('Erro ao carregar os produtos:', error);
        }
      });
      
      
    this.httpClient.get(environment.apiUrl + '/ProdutoPiso/venda')
         .subscribe({
      next: (vendas) => {
        this.vendas = vendas as any[];
        this.findProdutoMaisVendido();
        this.findProdutoMenosVendido();
      },
      error: (error) => {
        console.error('Erro ao carregar vendas:', error);
      }
    });
    this.findProdutosPisosComBaixaQuantidade();
    this.findProdutosComBaixaQuantidade();


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
    return `${environment.entregatitulo}/home${imagemUrl}`;
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

  // Calcular as quantidades
  this.vendas.forEach(venda => {
    if (venda.nomeProduto) {
      if (!produtoQuantidades[venda.nomeProduto]) {
        produtoQuantidades[venda.nomeProduto] = { quantidade: 0, nomeProduto: venda.nomeProduto };
      }
      produtoQuantidades[venda.nomeProduto].quantidade += venda.quantidade;
    }
  });

  // Ordenar por quantidade decrescente
  const produtosArray = Object.values(produtoQuantidades).sort((a, b) => b.quantidade - a.quantidade);

  // Top 3 com posições
  this.produtoMaisVendido = produtosArray.slice(0, 5).map((produto, index) => ({
    ...produto,
    posicao: `${index + 1}º` // Adiciona 1º, 2º, 3º
  }));
}

findProdutoMenosVendido(): void {
  const produtoQuantidades: { [key: string]: { quantidade: number, nomeProduto: string } } = {};

  // Calcular as quantidades
  this.vendas.forEach(venda => {
    if (venda.nomeProduto) {
      if (!produtoQuantidades[venda.nomeProduto]) {
        produtoQuantidades[venda.nomeProduto] = { quantidade: 0, nomeProduto: venda.nomeProduto };
      }
      produtoQuantidades[venda.nomeProduto].quantidade += venda.quantidade;
    }
  });

  // Ordenar por quantidade crescente
  const produtosArray = Object.values(produtoQuantidades).sort((a, b) => a.quantidade - b.quantidade);

  // Selecionar os 3 últimos colocados e adicionar posições
 
  this.produtoMenosVendido = produtosArray.slice(0, 5).map((produto, index) => ({
    ...produto,
    posicao: `${index + 1}º` // Adiciona 1º, 2º, 3º
  }));
}

  
  

  findProdutosPisosComBaixaQuantidade(): void {
    this.httpClient.get<any[]>(environment.apiUrl + '/ProdutoPiso')
      .subscribe({
        next: (produtos: any[]) => {
          this.produtosPisosComBaixaQuantidade = produtos
            .filter(produto => produto.quantidade <= 20)
            .sort((a, b) => a.quantidade - b.quantidade); 
          console.log('Pisos com baixa quantidade:', this.produtosPisosComBaixaQuantidade);
        },
        error: (error) => {
          console.error('Erro ao carregar os produtos:', error);
        }
      });
  }

  findProdutosComBaixaQuantidade(): void {
    this.httpClient.get<any[]>(environment.apiUrl + '/ProdutoGeral')
      .subscribe({
        next: (produtos: any[]) => {
          this.produtosComBaixaQuantidade = produtos
            .filter(produto => produto.quantidadeProd <= 20)
            .sort((a, b) => a.quantidadeProd - b.quantidadeProd); 
          console.log('Produtos com baixa quantidade:', this.produtosComBaixaQuantidade);
        },
        error: (error) => {
          console.error('Erro ao carregar os produtos:', error);
        }
      });
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

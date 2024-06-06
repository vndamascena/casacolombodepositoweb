import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-historico-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './historico-vendas.component.html',
  styleUrl: './historico-vendas.component.css'
})
export class HistoricoVendasComponent implements OnInit {

  vendas: any[] = [];
  produtos: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  grupoVendas: any = {};
  startDate: Date = new Date();
  endDate: Date = new Date();
  userApiUrl: string = 'http://localhost:5233/api/usuarios';

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`)
      .subscribe({
        next: (vendasData) => {
          this.vendas = vendasData;
          this.vendas.forEach(venda => this.loadUserName(venda));
         
        },
        error: (error) => {
          console.error('Erro ao carregar o histórico de vendas:', error);
        }
      });

  }


  loadUserName(venda: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${venda.usuarioId}`)
      .subscribe({
        next: (userData) => {
          venda.nome = userData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
  }


  



  

  filterData() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
  
      // Set the end date to the beginning of the next day to include all sales on the end date
      end.setDate(end.getDate() + 1);
  
      this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`).subscribe({
        next: (vendasData) => {
          this.vendas = vendasData.filter(venda => {
            const vendaDate = new Date(venda.dataVenda);
  
            // Check if the sale date is within the range (inclusive start, exclusive end)
            return vendaDate >= start && vendaDate < end;
          });
         
        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });
    }
  }
  
    
  
   // Método para alternar a exibição dos detalhes do produto
   toggleDetalhes(produto: any): void {
        produto.mostrarDetalhes = !produto.mostrarDetalhes;
        if(produto.mostrarDetalhes && !produto.lotes) {
        this.carregarLotes(produto);// Carrega os lotes do produto se ainda não estiverem carregados
      }
    }

    carregarLotes(produto: any): void {
      // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
      if(produto.lotes && produto.lotes.length > 0) {
      // Se os lotes já estiverem presentes no objeto do produto,
      // não precisamos fazer mais nada, pois eles já foram carregados anteriormente

    } else {
      this.httpClient.get<any[]>(`${environment.apiUrl}/produto/${produto.id}/lotes`)
        .subscribe((lotesData) => {
          produto.lotes = Array.isArray(lotesData) ? lotesData : []; // Garante que lotesData seja um array

        }, (error) => {
          console.error('Erro ao carregar os lotes:', error);
        });
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

}
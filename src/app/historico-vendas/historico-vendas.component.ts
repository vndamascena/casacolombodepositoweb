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
  venda: any ={}

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`)
      .subscribe({
        next: (vendasData) => {
          this.vendas = vendasData.reduce((acc, venda) => {
            const usuarioId = venda.usuarioId;
            if (!acc[usuarioId]) {
              acc[usuarioId] = {
                usuarioId: usuarioId,
                vendas: [],
                mostrarDetalhes: false,
              };
            }
            acc[usuarioId].vendas.push(venda);
            return acc;
          }, {});
          this.vendas = Object.values(this.vendas);
        },
        error: (error) => {
          console.error('Erro ao carregar o histórico de vendas:', error);
        },
      });
  }

  filterData() {
    if (this.startDate && this.endDate) {
      const start = this.startDate.toISOString();
      const end = this.endDate.toISOString();
      this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`, {
        params: {
          startDate: start,
          endDate: end
        }
      }).subscribe({
        next: (vendasData) => {
          this.vendas = vendasData;
        },
          error: (error) => {
            console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });
    }
  }

   // Método para alternar a exibição dos detalhes do produto
   toggleDetalhesUsuario(vendaAgrupada: any): void {
    vendaAgrupada.mostrarDetalhes = !vendaAgrupada.mostrarDetalhes;
    if (vendaAgrupada.mostrarDetalhes && !vendaAgrupada.lotesCarregados) {
      this.carregarLotesUsuario(vendaAgrupada);
    }
  }
  
  carregarLotesUsuario(vendaAgrupada: any): void {
    vendaAgrupada.lotesCarregados = true;
    vendaAgrupada.vendas.forEach((venda: { lotes: any[]; id: any; }) => {
      if (!venda.lotes) {
        this.httpClient
          .get<any[]>(`${environment.apiUrl}/produto/${venda.id}/lotes`)
          .subscribe((lotesData) => {
            venda.lotes = Array.isArray(lotesData) ? lotesData : [];
          });
      }
    });
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


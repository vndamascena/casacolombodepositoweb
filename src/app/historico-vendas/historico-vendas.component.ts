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
  p: number = 1;
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {

    
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    

    

    this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`)
      .subscribe({
        next: (vendasData) => {
          this.vendas = vendasData.map(venda => {
            venda.dataVenda = this.convertToBrazilTime(new Date(venda.dataVenda));
            return venda;
          });
          
          this.vendas.sort((a, b) => b.dataVenda - a.dataVenda);
          this.vendas.forEach(venda => this.loadUserName(venda));
          this.filterData();
          
         

        },
        error: (error) => {
          console.error('Erro ao carregar o histórico de vendas:', error);
        }
      });

  }


 

  convertToBrazilTime(date: Date): Date {
    // Cria um novo objeto Date baseado na data original
    const pstDate = new Date(date);

    // Calcula a diferença entre PST (UTC-8) e BRT (UTC-3)
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);

    // Ajusta a data para o fuso horário do Brasil
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);

    return brazilTime;
  }







  loadUserName(venda: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${venda.usuarioId}`)
      .subscribe({
        next: (userData) => {
          venda.nome = userData.nome; // Atribuir o nome do usuário
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
  }


  filterData(): void {

    
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
     
      end.setDate(end.getDate() + 1);

      this.httpClient.get<any[]>(`${environment.apiUrl}/produto/venda`).subscribe({
        next: (vendasData) => {
          this.vendas = vendasData.map(venda => {
            venda.dataVenda = this.convertToBrazilTime(new Date(venda.dataVenda));
            return venda;
          }).filter(venda => {
            const vendaDate = new Date(venda.dataVenda);

            return vendaDate >= start && vendaDate < end;
          });
           
          this.vendas.sort((a, b) => b.dataVenda - a.dataVenda);
          this.vendas.forEach(venda => this.loadUserName(venda));
         
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
    if (produto.mostrarDetalhes && !produto.lotes) {
      this.carregarLotes(produto);// Carrega os lotes do produto se ainda não estiverem carregados
    }
  }

  carregarLotes(produto: any): void {
    // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
    if (produto.lotes && produto.lotes.length > 0) {
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
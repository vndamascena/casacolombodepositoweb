import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-historico-venda-produto-geral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './historico-venda-produto-geral.component.html',
  styleUrl: './historico-venda-produto-geral.component.css'
})
export class HistoricoVendaProdutoGeralComponent implements OnInit{
  vendas: any[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  expression: string = ''; // String para armazenar a expressão de pesquisa
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  combinedData: any[] = []; 
  originalVendas: any[] = [];
  originalCombinedData: any[] = [];
  p: number = 1;
  produtos: any[] = []; // Array de objetos para armazenar produtos
  produtoDepositos: any [] = []
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }



  ngOnInit(): void {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/venda`)
      .subscribe({
        next: (vendasData) => {
          this.vendas = vendasData.map(venda => {
            venda.dataVenda = new Date(venda.dataVenda); // Certifique-se de que a data seja convertida para Date
            return venda;
          });

          this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/produtoDepositos`)
            .subscribe({
              next: (ProdutoDepositoData) => {
                // Aplique o filtro antes de mapear os depositos
                this.produtoDepositos = ProdutoDepositoData
                .filter(ProdutoDeposito => {
                  console.log('Filtrando deposito:', ProdutoDeposito.codigoSistema, ProdutoDeposito.nomeProduto); 
                  return ProdutoDeposito.codigoSistema.trim().toLowerCase() !== 'xxx' && ProdutoDeposito.nomeProduto.trim().toLowerCase() !== 'xxx';
                })
                

                // Combine os dados de vendas e depositos
                this.combinedData = [
                  ...this.vendas.map(venda => ({
                    ...venda,
                    data: venda.dataVenda, // Usa dataVenda para a ordenação
                    tipo: 'dataVenda' // Adiciona um campo para diferenciar
                  })),

                  ...this.produtoDepositos.map(deposito => ({
                    ...deposito,
                    data: deposito.dataEntrada, // Usa dataEntrada para a ordenação
                    tipo: 'dataEntrada' // Adiciona um campo para diferenciar
                  }))
                 
                ];

                // Carrega os nomes dos usuários para todos os itens combinados
                this.combinedData.forEach(item => this.loadUserName(item));
                this.combinedData.forEach(item => this.loadEntryUserName(item));
                this.originalCombinedData = [...this.combinedData];
                

                // Ordena os dados combinados por data de forma decrescente (do mais recente para o mais antigo)
                this.combinedData.sort((a, b) => b.data.getTime() - a.data.getTime());
              },
              error: (error) => {
                console.error('Erro ao carregar os depositos:', error);
              }
            });
        },
        error: (error) => {
          console.error('Erro ao carregar o histórico de vendas:', error);
        }
      });
  }
















  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os dados combinados da lista original
      this.combinedData = [...this.originalCombinedData];
      
      // Ordena os dados combinados por data de forma decrescente (do mais recente para o mais antigo)
      this.combinedData.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      window.location.reload();
      
    } else {
      const searchTerm = this.expression.toLowerCase();
      
      // Filtrar a tabela com base no termo de pesquisa
      this.combinedData = this.originalCombinedData.filter(item => {
        // Itera sobre todos os valores do item (registro da tabela)
        return Object.keys(item).some(key => {
          const value = item[key];
          
          // Verifica se o valor é válido (não nulo, não indefinido)
          if (value !== null && value !== undefined) {
            // Converte o valor para string, independentemente do tipo, e compara com o termo de pesquisa
            return value.toString().toLowerCase().includes(searchTerm);
          }
          
          return false;
        });
      });
      
      // Ordena os dados filtrados por data de forma decrescente (do mais recente para o mais antigo)
      this.combinedData.sort((a, b) => b.data.getTime() - a.data.getTime());
    }
  }
  

  filterData(): void {

    
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
     
      end.setDate(end.getDate() + 1);

      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/venda`).subscribe({
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

  convertToBrazilTime(date: Date): Date {
    // Cria um novo objeto Date baseado na data original
    const pstDate = new Date(date);

    // Calcula a diferença entre PST (UTC-8) e BRT (UTC-3)
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);

    // Ajusta a data para o fuso horário do Brasil
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);

    return brazilTime;
  }


  carregarDepositos(produto: any): void {
    // Verificamos se o produto possui a propriedade "lotes" e se ela não está vazia
    if (produto.produtoDepositos && produto.produtoDepositos.length > 0) {
      // Se os lotes já estiverem presentes no objeto do produto,
      // não precisamos fazer mais nada, pois eles já foram carregados anteriormente

    } else {
      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/${produto.id}/produtoDeposito`)
        .subscribe((DepositosData) => {
          produto.produtoDepositos = Array.isArray(DepositosData) ? DepositosData : []; // Garante que lotesData seja um array

        }, (error) => {
          console.error('Erro ao carregar os lotes:', error);
        });
    }
  }

// Método para alternar a exibição dos detalhes do produto
toggleDetalhes(produto: any): void {
  produto.mostrarDetalhes = !produto.mostrarDetalhes;
  if (produto.mostrarDetalhes && !produto.produtoDepositos) {
    this.carregarDepositos(produto);// Carrega os lotes do produto se ainda não estiverem carregados
  }
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

  loadEntryUserName(entrada: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${entrada.usuarioIdCadastro}`)
      .subscribe({
        next: (userData) => {
          entrada.nome = userData.nome; // Atribuir o nome do usuário para a entrada
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário (entrada):', error);
        }
      });
  }

}

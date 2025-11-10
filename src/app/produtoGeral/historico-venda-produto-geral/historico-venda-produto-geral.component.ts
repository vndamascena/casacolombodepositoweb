import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-historico-venda-produto-geral',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './historico-venda-produto-geral.component.html',
  styleUrl: './historico-venda-produto-geral.component.css'
})
export class HistoricoVendaProdutoGeralComponent implements OnInit {
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
  produtoDepositos: any[] = []
  filtroEntrada: boolean = false;
  filtroSaida: boolean = false;
  dadosOriginais: any[] = [];
  dadosFiltrados: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }



  ngOnInit(): void {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);


    forkJoin({
      vendas: this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/venda`),
      produtoDepositos: this.httpClient.get<any[]>(`${environment.apiUrl}/produtoGeral/produtoDepositos`)
    }).subscribe({
      next: ({ vendas, produtoDepositos }) => {
        this.vendas = vendas.map(venda => {
          venda.dataVenda = new Date(venda.dataVenda); // Certifique-se de que a data seja convertida para Date
          return venda;
        });




        // Aplique o filtro antes de mapear os depositos
        this.produtoDepositos = produtoDepositos
          .filter(ProdutoDeposito =>

            ProdutoDeposito.codigoSistema.trim().toLowerCase() !== 'xxx' &&
            ProdutoDeposito.nomeProduto.trim().toLowerCase() !== 'xxx'
          )
          .map(produtoDeposito => {
            produtoDeposito.dataEntrada = new Date(produtoDeposito.dataEntrada);
            return produtoDeposito

          })


        // Combine os dados de vendas e depositos
        this.combinedData = [
          ...this.vendas.map(venda => ({
            ...venda,
            data: venda.dataVenda, // Usa dataVenda para a ordenação
            tipo: 'dataVenda' // Adiciona um campo para diferenciar
          })),

          ...this.produtoDepositos.map(prdodutoDeposito => ({
            ...prdodutoDeposito,
            data: prdodutoDeposito.dataEntrada, // Usa dataEntrada para a ordenação
            tipo: 'dataEntrada' // Adiciona um campo para diferenciar
          }))

        ];
        this.carregarNomesUsuarios();
        

        // Ordena por data
        this.combinedData.sort((a, b) => b.data.getTime() - a.data.getTime());
        this.originalCombinedData = [...this.combinedData];
        this.dadosOriginais = [...this.combinedData];
        this.dadosFiltrados = [...this.combinedData];
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
    });
  }


 carregarNomesUsuarios(): void {
  // Pega todos os IDs possíveis (de vendas e de entradas)
  const uniqueIds = Array.from(new Set(
    this.combinedData
      .map(item => item.usuarioId || item.usuarioIdCadastro) // pega dos dois campos
      .filter(id => !!id) // remove null/undefined
      .map(id => Number(id)) // converte para número
      .filter(id => !isNaN(id)) // garante que é número válido
  ));

  // Faz as requisições para buscar os nomes
  const userRequests = uniqueIds.map(id =>
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${id}`)
      .pipe(
        catchError(() => of({ nome: 'Desconhecido', id }))
      )
  );

  forkJoin(userRequests).subscribe(users => {
    const nomeMap = new Map<number, string>();

    users.forEach((user, index) => {
      nomeMap.set(uniqueIds[index], user.nome || 'Desconhecido');
    });

    // Atribui nomes aos objetos
    this.combinedData.forEach(item => {
      const id = Number(item.usuarioId || item.usuarioIdCadastro);
      item.nome = nomeMap.get(id) || 'Desconhecido';
    });
  });
}


  loadUserName(venda: any): void {

    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${venda.usuarioId}`)
      .subscribe({
        next: (userData) => {
          venda.nome = userData.nome;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar nome para ID', venda.usuarioId, ':', error);
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

  onFiltroCheck(): void {
    // Nenhum filtro → mostra tudo
    if (!this.filtroEntrada && !this.filtroSaida) {
      this.dadosFiltrados = [...this.dadosOriginais];
      return;
    }

    this.dadosFiltrados = this.dadosOriginais.filter(item => {
      // Entrada = registros que vieram de "lotes" (sem dataVenda)
      if (this.filtroEntrada && item.tipo === 'dataEntrada') {
        return true;
      }

      // Saída = registros que vieram de "vendas" (com dataVenda)
      if (this.filtroSaida && item.tipo === 'dataVenda') {
        return true;
      }

      return false;
    });
  }







  limparPesquisa() {
    this.expression = '';
    this.filtrarProdutos(); // Chama filtro com campo limpo
  }




  filtrarProdutos(): void {
    const searchTerm = this.expression.trim().toLowerCase();

    if (!searchTerm) {
      // Se campo de pesquisa estiver vazio, volta para todos os registros
      this.dadosFiltrados = [...this.dadosOriginais];
    } else {
      // Pesquisa em todos os registros (não importa a página)
      this.dadosFiltrados = this.dadosOriginais.filter(item => {
        return Object.values(item).some(value => {
          if (value !== null && value !== undefined) {
            return value.toString().toLowerCase().includes(searchTerm);
          }
          return false;
        });
      });
    }

    // Ordena por data do mais recente para o mais antigo
    this.dadosFiltrados.sort((a, b) => b.data.getTime() - a.data.getTime());

    // Sempre volta para a primeira página
    this.p = 1;
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



}

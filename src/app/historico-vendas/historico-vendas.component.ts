import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-historico-vendas',
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
  originalVendas: any[] = [];
  originalCombinedData: any[] = [];
  lotes: any[] = [];
  combinedData: any[] = [];
  dadosOriginais: any[] = [];
  dadosFiltrados: any[] = [];
  filtroEntrada: boolean = false;
  filtroSaida: boolean = false;
  dataVendaInicio: string = '';
  dataVendaFim: string = '';
  totalVendidoGeral: number = 0;
  totalEntradaGeral: number = 0;

  totalVendidoFiltrado: number = 0;
  totalEntradaFiltrada: number = 0;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Carrega vendas e lotes em paralelo
    forkJoin({
      vendas: this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/venda`),
      lotes: this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/lotes`)
    }).subscribe({
      next: ({ vendas, lotes }) => {
        // Trata vendas
        this.vendas = vendas.map(venda => {
          venda.dataVenda = new Date(venda.dataVenda);
          return venda;
        });

        // Trata lotes filtrando 'xxx'
        this.lotes = lotes
          .filter(lote =>
            lote.codigo.trim().toLowerCase() !== 'xxx' &&
            lote.numeroLote.trim().toLowerCase() !== 'xxx'
          )
          .map(lote => {
            lote.dataEntrada = new Date(lote.dataEntrada);
            return lote;
          });

        // Combina dados
        this.combinedData = [
          ...this.vendas.map(venda => ({
            ...venda,
            data: venda.dataVenda,
            tipo: 'dataVenda'
          })),
          ...this.lotes.map(lote => ({
            ...lote,
            data: lote.dataEntrada,
            tipo: 'dataEntrada'
          }))
        ];

        // ✅ Etapa de carregamento de nomes única
        this.carregarNomesUsuarios();

        // Ordena por data
        this.combinedData.sort((a, b) => b.data.getTime() - a.data.getTime());
        this.originalCombinedData = [...this.combinedData];
        this.dadosOriginais = [...this.combinedData];
        this.dadosFiltrados = [...this.combinedData];
        // Total geral de vendas (saídas)
        this.totalVendidoGeral = this.dadosOriginais
          .filter(x => x.tipo === 'dataVenda')
          .reduce((sum, item) => sum + (item.quantidade || 0), 0);

        // Total geral de entradas
        this.totalEntradaGeral = this.dadosOriginais
          .filter(x => x.tipo === 'dataEntrada')
          .reduce((sum, item) => sum + (item.qtdEntrada || item.quantidade || 0), 0);

        // Inicia os filtrados com o mesmo valor
        this.totalVendidoFiltrado = this.totalVendidoGeral;
        this.totalEntradaFiltrada = this.totalEntradaGeral;

      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
    });
  }
  carregarNomesUsuarios(): void {
    const uniqueIds = Array.from(new Set(
      this.combinedData.map(item => Number(item.usuarioId)).filter(id => !isNaN(id))
    ));

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

      // Atribui nomes
      this.combinedData.forEach(item => {
        item.nome = nomeMap.get(Number(item.usuarioId)) || 'Desconhecido';
      });
    });
  }

atualizarTotaisFiltrados() {
  this.totalVendidoFiltrado = this.dadosFiltrados
    .filter(x => x.tipo === 'dataVenda')
    .reduce((sum, item) => sum + (item.quantidade || 0), 0);

  this.totalEntradaFiltrada = this.dadosFiltrados
    .filter(x => x.tipo === 'dataEntrada')
    .reduce((sum, item) => sum + (item.qtdEntrada || item.quantidade || 0), 0);
}


  limparPesquisa() {
    this.expression = '';
    this.filtrarProdutos(); // Chama filtro com campo limpo
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
    this.atualizarTotaisFiltrados();
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


  filterData(): void {


    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      end.setDate(end.getDate() + 1);

      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/venda`).subscribe({
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
      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/${produto.id}/lotes`)
        .subscribe((lotesData) => {
          produto.lotes = Array.isArray(lotesData) ? lotesData : []; // Garante que lotesData seja um array

        }, (error) => {
          console.error('Erro ao carregar os lotes:', error);
        });
    }
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
      this.dadosFiltrados = this.originalCombinedData.filter(item => {
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
      this.dadosFiltrados.sort((a, b) => b.data.getTime() - a.data.getTime());
      this.atualizarTotaisFiltrados();

    }
  }
  filtrarPisoData(): void {
    const termo = this.expression.toLowerCase().trim();
    const inicio = this.dataVendaInicio;
    const fim = this.dataVendaFim;

    this.dadosFiltrados = this.dadosOriginais.filter(item => {

      // 🔵 1. FILTRAR POR TIPO (entrada/saída)
      if (this.filtroEntrada && item.tipo !== 'dataEntrada') return false;
      if (this.filtroSaida && item.tipo !== 'dataVenda') return false;

      // 🟡 2. FILTRAR POR TEXTO
      if (termo) {
        const contemTexto = Object.values(item).some(v =>
          v && v.toString().toLowerCase().includes(termo)
        );
        if (!contemTexto) return false;
      }

      // 🔴 3. FILTRAR POR DATA
      const data = item.data ? item.data.toISOString().slice(0, 10) : '';

      if (inicio && data < inicio) return false;
      if (fim && data > fim) return false;

      return true;
    });
   this.atualizarTotaisFiltrados();

    // Ordena por data DESC
    this.dadosFiltrados.sort((a, b) => b.data - a.data);

    this.p = 1;
  }

}
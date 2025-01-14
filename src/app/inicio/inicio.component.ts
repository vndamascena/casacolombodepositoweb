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
  entregasDoDia: number = 0;
  entregasDiaSemana: number = 0;
  ocorrenciasC: number = 0;
  quantidadeVendidaHoje: number = 0;
  titulosAReceber: number = 0;
  pisosRecentes: any[] = [];
  aniversariantes: { nome: string; dataNascimento: string }[] = [];
  proximoAniversariante: { nome: string; dataNascimento: string } | null = null;
  
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
    this.carregarEntregasDoDia();
    this.carregarOcorrencias();
    this.carregarVendasDoDia();
    this.carregarTitulosAReceber(); 
    this.carregarPisosRecentes();
    this.buscarAniversariantes();



  }
  buscarAniversariantes(): void {
    const endpoint = 'https://colombo01-001-site2.gtempurl.com/api/usuarios/getall';
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth() + 1;

    this.httpClient.get<{ nome: string; dataNascimento: string | null }[]>(endpoint).subscribe(
      (data) => {
        this.aniversariantes = data
          .filter(user => user.dataNascimento)
          .map(user => ({ ...user, dataNascimento: user.dataNascimento! }))
          .filter(user => {
            const [, mes] = user.dataNascimento.split('-').map(Number);
            return mes === hojeMes;
          })
          .sort((a, b) => {
            const [diaA] = a.dataNascimento.split('-').map(Number);
            const [diaB] = b.dataNascimento.split('-').map(Number);
            return diaA - diaB; // Ordena pelo dia
          });

        // Encontra o PRÓXIMO aniversariante
        this.proximoAniversariante = this.aniversariantes.find(user => {
          const [dia] = user.dataNascimento.split('-').map(Number);
          return dia >= hojeDia; // Verifica se o dia é igual ou posterior ao dia atual
        }) || (this.aniversariantes.length > 0 ? this.aniversariantes[0] : null); // Se não encontrar nenhum posterior, pega o primeiro da lista (para o próximo mês, se for o caso)

      },
      (error) => {
        console.error('Erro ao buscar aniversariantes:', error);
      }
    );
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



  carregarEntregasDoDia(): void {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega`)
      .subscribe((data) => {
        const hoje = new Date().toISOString().split('T')[0]; // Data de hoje no formato yyyy-MM-dd
        const diaSemanaAtual = this.obterDiaSemana(new Date()); // Dia da semana em português

        // Filtrar entregas para a data atual
        const entregasHoje = data.filter((entrega) => entrega.dataEntrega === hoje);

        // Filtrar entregas para o dia da semana atual
        const entregasDiaSemana = data.filter((entrega) => entrega.diaSemana === diaSemanaAtual);

        // Contar entregas únicas por cliente na data atual
        this.entregasDoDia = this.contarEntregasPorCliente(entregasHoje).length;

        // Contar entregas únicas por cliente no dia da semana atual
        this.entregasDiaSemana = this.contarEntregasPorCliente(entregasDiaSemana).length;
      }, error => {
        console.error('Erro ao carregar entregas:', error);
      });
  }


  obterDiaSemana(data: Date): string {
    const diasSemana = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    return diasSemana[data.getDay()];
  }

  contarEntregasPorCliente(entregas: any[]): any[] {
    const clientesContabilizados: { [key: string]: boolean } = {};
    const entregasUnicas: any[] = [];

    entregas.forEach(entrega => {
      if (!clientesContabilizados[entrega.nomeCliente]) {
        clientesContabilizados[entrega.nomeCliente] = true;
        entregasUnicas.push(entrega);
      }
    });

    return entregasUnicas;
  }
  carregarOcorrencias(): void {
    this.httpClient.get<any[]>(`${environment.ocorrencApi}/ocorrencia`)
      .subscribe((data) => {
        this.ocorrenciasC = data.length; // Total de ocorrências
      }, error => {
        console.error('Erro ao carregar ocorrências:', error);
      });
  }


  carregarVendasDoDia(): void {
    this.httpClient.get<any[]>(`${environment.apiUrl}/produtoPiso/venda`)
      .subscribe((data) => {
        const hoje = new Date().toISOString().split('T')[0]; // Data de hoje no formato yyyy-MM-dd

        // Filtrar vendas do dia atual e calcular a quantidade total vendida
        this.quantidadeVendidaHoje = data
          .filter(venda => venda.dataVenda.startsWith(hoje)) // Filtrar por data
          .reduce((total, venda) => total + venda.quantidade, 0); // Somar as quantidades
      }, error => {
        console.error('Erro ao carregar vendas do dia:', error);
      });


  }

  carregarTitulosAReceber(): void {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/tituloreceber`)
      .subscribe((data) => {
        this.titulosAReceber = data.length; // Contar a quantidade de títulos a receber
      }, error => {
        console.error('Erro ao carregar títulos a receber:', error);
      });
  }


  carregarPisosRecentes(): void {
    const endpoint = `${environment.apiUrl}/produtoPiso/lotes`;
  
    this.httpClient.get<any[]>(endpoint).subscribe({
      next: (lotesData) => {
        // Filtrar lotes válidos (não "xxx")
        const lotesValidos = lotesData.filter(lote => {
          const isNotXXX = lote.codigo.trim().toLowerCase() !== 'xxx' && lote.numeroLote.trim().toLowerCase() !== 'xxx';
          console.log('Filtrando lote:', lote.codigo, lote.numeroLote, 'isNotXXX:', isNotXXX);
          return isNotXXX;
        });
  
        
        const ultimaData = lotesValidos.reduce((maisRecente, lote) => {
          const dataEntrada = new Date(lote.dataEntrada);
          return dataEntrada > maisRecente ? dataEntrada : maisRecente;
        }, new Date(0)); 
  
        console.log('Última data de entrada identificada:', ultimaData);
  
       
        this.pisosRecentes = lotesValidos
          .filter(lote => {
            const dataEntrada = new Date(lote.dataEntrada);
            return dataEntrada.toDateString() === ultimaData.toDateString(); 
          })
          .map(lote => ({
            nomeProduto: lote.nomeProduto,
            qtdEntrada: lote.qtdEntrada,
            dataEntrada: new Date(lote.dataEntrada) 
          }))
          .sort((a, b) => b.dataEntrada.getTime() - a.dataEntrada.getTime()); 
  
        console.log('Pisos recentes filtrados e ordenados:', this.pisosRecentes);
      },
      error: (err) => {
        console.error('Erro ao carregar pisos:', err);
      }
    });
  }
  

}



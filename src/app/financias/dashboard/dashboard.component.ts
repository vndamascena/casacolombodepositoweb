import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
declare var bootstrap: any;
import { CountUpModule } from 'ngx-countup';
import { CountUpOptions } from 'countup.js';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
interface LinhaTabelaCategoria {
  mes: string;
  valores: { [key: string]: number };
  maiorCategoria?: string; // ⭐
}
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
declare var bootstrap: any;




@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule, CountUpModule,],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {


  listaResumoFormaPag: any[] = [];
  totalResumoFormaPag = 0;
  formaPagModal = '';
  mesResumoModal = '';


  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  compras: any[] = [];
  cobranca: any[] = [];
  cobrancasProximoVencimento: any[] = [];
  cobrancasPagasNoMes: any[] = [];
  cobrancasPagasNoDia: any[] = [];
  cobrancasVencidasNoDia: any[] = [];
  cobrancasSemPagamentos: any[] = [];
  cobrancasTotal: any[] = [];
  fornecedor: any[] = [];
  filteredFornecedores: any[] = [];
  mensagem: string | null = null;
  mensagemErro: string | null = null;
  devePerguntarCobranca = false;
  ultimaCompra: any = null;
  cobrancaJaInicializada = false;
  tipoFornec: string[] = ['DISTRIBUIDOR', 'FABRICA', 'DIST / FABR', 'TRANSPORTADORA'];
  formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  formaPagDespesa: string[] = ['BOLETO', 'CARTÃO DE CREDITO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  tipoDespesa: string[] = ['COMBUSTÍVEL', 'CONTABILIDADE', 'DESINFETANTE E CLORO', 'INSUMOS', 'MECÂNICA', 'MERCADO', 'OBRA', 'REFEIÇÃO', 'SACOLAS', 'TRABALHO EXTRA', 'OUTROS',]
  selectedFornecedor: any = null;
  selectedEmpresaFrete: any = null;
  qtdCobrancasVencidas: number = 0;
  qtdCobrancasSemPagamento: number = 0;
  qtdCobrancasProximoVencimento: number = 0; qtdCobrancasPagasNoMes: number = 0; // NOVA
  qtdCobrancasPagasNoDia: number = 0;
  qtdCobrancasVencidasNoDia: number = 0;
  qtdCobrancasAVencer: number = 0;
  totalValorCobrVencidas: number = 0;
  totalValorPagoVencidas: number = 0;
  totalValorCobrProximo: number = 0;
  totalValorPagoProximo: number = 0;
  totalValorCobrVencidasDia: number = 0;
  totalValorPagoVencidasDia: number = 0;
  totalValorCobrAVencer: number = 0;
  totalValorPagoAVencer: number = 0;
  totalValorCobrSemPagamento: number = 0;
  totalValorPagoSemPagamento: number = 0;
  totalValorCobrPagasMes: number = 0;
  totalValorPagoPagasMes: number = 0;
  totalValorCobrPagasDia: number = 0;
  totalValorCobranca: number = 0;
  totalValorPagoPagasDia: number = 0;
  totalValorCobrVencidasFloat: number = 0;
  totalValorCobrProximoFloat: number = 0;
  totalValorCobrVencidasDiaFloat: number = 0;
  totalValorCobrAVencerFloat: number = 0;
  totalValorCobrSemPagamentoFloat: number = 0;
  totalValorCobrPagasMesFloat: number = 0;
  totalValorCobrPagasDiaFloat: number = 0;
  qtdTotalCobrancasFloat: number = 0;
  qtdTotalCobrancas: number = 0;
  totalCobrancasFloat: number = 0;
  cobrancasAVencer: any[] = [];
  isDarkMode: boolean = false; // Estado do Dark Mode
  cobrancasCalendario: any[] = []; // Para o calendário
  cobrancasProximaSemana: any[] = [];
  qtdCobrancasProximaSemana: number = 0;
  totalValorCobrProxSemanaFloat: number = 0;
  totalValorCobrProxSemana: string = '';
  cobrancasPagasSemana: any[] = [];
  qtdCobrancasPagasSemana: number = 0;
  totalValorCobrPagasSemanaFloat: number = 0;
  totalValorCobrPagasSemana: string = '';
  chartConsolidado: any;
  dadosGrafico: any[] = [];
  diasDoMes: any[] = [];
  semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  mesAtual: number = 0;
  anoAtual: number = 0;
  nomeMes: string = '';
  allDespesasLoja: any[] = [];
  tooltipHtml: SafeHtml = '';
  totalMesPago = 0;
  totalMesAberto = 0;
  totalMesGeral = 0;
  private weekStart = 0;
  totalGeralPago = 0;
  totalGeralAberto = 0;
  totalGeral = 0;
  rankingMes: any[] = [];
  categoriasFixas = [
    "Administrativo",
    "Funcionamento",
    "Funcionários",
    'Imóveis',
    "Logística",
    "Custo Venda",
    "Outros",

    "Total"
  ].sort();

  categoriaAlias: { [key: string]: string } = {
    'ADMINISTRATIVOS': 'Administrativo',
    'IMÓVEIS': 'Imóveis',
    'FUNCIONÁRIOS': 'Funcionários',
    'LOGÍSTICA': 'Logística',
    'FUNCIONAMENTO': 'Funcionamento',
    'CUSTOS DE VENDA': 'Custo Venda',
    'OUTROS': 'Outros'

  };

  tabelaCategoriasAno: LinhaTabelaCategoria[] = [];
  formasPagamento = [
    'DINHEIRO',
    'CHEQUE',
    'BOLETO',
    'TRANSFERÊNCIA',
    'CARTÃO',
    'C/ NOTA',
    'S/ NOTA'
  ];

  tabelaFormaPagAno: any[] = [];


  totalPorFormaPag: any = {};
  mediaPorFormaPag: any = {};


  mediaGeralMensal = 0;
  mediaTotalGeral = 0;

  listaDespesasFiltradas: any[] = [];
  totalModal = 0;
  categoriaModal = '';
  mesModal = '';
  despesasModal: any;
  clickedCell: { categoria: string, mes: string } | null = null;
  totalAnual: number = 0;
  mediaAnual: number = 0;

  comprasTotalQtd: number = 0;
  comprasTotalValor: string = "R$ 0,00";


  comprasMesQtd: number = 0;
  comprasMesValor: string = "R$ 0,00";


  comprasSemanaQtd: number = 0;
  comprasSemanaValor: string = "R$ 0,00";


  comprasDiaQtd: number = 0;
  comprasDiaValor: string = "R$ 0,00";


  comprasSemCobrancaQtd: number = 0;
  comprasSemCobrancaValor: string = "R$ 0,00";

  comprasManuaisQtd: number = 0;
  comprasManuaisValor: string = "R$ 0,00";


  rankingFornecedor: { nome: string; total: number }[] = [];
  rankingLoja: { nome: string; total: number }[] = [];

  comprasTotalValorFloat: number = 0;
  comprasMesValorFloat: number = 0;
  comprasSemanaValorFloat: number = 0;
  comprasDiaValorFloat: number = 0;
  comprasSemCobrancaValorFloat: number = 0;
  comprasManuaisValorFloat: number = 0;
  // ANO
  comprasAnoAtualQtd!: number;
  comprasAnoAtualValor!: string;
  comprasAnoAtualValorFloat!: number;

  comprasAnoAnteriorQtd!: number;
  comprasAnoAnteriorValor!: string;
  comprasAnoAnteriorValorFloat!: number;

  // MÊS
  comprasMesAnteriorQtd!: number;
  comprasMesAnteriorValor!: string;
  comprasMesAnteriorValorFloat!: number;

  // SEMANA
  comprasSemanaPassadaQtd!: number;
  comprasSemanaPassadaValor!: string;
  comprasSemanaPassadaValorFloat!: number;

  // RANK FORNECEDOR
  rankFornecedorAno: any[] = [];
  rankFornecedorMes: any[] = [];
  tipoSelecionado: 'compras' | 'cobrancas' = 'compras';

  resumoCompras = [];
  resumoCobrancas = [];

  mediaPercentualAnual: number = 0;




  countUpOptions: CountUpOptions = {
    duration: 1.5,
    separator: '.',
    decimal: ',',
    prefix: 'R$ ',
    decimalPlaces: 2,
  };


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer

  ) { }

  formCompras: FormGroup = this.formBuilder.group({

    idForn: ['', Validators.required],
    idEmpFrete: [''],
    numNF: [''],
    numNota: [''],
    formaPag: [''],
    formaPagFrete: [''],
    obs: [''],
    valorNF: [''],
    valorCompra: [''],
    valorFrete: [''],
    valorOutro: [''],
    loja: [''],
    dataNota: [''],
    dataEntrega: [''],


  });
  formFornecedor: FormGroup = this.formBuilder.group({

    empresa: ['', Validators.required],
    cnpj: [''],
    endereco: [''],
    telefone: [''],
    fornecedo: [''],
    tipoFornecedor: [''],
    vendedor: [''],
    teleVendedor: [''],
    obs: ['']

  });
  formDespesas: FormGroup = this.formBuilder.group({

    nomeLocal: ['', Validators.required],
    nomeDespesa: [''],
    quantidade: [''],
    observacao: [''],
    valor: [''],
    dataCompra: [''],
    formaPagamento: [''],
    loja: [''],


  });
  formCobrancas: FormGroup = this.formBuilder.group({


    cobrancas: this.formBuilder.array([])


  });


  adicionarCobranca(): void {
    let dadosBase: any = {
      idForn: '',
      idCompra: '',
      tipoCobr: '',
      numCobr: '',
      numNota: '',
      numNF: '',
      conta: '',
      formaPag: '',
      obs: '',
      parcela: '1',
      qtdParc: '',
      valorPago: '',
      valorCobr: '',
      dataVenc: '',
      dataPag: '',
      loja: '',
      valorFrete: '',
      valorCompra: ''
    };

    if (this.cobrancas.length > 0) {
      const ultima = this.cobrancas.at(this.cobrancas.length - 1).value;

      dadosBase = {
        ...ultima,
        valorCobr: this.converterRealParaDecimal(ultima.valorCobr),
        valorFrete: this.converterRealParaDecimal(ultima.valorFrete),
        valorCompra: this.converterRealParaDecimal(ultima.valorCompra),
      };

      const [num, total] = (ultima.parcela || '1');
      const novoNumero = +num + 1;
      const novoTotal = total || '1';

      dadosBase.parcela = `${novoNumero}`;
    }


    const novaCobranca = this.formBuilder.group({
      idForn: [dadosBase.idForn, Validators.required],
      idCompra: [dadosBase.idCompra, Validators.required],
      tipoCobr: [dadosBase.tipoCobr],
      numCobr: [dadosBase.numCobr],
      numNota: [dadosBase.numNota],
      numNF: [dadosBase.numNF],
      conta: [dadosBase.conta],
      formaPag: [dadosBase.formaPag],
      obs: [dadosBase.obs],
      parcela: [dadosBase.parcela],
      qtdParc: [dadosBase],
      loja: [dadosBase.loja],
      valorPago: [dadosBase.valorPago],
      valorCobr: [this.formatarDecimalParaReal(dadosBase.valorCobr)],
      dataVenc: [Validators.required],
      dataPag: [dadosBase.dataPag],

      valorFrete: [this.formatarDecimalParaReal(dadosBase.valorFrete)],
      valorCompra: [this.formatarDecimalParaReal(dadosBase.valorCompra)],
    });

    novaCobranca.get('idCompra')?.valueChanges.subscribe(id => {
      if (!id) {
        novaCobranca.patchValue({
          idForn: '',
          loja: '',
          valorFrete: '',
          valorCompra: '',
          numNota: '',
          numNF: ''
        });
        return;
      }

      const compra = this.compras.find(c => c.id == id); // usa == para comparar string e número

      if (compra) {
        novaCobranca.patchValue({
          idForn: compra.idForn,
          loja: compra.loja,
          valorFrete: this.formatarDecimalParaReal(compra.valorFrete),
          valorCompra: this.formatarDecimalParaReal(compra.valorCompra),
          numNota: compra.numNota,
          numNF: compra.numNF
        });
      } else {
        // Se não encontrar, limpa os campos
        novaCobranca.patchValue({
          idForn: '',
          loja: '',
          valorFrete: '',
          valorCompra: '',
          numNota: '',
          numNF: ''
        });
      }
    });


    this.cobrancas.push(novaCobranca);

    const totalParcelas = this.cobrancas.length;
    this.cobrancas.controls.forEach((grupo, index) => {
      grupo.get('qtdParc')?.setValue(totalParcelas.toString());

    });

  }
  filterFornecedores(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm.length > 0) {
      this.filteredFornecedores = this.fornecedor.filter(f =>
        f.fornecedo.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredFornecedores = [...this.fornecedor]; // Show all if input is empty
    }
  }
  onGenericFornecedorInput(event: any, campo: 'idForn' | 'idEmpFrete') {
    const nome = event.target.value;
    const fornecedor = this.fornecedor.find(f => f.fornecedo === nome);

    if (fornecedor) {
      this.formCompras.patchValue({ [campo]: fornecedor.id });

      if (campo === 'idForn') {
        this.selectedFornecedor = fornecedor;
      } else if (campo === 'idEmpFrete') {
        this.selectedEmpresaFrete = fornecedor;
      }

      console.log(`🆔 ${campo} capturado:`, fornecedor);
    } else {
      this.formCompras.patchValue({ [campo]: null });

      if (campo === 'idForn') {
        this.selectedFornecedor = null;
      } else if (campo === 'idEmpFrete') {
        this.selectedEmpresaFrete = null;
      }
    }
  }
  formatarCNPJ(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length > 14) valor = valor.slice(0, 14);

    let cnpjFormatado = valor;

    if (valor.length > 12) {
      cnpjFormatado = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (valor.length > 8) {
      cnpjFormatado = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    } else if (valor.length > 5) {
      cnpjFormatado = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (valor.length > 2) {
      cnpjFormatado = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    }

    this.formFornecedor.get('cnpj')?.setValue(cnpjFormatado, { emitEvent: false });
  }

  formatarTelefone(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    let formatado = valor;

    if (valor.length > 10) {
      formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
      formatado = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      formatado = valor.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    }

    this.formFornecedor.get('telefone')?.setValue(formatado, { emitEvent: false });
  }
  formatarTelefoneVendedor(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    let formatado = valor;

    if (valor.length > 10) {
      formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
      formatado = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      formatado = valor.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    }

    this.formFornecedor.get('teleVendedor')?.setValue(formatado, { emitEvent: false });
  }

  confirmarCriarCobranca(): void {
    if (!this.ultimaCompra) return;

    this.cobrancas.clear();

    const novaCobranca = this.formBuilder.group({
      idForn: [this.ultimaCompra.idForn, Validators.required],
      idCompra: [this.ultimaCompra.id, Validators.required],
      tipoCobr: [''],
      numCobr: [''],
      numNota: [this.ultimaCompra.numNota],
      numNF: [this.ultimaCompra.numNF],
      conta: [''],
      formaPag: [''],
      obs: [''],
      parcela: ['1'],
      qtdParc: [''],
      valorPago: [''],
      valorCobr: [this.formatarDecimalParaReal(this.ultimaCompra.valorCobr)],
      dataVenc: [''],
      dataPag: [''],
      loja: [this.ultimaCompra.loja],
      valorFrete: [this.formatarDecimalParaReal(this.ultimaCompra.valorFrete)],
      valorCompra: [this.formatarDecimalParaReal(this.ultimaCompra.valorCompra)],
    });

    console.log('🧾 Cobranca criada no form:', novaCobranca.value);

    this.cobrancas.push(novaCobranca);

    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarCobranca'));
    confirmModal?.hide();

    const modalCobranca = new bootstrap.Modal(document.getElementById('cadastrarCobrancas'));
    modalCobranca.show();
  }



  get cobrancas() {
    return this.formCobrancas.get('cobrancas') as FormArray;
  }



  get c(): any {
    return this.formCompras.controls;
  }
  get cb(): any {
    return this.formCobrancas.controls;
  }
  get f(): any {
    return this.formFornecedor.controls;
  }
  ngOnInit(): void {
    const hoje = new Date();
    this.mesAtual = hoje.getMonth();
    this.anoAtual = hoje.getFullYear();
    this.httpClient.get(environment.financa + "/compras")
      .subscribe({
        next: (data) => {
          this.compras = data as any[];
          console.log('📦 Compras carregadas:', this.compras);
          const modalComprasEl = document.getElementById('cadastrarCompras');
          if (modalComprasEl) {
            modalComprasEl.addEventListener('hidden.bs.modal', () => {
              this.limparFormCompras();
            });
          }


        },
        error: (e) => {
          console.log(e.error);
        }
      });
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.carregarDadosCobrancas();
    this.carregarDespesas();
    this.carregarDadosCompras();




    this.httpClient.get(environment.financa + "/fornecedor")
      .subscribe({
        next: (data) => {

          this.fornecedor = data as any[];
          const modalFornecedorEl = document.getElementById('cadastrarFornecedor');
          this.fornecedor = (data as any[]).sort((a, b) => {
            return a.fornecedo.localeCompare(b.fornecedo);
          });
          if (modalFornecedorEl) {
            modalFornecedorEl.addEventListener('hidden.bs.modal', () => {
              this.limparFormFornecedor();
            });
          }
        },
        error: (e) => {
          console.log(e.error);
        }
      });


  }
  private parseCurrencyToFloat(valor: string | number): number {
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const cleaned = valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    if (this.dadosGrafico.length > 0) {
      this.renderCharts(this.dadosGrafico);
    }
  }





  isVencida(dataVenc: string): boolean {
    return normalizarDataLocal(new Date(dataVenc)) < normalizarDataLocal(new Date());
  }




  isProximoVencimento(dataVenc: string): boolean {
    const hoje = normalizarDataLocal(new Date());
    const dataVencimento = normalizarDataLocal(new Date(dataVenc));
    const dataLimite = new Date(hoje);
    dataLimite.setDate(hoje.getDate() + 5);
    return dataVencimento > hoje && dataVencimento <= dataLimite;
  }
  private renderCharts(cobrancas: any[]): void {
    this.dadosGrafico = cobrancas;
    if (!cobrancas || cobrancas.length === 0) return;

    // 💣 Destroi gráfico anterior antes de redesenhar
    if (this.chartConsolidado) {
      this.chartConsolidado.destroy();
    }

    const isDark = this.isDarkMode;

    const CORES_LOJAS = [
      '#08600e', '#7ED321', '#06787a', '#131bfe', '#6c1805',
      '#50E3C2', '#B8E986', '#F8E71C', '#596781', '#FF69B4'
    ];

    const tiposCobranca = new Set<string>();
    const lojas = new Set<string>();
    const statsPorTipoLoja: Record<string, Record<string, number>> = {};

    cobrancas.forEach(c => {
      const tipo = c.tipoCobr || 'OUTROS';
      const loja = c.loja || 'SEM LOJA';
      const valor = Number(c.valorCobr) || 0;

      tiposCobranca.add(tipo);
      lojas.add(loja);

      if (!statsPorTipoLoja[tipo]) statsPorTipoLoja[tipo] = {};
      statsPorTipoLoja[tipo][loja] = (statsPorTipoLoja[tipo][loja] || 0) + valor;
    });

    const arrayTipos = Array.from(tiposCobranca);
    const ordemDesejada = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA'];
    const arrayLojas = ordemDesejada.filter(loja => lojas.has(loja));

    const datasets = arrayLojas.map((loja, i) => ({
      label: loja,
      data: arrayTipos.map(tipo => statsPorTipoLoja[tipo]?.[loja] || 0),
      backgroundColor: CORES_LOJAS[i % CORES_LOJAS.length],
      borderWidth: 1
    }));

    const totaisPorTipo = arrayTipos.map(
      tipo => Object.values(statsPorTipoLoja[tipo] || {}).reduce((a, b) => a + b, 0)
    );

    const pluginTotais = {
      id: 'pluginTotais',
      afterDatasetsDraw(chart: any) {
        const { ctx, scales } = chart;
        const xScale = scales.x;
        const isDark = chart.config.options.scales.x.ticks.color === '#fff';

        ctx.save();
        ctx.font = '600 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isDark ? '#FFD700' : '#333'; // dourado no dark, escuro no claro
        ctx.shadowColor = isDark ? '#000' : '#ccc';
        ctx.shadowBlur = 2;

        arrayTipos.forEach((tipo, i) => {
          const x = xScale.getPixelForTick(i); // posição horizontal da label
          const total = totaisPorTipo[i];
          const textoTotal = total
            ? `R$ ${total.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
            : '';


          const yLabel = xScale.bottom;
          ctx.fillText(textoTotal, x, yLabel);
        });

        ctx.restore();
      }
    };


    this.chartConsolidado = new Chart('chartConsolidado', {
      type: 'bar',
      data: {
        labels: arrayTipos,
        datasets
      },
      options: {
        responsive: true,
        layout: {
          padding: {
            bottom: 35
          }
        },
        scales: {
          x: {
            ticks: { color: isDark ? '#fff' : '#000' },
            grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 300000,
            ticks: { color: isDark ? '#fff' : '#000' },
            grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: isDark ? '#fff' : '#000' }
          },
          tooltip: {
            backgroundColor: isDark ? '#333' : '#fff',
            titleColor: isDark ? '#fff' : '#000',
            bodyColor: isDark ? '#FFD700' : '#000',
            borderColor: isDark ? '#555' : '#ccc',
            titleFont: { weight: 'bold', size: 16 }, // 🔹 título maior
            bodyFont: { weight: 'bold', size: 15 },  // 🔹 texto principal maior
            padding: 12, // 🔹 mais espaço interno
            cornerRadius: 8, // 🔹 tooltip mais bonito
            borderWidth: 1
          }
        }
      },
      plugins: [pluginTotais]
    });
  }




  somar(lista: any[], campo: string) {
    return lista.reduce((s, v) => s + (parseFloat(v[campo]) || 0), 0);
  }

  formatarBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  ranking(lista: any[], campo: string, valor: string) {
    const mapa: Record<string, number> = {};

    lista.forEach(c => {
      const chave = c[campo] ?? "0";
      mapa[chave] = (mapa[chave] || 0) + (parseFloat(c[valor]) || 0);
    });

    return Object.entries(mapa)
      .map(([id, total]) => ({ id: Number(id), total }))
      .sort((a, b) => b.total - a.total);
  }


  getNomeFornecedor(id: number): string {
    const f = this.fornecedor.find(x => x.id === id);
    return f ? f.fornecedo || f.fornecedo : "N/D";
  }



  carregarDadosCompras(): void {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const anoAnterior = ano - 1;

  const mes = hoje.getMonth(); // 0–11
  const mesAnterior = mes === 0 ? 11 : mes - 1;

  // Semana atual
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  // Semana passada
  const inicioSemanaPassada = new Date(inicioSemana);
  inicioSemanaPassada.setDate(inicioSemana.getDate() - 7);

  const fimSemanaPassada = new Date(inicioSemanaPassada);
  fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6);
  fimSemanaPassada.setHours(23, 59, 59, 999);

  this.httpClient.get<any[]>(environment.financa + "/compras")
    .subscribe({
      next: (data: any[]) => {
        this.compras = data;

        // =======================
        // ANO ATUAL
        // =======================
        const anoAtualData = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          return d && d.getFullYear() === ano;
        });

        this.comprasAnoAtualQtd = anoAtualData.length;
        this.comprasAnoAtualValorFloat = this.somar(anoAtualData, 'valorCompra');
        this.comprasAnoAtualValor = this.formatarBRL(this.comprasAnoAtualValorFloat);

        // =======================
        // ANO ANTERIOR
        // =======================
        const anoAnteriorData = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          return d && d.getFullYear() === anoAnterior;
        });

        this.comprasAnoAnteriorQtd = anoAnteriorData.length;
        this.comprasAnoAnteriorValorFloat = this.somar(anoAnteriorData, 'valorCompra');
        this.comprasAnoAnteriorValor = this.formatarBRL(this.comprasAnoAnteriorValorFloat);

        // =======================
        // MÊS ATUAL
        // =======================
        const mesAtualData = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          return d && d.getFullYear() === ano && d.getMonth() === mes;
        });

        this.comprasMesQtd = mesAtualData.length;
        this.comprasMesValorFloat = this.somar(mesAtualData, 'valorCompra');
        this.comprasMesValor = this.formatarBRL(this.comprasMesValorFloat);

        // =======================
        // MÊS ANTERIOR
        // =======================
        const mesAnteriorData = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          if (!d) return false;

          return (
            (d.getFullYear() === ano && d.getMonth() === mesAnterior) ||
            (mes === 0 && d.getFullYear() === anoAnterior && d.getMonth() === 11)
          );
        });

        this.comprasMesAnteriorQtd = mesAnteriorData.length;
        this.comprasMesAnteriorValorFloat = this.somar(mesAnteriorData, 'valorCompra');
        this.comprasMesAnteriorValor = this.formatarBRL(this.comprasMesAnteriorValorFloat);

        // =======================
        // SEMANA ATUAL
        // =======================
        const semanaAtual = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          return d && d >= inicioSemana && d <= fimSemana;
        });

        this.comprasSemanaQtd = semanaAtual.length;
        this.comprasSemanaValorFloat = this.somar(semanaAtual, 'valorCompra');
        this.comprasSemanaValor = this.formatarBRL(this.comprasSemanaValorFloat);

        // =======================
        // SEMANA PASSADA
        // =======================
        const semanaPassada = data.filter(c => {
          const d = this.getDataBaseCompra(c);
          return d && d >= inicioSemanaPassada && d <= fimSemanaPassada;
        });

        this.comprasSemanaPassadaQtd = semanaPassada.length;
        this.comprasSemanaPassadaValorFloat = this.somar(semanaPassada, 'valorCompra');
        this.comprasSemanaPassadaValor = this.formatarBRL(this.comprasSemanaPassadaValorFloat);

        // =======================
        // SEM COBRANÇA
        // =======================
        const semCobranca = data.filter(c =>
          (c.formaPag || '').toUpperCase() === 'SEM COBRANÇA'
        );

        this.comprasSemCobrancaQtd = semCobranca.length;
        this.comprasSemCobrancaValorFloat = this.somar(semCobranca, 'valorCompra');
        this.comprasSemCobrancaValor = this.formatarBRL(this.comprasSemCobrancaValorFloat);

        // =======================
        // MANUAIS
        // =======================
        const comprasManuais = data.filter(c =>
          ['DINHEIRO', 'CHEQUE', 'TRANSFERENCIA', 'TRANSFERÊNCIA']
            .includes((c.formaPag || '').toUpperCase())
        );

        this.comprasManuaisQtd = comprasManuais.length;
        this.comprasManuaisValorFloat = this.somar(comprasManuais, 'valorCompra');
        this.comprasManuaisValor = this.formatarBRL(this.comprasManuaisValorFloat);

        // =======================
        // RANKINGS
        // =======================
        const rankAno = this.ranking(anoAtualData, 'idForn', 'valorCompra');
        this.rankFornecedorAno = rankAno.slice(0, 3).map(r => ({
          ...r,
          nome: this.getNomeFornecedor(r.id)
        }));

        const rankMes = this.ranking(mesAtualData, 'idForn', 'valorCompra');
        this.rankFornecedorMes = rankMes.slice(0, 3).map(r => ({
          ...r,
          nome: this.getNomeFornecedor(r.id)
        }));
      }
    });
}




  carregarDadosCobrancas(): void {
    const hoje = normalizarDataLocal(new Date());

    // Semana atual (domingo → sábado)
    const inicioSemanaAtual = new Date(hoje);
    inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay());

    const fimSemanaAtual = new Date(inicioSemanaAtual);
    fimSemanaAtual.setDate(inicioSemanaAtual.getDate() + 6);

    // Próxima semana
    const inicioProxSemana = new Date(fimSemanaAtual);
    inicioProxSemana.setDate(fimSemanaAtual.getDate() + 1);

    const fimProxSemana = new Date(inicioProxSemana);
    fimProxSemana.setDate(inicioProxSemana.getDate() + 6);

    const formasIgnoradas = ['DINHEIRO', 'CHEQUE', 'TRANSFERÊNCIA'];

    this.httpClient.get(environment.financa + "/cobranca/ativo")
      .subscribe({
        next: (data) => {
          const cobrancasAtivas = data as any[];


          // 🔴 FILTRO 1: VENCIDAS
          this.cobranca = cobrancasAtivas.filter(c => {
            const venc = normalizarDataLocal(new Date(c.dataVenc));
            const tipo = (c.tipoCobr || '').toUpperCase();
            return venc < hoje && !formasIgnoradas.includes(tipo);
          });
          this.qtdCobrancasVencidas = this.cobranca.length;
          this.totalValorCobrVencidasFloat = this.parseCurrencyToFloat(this.cobranca.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrVencidas = this.cobranca.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

          // 🟡 FILTRO 2: PRÓXIMOS VENCIMENTOS (Semana atual - domingo a sábado)
          this.cobrancasProximoVencimento = cobrancasAtivas.filter((c) => {
            const venc = normalizarDataLocal(new Date(c.dataVenc));
            return venc >= inicioSemanaAtual && venc <= fimSemanaAtual;
          });
          this.qtdCobrancasProximoVencimento = this.cobrancasProximoVencimento.length;
          this.totalValorCobrProximoFloat = this.parseCurrencyToFloat(this.cobrancasProximoVencimento.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrProximo = this.cobrancasProximoVencimento.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

          // 🆕 FILTRO 3: COBRANÇAS DA PRÓXIMA SEMANA (domingo a sábado seguinte)
          this.cobrancasProximaSemana = cobrancasAtivas.filter((c) => {
            const venc = normalizarDataLocal(new Date(c.dataVenc));
            return venc >= inicioProxSemana && venc <= fimProxSemana;
          });
          this.qtdCobrancasProximaSemana = this.cobrancasProximaSemana.length;
          this.totalValorCobrProxSemanaFloat = this.parseCurrencyToFloat(this.cobrancasProximaSemana.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrProxSemana = this.cobrancasProximaSemana.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

          // 🔵 FILTRO 3: Vencidas no dia
          this.cobrancasVencidasNoDia = cobrancasAtivas.filter((cobranca: any) => {
            const dataVencimento = normalizarDataLocal(new Date(cobranca.dataVenc));
            return dataVencimento.getTime() === hoje.getTime();
          });
          this.qtdCobrancasVencidasNoDia = this.cobrancasVencidasNoDia.length;
          this.totalValorCobrVencidasDiaFloat = this.parseCurrencyToFloat(this.cobrancasVencidasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrVencidasDia = this.cobrancasVencidasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          // 🟢 FILTRO 4: A vencer
          this.cobrancasAVencer = cobrancasAtivas.filter((cobranca: any) => {
            const dataVencimento = normalizarDataLocal(new Date(cobranca.dataVenc));
            return dataVencimento > hoje && !cobranca.dataPag;
          });
          this.qtdCobrancasAVencer = this.cobrancasAVencer.length;
          this.totalValorCobrAVencerFloat = this.parseCurrencyToFloat(this.cobrancasAVencer.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrAVencer = this.cobrancasAVencer.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          // 🔶 FILTRO 5: VENCIDAS COM PAGAMENTO MANUAL
          this.cobrancasSemPagamentos = cobrancasAtivas.filter((cobranca: any) => {
            const dataVencimento = normalizarDataLocal(new Date(cobranca.dataVenc));
            const tipo = (cobranca.tipoCobr || '').toUpperCase();
            return (
              dataVencimento < hoje && // ⬅️ Só menores que hoje
              formasIgnoradas.includes(tipo)
            );
          });
          this.qtdCobrancasSemPagamento = this.cobrancasSemPagamentos.length;
          this.totalValorCobrSemPagamentoFloat = this.parseCurrencyToFloat(this.cobrancasSemPagamentos.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrSemPagamento = this.cobrancasSemPagamentos.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          // 🟢 FILTRO 6: Total Cobranca
          this.cobrancasTotal = cobrancasAtivas.filter((cobranca: any) => {
            const semPagamento = !cobranca.dataPag || cobranca.dataPag === '';
            return semPagamento;
          });
          this.qtdTotalCobrancas = this.cobrancasTotal.length;
          this.totalCobrancasFloat = this.parseCurrencyToFloat(this.cobrancasTotal.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobranca = this.cobrancasTotal.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


          const dataLimiteCalendario = new Date(hoje);
          dataLimiteCalendario.setDate(hoje.getDate() + 7);
          this.cobrancasCalendario = cobrancasAtivas.filter((cobranca: any) => {
            const dataVencimento = normalizarDataLocal(new Date(cobranca.dataVenc));
            return dataVencimento >= hoje && dataVencimento <= dataLimiteCalendario;
          }).sort((a, b) => new Date(a.dataVenc).getTime() - new Date(b.dataVenc).getTime());


          // Após o carregamento dos dados, renderize os gráficos
          this.renderCharts(cobrancasAtivas);

        },

        error: (e) => {
          console.log('Erro ao carregar cobranças ativas:', e.error);
        }
      });

    this.httpClient.get(environment.financa + "/Cobranca/inativo")
      .subscribe({
        next: (data) => {
          const cobrancasInativas = data as any[];

          // ✅ Cobranças pagas no mês
          this.cobrancasPagasNoMes = cobrancasInativas.filter(c => {
            if (!c.dataPag) return false;
            const pag = new Date(c.dataPag);
            return pag.getMonth() === hoje.getMonth() &&
              pag.getFullYear() === hoje.getFullYear();
          });
          this.qtdCobrancasPagasNoMes = this.cobrancasPagasNoMes.length;
          this.totalValorCobrPagasMesFloat = this.parseCurrencyToFloat(this.cobrancasPagasNoMes.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrPagasMes = this.cobrancasPagasNoMes.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          // ✅ Cobranças pagas no dia
          this.cobrancasPagasNoDia = cobrancasInativas.filter(c => {
            if (!c.dataPag) return false;
            const pag = normalizarDataLocal(new Date(c.dataPag));
            return pag.getTime() === hoje.getTime();
          });
          this.qtdCobrancasPagasNoDia = this.cobrancasPagasNoDia.length;
          this.totalValorCobrPagasDiaFloat = this.parseCurrencyToFloat(this.cobrancasPagasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0));
          this.totalValorCobrPagasDia = this.cobrancasPagasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          // ✅ Cobranças pagas na semana 
          this.cobrancasPagasSemana = cobrancasInativas.filter(c => {
            if (!c.dataPag) return false;
            const pag = normalizarDataLocal(new Date(c.dataPag));
            return pag >= inicioSemanaAtual && pag <= fimSemanaAtual;
          });
          this.qtdCobrancasPagasSemana = this.cobrancasPagasSemana.length;
          this.totalValorCobrPagasSemanaFloat = this.parseCurrencyToFloat(
            this.cobrancasPagasSemana.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0)
          );
          this.totalValorCobrPagasSemana = this.cobrancasPagasSemana
            .reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });





        },
        error: (e) => {
          console.log('Erro ao carregar cobranças inativas (pagas):', e.error);
        }
      });
  }




  limparFormCompras(): void {
    this.formCompras.patchValue({
      idForn: '',
      idEmpFrete: '',
      numNF: '',
      numNota: '',
      formaPag: '',
      formaPagFrete: '',
      obs: '',
      valorNF: '',
      valorFrete: '',
      valorCompra: '',
      loja: '',
      dataNota: null,
      dataEntrega: null
    });
  }
  limparFormFornecedor(): void {
    this.formFornecedor.patchValue({
      empresa: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      fornecedo: '',
      tipoFornecedor: '',
      vendedor: '',
      teleVendedor: ''
    });
  }


  abrirModalCobranca(): void {
    this.cobrancas.clear();
    this.adicionarCobranca();
  }
  formatarDecimalParaReal(valor: number | string): string {
    if (valor == null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '';
    return num.toFixed(2).replace('.', ',');
  }

  converterRealParaDecimal(valor: string): number | null {
    if (!valor) return null;
    const num = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }
  verificarCompraDuplicada(): boolean {
    const novaCompra = this.formCompras.value;

    const idForn = novaCompra.idForn;
    const numNota = novaCompra.numNota?.trim();
    const numNF = novaCompra.numNF?.trim();

    const duplicada = this.compras.find(c =>
      c.idForn === idForn &&
      (
        (c.numNota && c.numNota === numNota) ||
        (c.numNF && c.numNF === numNF) ||
        (c.numNota && c.numNF && c.numNota === numNota && c.numNF === numNF)
      )
    );

    if (duplicada) {
      console.warn("🚫 Compra duplicada detectada!", duplicada);
      this.mensagemErro = "Já existe uma compra com esse fornecedor e número de nota ou NF.";
      return true;
    }

    console.log("✅ Nenhuma duplicidade detectada.");
    return false;
  }

  CadastrarCompras(): void {


    if (this.verificarCompraDuplicada()) {
      return;
    }


    const formData = { ...this.formCompras.value };



    formData.valorNF = formData.valorNF ? parseFloat((formData.valorNF + '').replace(',', '.')) : null;
    formData.valorFrete = formData.valorFrete ? parseFloat((formData.valorFrete + '').replace(',', '.')) : null;
    formData.valorCompra = formData.valorCompra ? parseFloat((formData.valorCompra + '').replace(',', '.')) : null;
    formData.valorOutro = formData.valorOutro ? parseFloat((formData.valorOutro + '').replace(',', '.')) : null;
    formData.idEmpFrete = formData.idEmpFrete || 0;
    formData.dataEntrega = formData.dataEntrega || null;
    formData.dataNota = formData.dataNota || null;
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 3000);
    console.log('🆔 ID do Fornecedor capturado:', formData.idForn);
    this.httpClient.post(environment.financa + "/compras", formData)
      .subscribe({
        next: (data: any) => {
          console.log('🔍 Resposta da API após cadastro de compra:', data);
          this.mensagem = data.message;


          this.ultimaCompra = {
            id: data.comprasGet.id,
            idForn: data.comprasGet.idForn,
            valorFrete: data.comprasGet.valorFrete ?? formData.valorFrete,
            valorCompra: data.comprasGet.valorCompra ?? formData.valorCompra,
            numNota: data.comprasGet.numNota ?? formData.numNota,
            loja: data.comprasGet.loja ?? formData.loja,
            numNF: data.comprasGet.numNF ?? formData.numNF,
          };

          this.formCompras.reset();

          const modalElement = document.getElementById('cadastrarCompras');
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();

          setTimeout(() => {
            const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmarCobranca'));
            modalConfirm.show();
          }, 300);

          setTimeout(() => {
            this.mensagem = null;
          }, 4000);
        },

        error: (e) => {
          console.log(e.error);
          this.spinner.hide();

          if (e.status === 400 && e.error?.message) {
            this.mensagemErro = e.error.message;
          } else if (e.error?.message) {
            this.mensagemErro = e.error.message;
          } else {
            this.mensagemErro = 'Erro inesperado ao cadastrar compra.';
          }

          setTimeout(() => {
            this.mensagemErro = null;
          }, 5000);
        }
      });
  }


  cancelarCriacaoCobranca(): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarCobranca'));
    modal?.hide(); // Fecha o modal
    location.reload(); // Recarrega a página
  }

  CadastrarCobranca(): void {


    const cobrancasRaw = this.formCobrancas.get('cobrancas')?.value || [];

    const cobrancasData = cobrancasRaw.map((c: any) => {
      const copia = { ...c };

      Object.keys(copia).forEach(key => {
        if (typeof copia[key] === 'string') {
          copia[key] = copia[key].toUpperCase();
        }
      });

      return {
        ...copia,
        valorPago: this.converterRealParaDecimal(copia.valorPago),
        valorCobr: this.converterRealParaDecimal(copia.valorCobr),
        valorFrete: this.converterRealParaDecimal(copia.valorFrete),
        valorCompra: this.converterRealParaDecimal(copia.valorCompra),
      };
    });
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 3000);
    this.httpClient.post(environment.financa + "/cobranca", cobrancasData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = 'Cobranças cadastradas com sucesso!';
          this.formCobrancas.reset();
          this.cobrancas.clear();

          setTimeout(() => this.mensagem = null, 4000);
          window.location.reload();

        },
        error: (e) => {
          console.log(e.error);
          this.spinner.hide();
          if (e.status === 400 && e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else if (e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else {
            this.mensagemErro = 'Erro inesperado ao cadastrar cobrança.';
          }
          setTimeout(() => {
            this.mensagemErro = null;
          }, 5000);
        }
      });
  }
  removerCobranca(index: number): void {
    this.cobrancas.removeAt(index);
  }

  removerUltimaCobranca(): void {
    if (this.cobrancas.length > 0) {
      this.cobrancas.removeAt(this.cobrancas.length - 1);
    }
  }
  get valorTotalCompra(): number {
    if (this.cobrancas.length === 0) return 0;


    const valorCompraStr = this.cobrancas.at(0).get('valorCompra')?.value;
    return this.converterRealParaDecimal(valorCompraStr) ?? 0;
  }

  get somaValorCobranca(): number {
    return this.cobrancas.controls.reduce((acc, grupo) => {
      const valorCobrStr = grupo.get('valorCobr')?.value || '0';
      const valor = this.converterRealParaDecimal(valorCobrStr) ?? 0;
      return acc + valor;
    }, 0);
  }

  get valorCobradoIgualValorTotal(): boolean {
    // Comparar valores arredondados para evitar pequenos erros de ponto flutuante
    const total = this.valorTotalCompra;
    const soma = this.somaValorCobranca;
    return Math.abs(total - soma) < 0.01; // tolerância de 1 centavo
  }

  CadastrarFornecedo(): void {


    const formData = this.formFornecedor.value;
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });

    console.log('Form Data:', formData);
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 3000);
    this.httpClient.post(environment.financa + "/fornecedor", this.formFornecedor.value)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.formFornecedor.reset();


          this.spinner.hide();
          setTimeout(() => {
            this.mensagem = null;
          }, 1000);
          window.location.reload();

        },
        error: (e) => {
          console.log(e.error);

          this.spinner.hide();


          if (e.status === 400 && e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else if (e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else {
            this.mensagemErro = 'Erro inesperado ao cadastrar fornecedor.';
          }
          setTimeout(() => {
            this.mensagemErro = null;
          }, 5000);
        }
      });

  }


  cadastrarDespesas(): void {
    const formData = this.formDespesas.value;

    formData.valor = formData.valor ? parseFloat((formData.valor + '').replace(',', '.')) : null;
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });
    console.log('Form Data:', formData);

    this.httpClient.post(environment.financa + "/despesas", this.formDespesas.value)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.formDespesas.reset();


          this.spinner.hide();
          setTimeout(() => {
            this.mensagem = null;
          }, 1000);
          window.location.reload();

        },
        error: (e) => {
          console.log(e.error);

          this.spinner.hide();


          if (e.status === 400 && e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else if (e.error && e.error.message) {
            this.mensagemErro = e.error.message;
          } else {
            this.mensagemErro = 'Erro inesperado ao cadastrar despesa.';
          }
          setTimeout(() => {
            this.mensagemErro = null;
          }, 5000);
        }
      });

  }
  mudarMes(delta: number) {
    this.mesAtual += delta;

    if (this.mesAtual > 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    }

    this.gerarCalendario();
  }



  gerarCalendario() {
    const ano = this.anoAtual;
    const mes = this.mesAtual;

    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    this.nomeMes = `${meses[mes]} ${ano}`;

    const totalDias = new Date(ano, mes + 1, 0).getDate();
    this.diasDoMes = [];


    const firstDayOfMonth = new Date(ano, mes, 1).getDay();

    const primeiroDiaIndex = (firstDayOfMonth - this.weekStart + 7) % 7;


    for (let i = 0; i < primeiroDiaIndex; i++) {
      this.diasDoMes.push({ vazio: true });
    }


    for (let dia = 1; dia <= totalDias; dia++) {
      const data = new Date(ano, mes, dia);
      const dataIso = data.toISOString().slice(0, 10);

      const despesasDia = this.allDespesasLoja.filter(d => {
        if (d.dataPagamento) {
          return d.dataPagamento === dataIso;
        }
        return d.dataVencimento === dataIso;
      });

      const valorPago = despesasDia
        .filter(d => d.dataPagamento === dataIso)
        .reduce((acc, d) => acc + (d.valorPago || 0), 0);

      const valorAberto = despesasDia
        .filter(d => d.dataVencimento === dataIso && !d.dataPagamento)
        .reduce((acc, d) => acc + (d.valorCobr || 0), 0);

      const vencido = despesasDia.some(d =>
        d.dataVencimento === dataIso && !d.dataPagamento && this.isVencidaCalendar(d.dataVencimento)
      );

      const proximo = despesasDia.some(d =>
        d.dataVencimento === dataIso && !d.dataPagamento && this.isProximoCalendar(d.dataVencimento)
      );

      const pago = despesasDia.some(d => d.dataPagamento === dataIso);


      let status = 'normal';
      if (vencido) status = 'vencido';
      else if (proximo) status = 'proximo';
      else if (pago) status = 'pago';

      this.diasDoMes.push({
        numero: dia,
        data,
        despesas: despesasDia,
        valorPago,
        valorAberto,
        vencido,
        proximo,
        pago,
        status,
        vazio: false
      });
    }


    this.totalMesPago = this.diasDoMes
      .filter(d => !d.vazio)
      .reduce((acc, d) => acc + d.valorPago, 0);

    this.totalMesAberto = this.diasDoMes
      .filter(d => !d.vazio)
      .reduce((acc, d) => acc + d.valorAberto, 0);

    this.totalMesGeral = this.diasDoMes
      .filter((d: any) => !d.vazio)
      .reduce((acc: number, d: any) => {
        const totalDia = d.despesas
          .reduce((soma: number, dep: any) => soma + (dep.valorCobr || 0), 0);

        return acc + totalDia;
      }, 0);

    const rankingFromCalendar: Record<string, number> = {};

    this.diasDoMes
      .filter(d => !d.vazio)
      .forEach(dia => {

        dia.despesas.forEach((dep: any) => {

          const categoria = this.categoriaAlias[dep.categoria] || dep.categoria;
          const valor = Number(dep.valorCobr) || 0;

          rankingFromCalendar[categoria] =
            (rankingFromCalendar[categoria] || 0) + valor;
        });
      });





    this.totalGeralPago = this.allDespesasLoja
      .reduce((acc, d) => acc + (d.valorPago || 0), 0);

    this.totalGeralAberto = this.allDespesasLoja
      .filter(d => !d.dataPagamento)
      .reduce((acc, d) => acc + (d.valorCobr || 0), 0);

    this.totalGeral = this.totalGeralPago + this.totalGeralAberto;
    this.gerarRanking();
    this.gerarTabelaAnualCategorias();

  }





  gerarRanking() {

    const ano = this.anoAtual;
    const mes = this.mesAtual;


    const despesasMes = this.allDespesasLoja.filter(d => {
      if (!d.dataVencimento) return false;

      if (!d.dataPagamento) return false;

      const dataPag = d.dataPagamento.split('T')[0];
      const [y, m] = dataPag.split('-').map(Number);

      return y === this.anoAtual && m === this.mesAtual + 1;

    });

    const lista = despesasMes.reduce((acc, item) => {
      acc[item.categoria] =
        (acc[item.categoria] || 0) +
        (item.valorPago || item.valorCobr || 0);

      return acc;
    }, {} as any);

    this.rankingMes = Object.keys(lista)
      .map(cat => ({
        nome: this.categoriaAlias[cat] || cat,
        valor: lista[cat]
      }))
      .sort((a, b) => b.valor - a.valor);


  }
  abrirModalDespesas(categoria: string, mes: string) {
    const mesesMap: any = {
      "Jan": 1, "Fev": 2, "Mar": 3, "Abr": 4,
      "Mai": 5, "Jun": 6, "Jul": 7, "Ago": 8,
      "Set": 9, "Out": 10, "Nov": 11, "Dez": 12
    };

    const mesNumero = mesesMap[mes];

    let despesas = this.allDespesasLoja.filter(d => {
      if (!d.dataPagamento || !d.valorPago) return false;

      const [ano, mes] = d.dataPagamento.split('T')[0].split('-').map(Number);
      const categoriaOriginal = d.categoria;
      const categoriaTabela = this.categoriaAlias[categoriaOriginal] || categoriaOriginal;

      return (
        ano === this.anoAtual &&
        mes === mesNumero &&
        categoriaTabela === categoria
      );
    });

    // Ordenar por dataPagamento desc
    despesas = despesas.sort((a, b) =>
      new Date(a.dataPagamento).getTime() - new Date(b.dataPagamento).getTime()
    );

    this.clickedCell = { categoria, mes };
    this.categoriaModal = categoria;
    this.mesModal = mes;
    this.listaDespesasFiltradas = despesas;
    this.totalModal = despesas.reduce((a, b) => a + Number(b.valorPago || 0), 0);

    const modalEl: any = document.getElementById('despesasModal');
    this.despesasModal = new bootstrap.Modal(modalEl);

    // ❗ limpar cor ao fechar = clickedCell null
    modalEl.addEventListener('hidden.bs.modal', () => {
      this.clickedCell = null;
    });

    this.despesasModal.show();
  }





  exportarExcel() {
    // gera os dados de exibição dos meses
    const dados: any[] = this.tabelaCategoriasAno.map(row => ({
      Mês: row.mes,
      ...row.valores
    }));

    // adiciona linha separadora
    dados.push({});

    // adiciona linha Média Mensal
    dados.push({
      Mês: "MÉDIA MENSAL",
      Total: this.mediaAnual
    });

    // adiciona linha Total Anual
    dados.push({
      Mês: "TOTAL ANUAL",
      Total: this.totalAnual
    });

    // cria worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dados);

    // formatação Real BRL: R$ #,##0.00
    const range = XLSX.utils.decode_range(ws["!ref"]!);

    for (let C = 1; C <= range.e.c; ++C) {
      for (let R = 1; R <= range.e.r; ++R) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (cell && typeof cell.v === "number") {
          cell.z = 'R$ #,##0.00';
        }
      }
    }

    // Ajusta largura automática
    const colWidths = [];
    const header = Object.keys(dados[0]);
    for (let h of header) {
      colWidths.push({ wch: h.length + 12 });
    }
    ws['!cols'] = colWidths;

    // Cabeçalho em negrito
    header.forEach((h, idx) => {
      const ref = XLSX.utils.encode_cell({ r: 0, c: idx });
      if (ws[ref]) ws[ref].s = { font: { bold: true } };
    });

    // Monta o workbook
    const wb: XLSX.WorkBook = { Sheets: { 'Resumo Anual': ws }, SheetNames: ['Resumo Anual'] };

    // baixa arquivo
    XLSX.writeFile(wb, `Resumo_Categorias_${this.anoAtual}.xlsx`);
  }



  gerarTabelaAnualCategorias() {
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const anoAtual = this.anoAtual;

    const tabela: LinhaTabelaCategoria[] = [];

    for (let m = 0; m < 12; m++) {
      const linha: LinhaTabelaCategoria = {
        mes: mesesNomes[m],
        valores: {}
      };

      // zera valores das categorias
      this.categoriasFixas.forEach(cat => linha.valores[cat] = 0);

      // percorre despesas
      this.allDespesasLoja.forEach(d => {
        if (!d.dataPagamento || !d.valorPago) return;

        const [ano, mes] = d.dataPagamento.split('T')[0].split('-').map(Number);

        if (ano === anoAtual && (mes - 1) === m) {
          const categoriaOriginal = d.categoria;
          const categoriaTabela = this.categoriaAlias[categoriaOriginal] || categoriaOriginal;

          const valor = Number(d.valorPago) || 0;

          if (linha.valores[categoriaTabela] !== undefined) {
            linha.valores[categoriaTabela] += valor;
          }
        }
      });

      // total do mês somando todas categorias
      linha.valores["Total"] = Object.keys(linha.valores)
        .filter(k => k !== "Total")
        .reduce((acc, k) => acc + linha.valores[k], 0);

      tabela.push(linha);
    }

    // salva na variavel que o HTML usa
    this.tabelaCategoriasAno = tabela;

    // 🔥 total anual somando os 12 "Total" da tabela
    this.totalAnual = tabela
      .map(l => l.valores["Total"] || 0)
      .reduce((acc, v) => acc + v, 0);

    const mesAtualIndex = new Date().getMonth();
    const mesesConsiderados = mesAtualIndex + 1;
    const totalAteAgora = tabela
      .slice(0, mesesConsiderados)
      .map(l => l.valores["Total"] || 0)
      .reduce((acc, v) => acc + v, 0);

    this.mediaAnual = totalAteAgora / mesesConsiderados;
  }
  abrirModal(tipo: 'compras' | 'cobrancas') {
    this.tipoSelecionado = tipo;

    this.gerarTabelaAnualFormaPag(
      tipo === 'compras' ? this.compras : this.cobranca
    );

    const modalEl = document.getElementById('modalResumo');
    if (!modalEl) return;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
  abrirModalResumoFormaPag(mesNome: string, formaPag: string) {

    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const mesIndex = meses.indexOf(mesNome);
    if (mesIndex === -1) return;

    const listaBase =
      this.tipoSelecionado === 'compras'
        ? this.compras
        : this.cobranca;

    this.formaPagModal = formaPag;
    this.mesResumoModal = `${mesNome}/${this.anoAtual}`;

    this.listaResumoFormaPag = listaBase
      .filter(item => {

        const dataBase = item.dataEntrega || item.dataNota;
        if (!dataBase) return false;

        const [ano, mes] = dataBase
          .split('T')[0]
          .split('-')
          .map(Number);

        if (ano !== this.anoAtual || mes - 1 !== mesIndex) return false;

        return item.formaPag?.toUpperCase() === formaPag;
      })
      .sort((a, b) => {
        const da = new Date(a.dataEntrega || a.dataNota).getTime();
        const db = new Date(b.dataEntrega || b.dataNota).getTime();
        return db - da;
      });


    this.totalResumoFormaPag = this.listaResumoFormaPag.reduce(
      (total, item) => {
        const valor = Number(item.valorCompra) || 0;
        return total + valor;
      },
      0
    );


    const modalEl = document.getElementById('modalResumoFormaPag');
    if (!modalEl) return;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }



  alterarAno(delta: number) {
    this.anoAtual += delta;

    console.log('📅 Ano selecionado:', this.anoAtual);

    this.gerarTabelaAnualFormaPag(
      this.tipoSelecionado === 'compras'
        ? this.compras
        : this.cobranca
    );
  }
  exportarExcelResumoCompra(anoInicio: number, anoFim: number) {

    const workbook: XLSX.WorkBook = {
      SheetNames: [],
      Sheets: {}
    };

    for (let ano = anoInicio; ano <= anoFim; ano++) {

      // 🔹 GERA DADOS DO ANO
      this.anoAtual = ano;
      this.gerarTabelaAnualFormaPag(
        this.tipoSelecionado === 'compras'
          ? this.compras
          : this.cobranca
      );

      const dados: any[][] = [];

      // 🔹 CABEÇALHO
      const header = [
        'Mês',
        ...this.formasPagamento,
        'TOTAL',
        'MÉDIA ANUAL (%)'
      ];

      dados.push(header);

      // 🔹 MESES
      this.tabelaFormaPagAno.forEach(row => {
        const linha: any[] = [];

        linha.push(row.mes);

        this.formasPagamento.forEach(fp => {
          linha.push(row.valores[fp] ?? 0);
        });

        linha.push(row.total);
        linha.push((row.percentualAnual ?? 0) / 100); // Excel usa decimal

        dados.push(linha);
      });

      // 🔹 LINHA MÉDIA
      const linhaMedia: any[] = ['MÉDIA'];
      this.formasPagamento.forEach(fp => {
        linhaMedia.push(this.mediaPorFormaPag[fp] ?? 0);
      });
      linhaMedia.push(this.mediaTotalGeral);
      linhaMedia.push('');
      dados.push(linhaMedia);

      // 🔹 LINHA TOTAL
      const linhaTotal: any[] = ['TOTAL'];
      this.formasPagamento.forEach(fp => {
        linhaTotal.push(this.totalPorFormaPag[fp] ?? 0);
      });
      linhaTotal.push(this.totalGeral);
      linhaTotal.push('');
      dados.push(linhaTotal);

      // 🔹 CONVERTE PARA SHEET
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dados);

      ws['!views'] = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      // 🔹 LARGURA DAS COLUNAS
      ws['!cols'] = [
        { wch: 10 },
        ...this.formasPagamento.map(() => ({ wch: 16 })),
        { wch: 16 },
        { wch: 18 }
      ];

      // 🔹 FORMATAÇÃO
      const totalCols = header.length;
      const lastRow = dados.length;

      for (let r = 1; r < lastRow; r++) {
        for (let c = 1; c < totalCols; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          const cell = ws[cellRef];
          if (!cell) continue;

          // Percentual
          if (c === totalCols - 1 && r <= 12) {
            cell.z = '0.00%';
          }
          // Moeda
          else {
            cell.z = '"R$" #,##0.00';
          }
        }
      }

      // 🔹 REGISTRA ABA
      const sheetName = `Ano ${ano}`;
      workbook.SheetNames.push(sheetName);
      workbook.Sheets[sheetName] = ws;
    }

    // 🔹 EXPORTA
    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    saveAs(
      new Blob([buffer], { type: 'application/octet-stream' }),
      `Resumo_Anual_${anoInicio}_${anoFim}.xlsx`
    );
  }


  gerarTabelaAnualFormaPag(lista: any[]) {

    const mesesNomes = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const anoAtual = this.anoAtual;

    this.totalPorFormaPag = {};
    this.mediaPorFormaPag = {};
    this.totalGeral = 0;
    this.mediaTotalGeral = 0;

    this.formasPagamento.forEach(fp => {
      this.totalPorFormaPag[fp] = 0;
    });

    const tabela: any[] = [];

    // 🔹 LOOP MESES
    for (let m = 0; m < 12; m++) {

      const linha: any = {
        mes: mesesNomes[m],
        valores: {},
        total: 0,
        percentualAnual: 0
      };

      this.formasPagamento.forEach(fp => linha.valores[fp] = 0);

      lista.forEach(item => {

        const data = this.getDataBaseCompra(item);
        if (!data) return;

        const valorConsiderado = Number(item.valorCompra) || 0;
        if (valorConsiderado === 0) return;

        const ano = data.getFullYear();
        const mes = data.getMonth();

        if (ano !== anoAtual || mes !== m) return;

        const temNota = Number(item.valorNF) > 0;

        // C/ NOTA ou S/ NOTA (classificação)
        if (temNota) {
          linha.valores['C/ NOTA'] += valorConsiderado;
          this.totalPorFormaPag['C/ NOTA'] += valorConsiderado;
        } else {
          linha.valores['S/ NOTA'] += valorConsiderado;
          this.totalPorFormaPag['S/ NOTA'] += valorConsiderado;
        }

        linha.total += valorConsiderado;
        this.totalGeral += valorConsiderado;

        const forma = item.formaPag?.toUpperCase();
        if (forma && linha.valores[forma] !== undefined) {
          linha.valores[forma] += valorConsiderado;
          this.totalPorFormaPag[forma] += valorConsiderado;
        }
      });

      tabela.push(linha);
    }

    const mesesComValor = tabela.filter(l => l.total > 0).length || 1;

    this.mediaTotalGeral = this.totalGeral / mesesComValor;

    this.formasPagamento.forEach(fp => {
      this.mediaPorFormaPag[fp] =
        (this.totalPorFormaPag[fp] || 0) / mesesComValor;
    });

    // 🔹 % EM RELAÇÃO À MÉDIA
    tabela.forEach(linha => {
      linha.percentualAnual =
        this.mediaTotalGeral > 0
          ? (linha.total / this.mediaTotalGeral) * 100
          : 0;
    });

    this.tabelaFormaPagAno = tabela;
  }

  getDataBaseCompra(item: any): Date | null {
    if (item.dataEntrega) return new Date(item.dataEntrega);
    if (item.dataNota) return new Date(item.dataNota);
    return null;
  }






  carregarDespesas() {
    this.httpClient.get<any[]>(environment.financa + "/despesasLoja")
      .subscribe({
        next: (dados) => {

          this.allDespesasLoja = dados.map(d => ({
            ...d,


            dataVencimento: d.dataVencimento
              ? new Date(d.dataVencimento).toISOString().slice(0, 10)
              : null,

            dataPagamento: d.dataPagamento
              ? new Date(d.dataPagamento).toISOString().slice(0, 10)
              : null
          }));

          console.log("Despesas carregadas:", this.allDespesasLoja);

          this.gerarCalendario();
        },
        error: (erro) => console.error("Erro ao carregar despesas:", erro)
      });
  }

  isVencidaCalendar(dataVenc: string): boolean {
    const hoje = normalizarDataLocal(new Date());
    const venc = normalizarDataLocal(new Date(dataVenc));
    return venc < hoje;
  }

  isProximoCalendar(dataVenc: string): boolean {
    const hoje = normalizarDataLocal(new Date());
    const venc = normalizarDataLocal(new Date(dataVenc));

    const daqui3dias = new Date(hoje);
    daqui3dias.setDate(hoje.getDate() + 3);

    return venc >= hoje && venc <= daqui3dias;
  }


  getTituloDia(dia: any): string {
    if (!dia.despesas || dia.despesas.length === 0) return '';

    return dia.despesas
      .map((d: any) => `${d.despesa} - ${d.loja}`)
      .join('\n');
  }



  showTooltip(dia: any, event: MouseEvent) {
    if (!dia.despesas || dia.despesas.length === 0) {
      this.hideTooltip();
      return;
    }

    const tooltip = document.getElementById('tooltip-despesas')!;


    const html = dia.despesas
      .map((d: any) => {
        let cor = '';
        let classe = '';

        if (d.dataPagamento) {
          cor = '#074904';
          classe = 'pago';
        } else if (this.isVencidaCalendar(d.dataVencimento)) {
          cor = '#b30000';
          classe = 'aberto';
        } else if (this.isProximoCalendar(d.dataVencimento)) {
          cor = '#cc9900';
          classe = 'proximo';
        }


        return `
                <div class="item ${classe}" style="color: ${cor};">
                    ${d.despesa} - ${d.loja}
                </div>
            `;
      })
      .join('');

    this.tooltipHtml = this.sanitizer.bypassSecurityTrustHtml(html);


    tooltip.style.display = 'block';


    const targetElement = event.currentTarget as HTMLElement;
    const targetRect = targetElement.getBoundingClientRect();

    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10;

    let finalLeft;
    let finalTop;
    let arrowTop;
    let isArrowRight = false;




    if (targetRect.right + margin + tooltipWidth < viewportWidth) {
      finalLeft = targetRect.right + margin;
      isArrowRight = false;
    }

    else if (targetRect.left - margin - tooltipWidth > 0) {
      finalLeft = targetRect.left - margin - tooltipWidth;
      isArrowRight = true;
    }

    else {
      finalLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);

      if (finalLeft < margin) finalLeft = margin;
      if (finalLeft + tooltipWidth > viewportWidth - margin) finalLeft = viewportWidth - tooltipWidth - margin;
      isArrowRight = false;
    }



    finalTop = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);

    // Garante que o tooltip não saia do topo
    if (finalTop < margin) {
      finalTop = margin;
    }

    else if (finalTop + tooltipHeight > viewportHeight - margin) {
      finalTop = viewportHeight - tooltipHeight - margin;
    }


    arrowTop = (targetRect.top + targetRect.height / 2) - finalTop;



    tooltip.style.left = finalLeft + 'px';
    tooltip.style.top = finalTop + 'px';


    tooltip.style.setProperty('--arrow-top', `${arrowTop}px`);


    if (isArrowRight) {
      tooltip.classList.add('arrow-right');
    } else {
      tooltip.classList.remove('arrow-right');
    }

  }





  hideTooltip() {
    const tooltip = document.getElementById('tooltip-despesas')!;
    tooltip.style.display = 'none';
  }



}




function normalizarDataLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
declare var bootstrap: any;

@Component({
  selector: 'app-despesas-loja',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './despesas-loja.component.html',
  styleUrl: './despesas-loja.component.css'
})
export class DespesasLojaComponent implements OnInit {

  [x: string]: any;
  filtroAtivo: boolean = false;
  filtroInativo: boolean = false;
  despesasLojaFiltradas: any[] = [];
  categoriaSelecionada: string = '';
  despesasSelect: string[] = [];
  mostrarInputDespesa: boolean = false;
  mensagem: string | null = null;
  mensagemErro: string | null = null;
  listaDespesasLoja: any[] = [];
  allDespesasLoja: any[] = [];
  expression: string = '';
  despesasLoja: any = {};
  p: number = 1;
  despesasLojaForm: any;
  categoria: string[] = ['ADMINISTRATIVOS', 'FUNCIONAMENTO', 'FUNCIONÁRIOS', 'IMÓVEIS', 'LOGÍSTICA', 'VENDA', 'OUTROS',]
  categoriasDespesas: any = {
    'ADMINISTRATIVOS': ['CONTABILIDADE', 'INTERNET', 'INVESTIMENTOS', 'JUROS DE EMPRÉSTIMOS', 'MEDICINA DO TRABALHO', 'REDE', 'SISTEMAS', 'TAXAS BAIRRO', 'TÁRIFAS BANCÁRIAS', 'TELEFONE',],
    'FUNCIONAMENTO': ['MANUTENÇÃO', 'MERCADO', 'REFEIÇÃO', 'SUPRIMENTOS',],
    'FUNCIONÁRIOS': ['ALIMENTAÇÃO', 'BONIFICAÇÃO', 'COMISSÃO', 'DÉCIMO TERCEIRO SALÁRIO', 'FÉRIAS', 'FGTS', 'HORA EXTRA', 'INSS', 'PASSAGEM', 'PLANO DE SAÚDE', 'SALÁRIOS', 'SEGURO DE VIDA',],
    'IMÓVEIS': ['ALUGUEIS', 'CONDOMINIOS', 'CONTA DE ÁGUA', 'CONTA DE LUZ', 'IPTU', 'MANUTENÇÃO', 'OBRAS', 'OUTROS IMPOSTOS', 'SEGURO',],
    'LOGÍSTICA': ['COMBUSTIVEL', 'IPVA', 'MANUTENÇÃO', 'MECÂNICA',],
    'VENDA': ['SIMPLES', 'TAXAS DA MAQUINA DE CARTÃO',],
    'OUTROS': []
  };
  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  mesReferencia: string[] = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  conta: string[] = ['ITAU-JC1', 'ITAU-VA', 'ITAU-JC2', 'ITAU-CL', 'BRAD-JC1',];
  despesasFixas = [
    { categoria: 'VENDA', despesa: 'SIMPLES', diaVenc: 20 },
    { categoria: 'ADMINISTRATIVOS', despesa: 'INTERNET', diaVenc: 10 },
    { categoria: 'ADMINISTRATIVOS', despesa: 'CONTABILIDADE', diaVenc: 5 },
    { categoria: 'FUNCIONÁRIOS', despesa: 'SEGURO DE VIDA', diaVenc: 25 },
  ];

  dataVencInicio: string = '';
  dataVencFim: string = '';
  indiceAberto: number | null = null;
  observacaoSelecionada: any = {};
  filtroIdCompraAtivo: string | null = null;
  private DespesasCarregadas: boolean = false;
  totalValorCobr: number = 0;
  totalValorPago: number = 0;
  totalPagoInativas: number = 0;
  totalSaldo: number = 0;
  totalSaldoAtivas: number = 0;
  totalChequeCobr = 0;
  totalChequePago = 0;
  totalChequeSaldo = 0;



  formDespesasLoja: FormGroup = this.formBuilder.group({
    id: [''],
    despesa: ['', Validators.required],
    loja: [''],
    categoria: [''],
    quantidade: [''],
    dataVencimento: [''],
    mesReferencia: [''],
    valorCobr: [''],
    valorPago: [''],
    observacao: [''],
    conta: [''],
    dataPagamento: [''],
    formaPagamento: [''],


  });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService
  ) { }


  ngOnInit(): void {
    this.httpClient.get(environment.financa + "/despesasLoja")
      .subscribe({
        next: (depesasLojaData) => {
          // Certifica que todas as despesas têm a propriedade 'ativo'
          this.allDespesasLoja = (depesasLojaData as any[]).map(desp => ({
            ...desp,
            ativo: desp.dataPagamento == null ? 1 : 0 // 1 = Pagar, 0 = Pago
          }));

          // Ordena e define filtradas
          this.despesasLoja = [...this.allDespesasLoja].sort((a, b) =>
            new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime()
          );
          this.despesasLojaFiltradas = [...this.despesasLoja];


          console.log('📦 Compras carregadas e ajustadas:', this.despesasLoja);


          const naoCheques = this.despesasLojaFiltradas.filter(c => c.despesa?.toLowerCase() !== 'cheque');

          // 🔹 Helper para somar
          const soma = (lista: any[], fn: (c: any) => number) => lista.reduce((s, c) => s + fn(c), 0);

          // 🔹 Totais gerais (excluindo cheques)
          this.totalValorCobr = soma(naoCheques, c => c.valorCobr || 0);
          this.totalValorPago = soma(naoCheques, c => c.valorPago || 0);
          this.totalSaldo = soma(naoCheques, c => Math.max(0, (c.valorCobr || 0) - (c.valorPago || 0)));

          // 🔹 Totais por status (ativas e inativas — sem cheques)
          const ativas = naoCheques.filter(c => c.ativo === 1);
          const inativas = naoCheques.filter(c => c.ativo === 0);

          this.totalSaldoAtivas = soma(ativas, c => Math.max(0, (c.valorCobr || 0) - (c.valorPago || 0)));
          this.totalPagoInativas = soma(inativas, c => c.valorPago || 0);
          this.verificarDespesasFixasMensal();

        },
        error: (e) => {
          console.log("Erro ao carregar compras:", e.error);
        }
      });
  }

  onCategoriaChange(event: any) {
    const categoria = event.target.value;
    this.categoriaSelecionada = categoria;

    if (categoria === 'OUTROS') {
      this.mostrarInputDespesa = true;
      this.despesasSelect = [];
      this.formDespesasLoja.get('despesa')?.reset();
    } else {
      this.mostrarInputDespesa = false;
      this.despesasSelect = this.categoriasDespesas[categoria] || [];
      this.formDespesasLoja.get('despesa')?.reset();
    }
  }
  verificarDespesasFixasMensal(): void {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mesRef = this.mesReferenciaAtual();

    if (dia !== 1) return; // ⚠️ roda só dia 1 de cada mês

    this.mensagem = null;
    this.mensagemErro = null;
    this.spinner.show();

    this.httpClient.get<any[]>(`${environment.financa}/despesasLoja?mesReferencia=${mesRef}`)
      .subscribe({
        next: (despesasMes) => {
          const despesasFixas = [
            { categoria: 'IMÓVEIS', despesa: 'ALUGUEL LOJA R18', loja: 'JC2', valorCobr: '4000,00', diaVenc: 1 },
            { categoria: 'IMÓVEIS', despesa: 'LUZ LOJA R8', loja: 'JC1', diaVenc: 1 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'SERVIDOR NA NUVEM', loja: 'OUTROS', valorCobr: '170,22', diaVenc: 4 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'REDE TOP JC1', loja: 'JC1', valorCobr: '750,00', diaVenc: 5 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'REDE TOP JC2', loja: 'JC2', valorCobr: '250,00', diaVenc: 5 },
            { categoria: 'IMÓVEIS', despesa: 'ALUGUEL CL', loja: 'CL', valorCobr: '10083,80,', diaVenc: 5 },
            { categoria: 'FUNCIONAMENTO', despesa: 'INTERNET DA LOJA R8 FLACK', loja: 'JC1', valorCobr: '155,00', diaVenc: 5 },
            { categoria: 'LOGÍSTICA', despesa: 'SEGURO SAVEIRO BR', loja: 'OUTROS', valorCobr: '262,63', diaVenc: 5 },
            { categoria: 'LOGÍSTICA', despesa: 'SEGURO SAVEIRO PR', loja: 'OUTROS', valorCobr: '169,10', diaVenc: 5 },
            { categoria: 'LOGÍSTICA', despesa: 'COROLLA', loja: 'OUTROS', valorCobr: '209,35', diaVenc: 5 },
            { categoria: 'IMÓVEIS', despesa: 'ALUGUEL GALPÃO R8', loja: 'OUTROS', valorCobr: '2249,53', diaVenc: 5 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'FGTS MAT COLOMBO', loja: 'JC1', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'FGTS CASA COLOMBO', loja: 'VA', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'FGTS CASA COLOMBO JC', loja: 'JC2', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'SEG VIDA JC1', loja: 'JC1', valorCobr: '311,59', diaVenc: 10 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'SEG VIDA VA', loja: 'VA', valorCobr: '95,83', diaVenc: 10 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'SEG VIDA JC2', loja: 'JC2', valorCobr: '150,30', diaVenc: 10 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'ALTERDATA JC2', loja: 'JC2', valorCobr: '232,28', diaVenc: 10 },
            { categoria: 'IMÓVEIS', despesa: 'LUZ DEPOSITO R5', loja: 'OUTROS', diaVenc: 10 },
            { categoria: 'IMÓVEIS', despesa: 'LUZ VA', loja: 'VA', diaVenc: 10 },
            { categoria: 'IMÓVEIS', despesa: 'LUZ MAT COLOMBO', loja: 'JC1', diaVenc: 10 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'BRADESCO SAÚDE', loja: 'JC1', valorCobr: '3672,25', diaVenc: 14 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'FLIT', loja: 'OUTROS', valorCobr: '199,00', diaVenc: 15 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'TIM CL',loja: 'CL',valorCobr: '41,85', diaVenc: 10 },
           // { categoria: 'ADMINISTRATIVOS', despesa: 'CLARO FIXO', loja: 'JC1', valorCobr: '21,00', diaVenc: 15 },
           // { categoria: 'ADMINISTRATIVOS', despesa: 'CLARO CEL', loja: 'C1', valorCobr: '49,90', diaVenc: 10 },
           // { categoria: 'ADMINISTRATIVOS', despesa: 'CLARO CEL', loja: 'C2', valorCobr: '49,90', diaVenc: 10 },
           // { categoria: 'ADMINISTRATIVOS', despesa: 'OI / TIM LOJA', diaVenc: 15 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'INTERNET R18', loja: 'JC2', valorCobr: '135,00', diaVenc: 15 },
            { categoria: 'IMÓVEIS', despesa: 'AGUAS DO RIO', loja: 'JC1', valorCobr: '447,77', diaVenc: 16 },
            { categoria: 'IMÓVEIS', despesa: 'APARTAMENTO 201/202/203', loja: 'OUTROS', valorCobr: '925,00', diaVenc: 20 },
            { categoria: 'IMÓVEIS', despesa: 'LUZ LOJA R18', loja: 'JC1', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'GPS CASA COLOMBO', loja: 'VA', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'GPS MAT COLOMBO', loja: 'JC1', diaVenc: 20 },
            { categoria: 'FUNCIONÁRIOS', despesa: 'GPS CASA COLOMBO JC', loja: 'JC2', diaVenc: 20 },
            { categoria: 'CUSTOS DE VENDA', despesa: 'SIMPLES CASA COLOMBO', loja: 'VA', diaVenc: 20 },
            { categoria: 'CUSTOS DE VENDA', despesa: 'SIMPLES MAT COLOMBO', loja: 'JC1', diaVenc: 20 },
            { categoria: 'CUSTOS DE VENDA', despesa: 'SIMPLES CASA COLOMBO JC', loja: 'JC2', diaVenc: 20 },
            { categoria: 'CUSTOS DE VENDA', despesa: 'SIMPLES CASA COLOMBO CL', loja: 'CL', diaVenc: 20 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'ALTERDATA VA-JC1', loja: 'JC1', diaVenc: 20 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'ALTERDATA CL', loja: 'CL', valorCobr: '283,47', diaVenc: 20 },
            { categoria: 'IMÓVEIS', despesa: 'ALUGUEL VA', loja: 'VA', valorCobr: '5250,00', diaVenc: 20 },
            { categoria: 'ADMINISTRATIVOS', despesa: 'INTERNET VA WESTLINK', loja: 'VA', valorCobr: '99,90', diaVenc: 20 },
            { categoria: 'VENDA', despesa: 'SIMPLES CONSTRUTORA', loja: 'CONSTRUTORA', valorCobr: '80,90', diaVenc: 20 },




          ];

          let criadas: string[] = [];
          let jaExistentes: string[] = [];
          let erros: string[] = [];

          const promises = despesasFixas.map(fixa => {
            const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), fixa.diaVenc);
            const vencISO = vencimento.toISOString().split('T')[0];

            // ✅ verificação completa (despesa + vencimento + loja)
            const jaExiste = despesasMes.some(d =>
              d.despesa?.toUpperCase() === fixa.despesa.toUpperCase() &&
              new Date(d.dataVencimento).toISOString().split('T')[0] === vencISO &&
              (d.loja?.toUpperCase() || '') === (fixa.loja?.toUpperCase() || '')
            );

            if (jaExiste) {
              jaExistentes.push(`${fixa.despesa} (${fixa.loja || 'Sem loja'})`);
              return Promise.resolve();
            }

            // 🔹 Conversão segura do valor
            const valor = fixa.valorCobr
              ? parseFloat(fixa.valorCobr.replace(/\./g, '').replace(',', '.'))
              : null;

            // 🔹 Cria objeto completo com loja
            const novaDespesa = {
              categoria: fixa.categoria,
              despesa: fixa.despesa,
              loja: fixa.loja || '-', // 👈 inclui a loja
              dataVencimento: vencISO,
              mesReferencia: mesRef,
              valorCobr: valor,
              valorPago: null,
              ativo: 1
            };

            return this.httpClient.post(`${environment.financa}/despesasLoja`, novaDespesa)
              .toPromise()
              .then((res: any) => {
                criadas.push(`${fixa.despesa} (${fixa.loja || 'Sem loja'})`);

                // 🔄 adiciona à tabela
                const nova = { ...novaDespesa, id: res?.id || Math.random(), ativo: 1 };
                this.allDespesasLoja.push(nova);
                this.despesasLojaFiltradas.unshift(nova);
              })
              .catch((e) => {
                console.error(`❌ Erro ao criar ${fixa.despesa}:`, e);
                erros.push(`${fixa.despesa} (${fixa.loja || 'Sem loja'})`);
              });
          });

          Promise.all(promises).then(() => {
            this.spinner.hide();

            // 🧾 Mensagens completas
            let msg = '';
            if (criadas.length > 0)
              msg += `✅ Criadas com sucesso: ${criadas.join(', ')}. `;
            if (jaExistentes.length > 0)
              msg += `⚠️ Já existiam: ${jaExistentes.join(', ')}. `;
            if (erros.length > 0)
              msg += `❌ Erro ao criar: ${erros.join(', ')}.`;

            if (criadas.length === 0 && jaExistentes.length === despesasFixas.length) {
              msg = '⚠️ Todas as despesas fixas deste mês já estão cadastradas.';
            }

            if (erros.length > 0) {
              this.mensagemErro = msg;
            } else {
              this.mensagem = msg;
            }
          });
        },
        error: (e) => {
          this.spinner.hide();
          console.error('❌ Erro ao verificar despesas fixas:', e);
          this.mensagemErro = 'Erro ao verificar despesas fixas.';
        }
      });
  }

  mesReferenciaAtual(): string {
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return meses[new Date().getMonth()];
  }





  filtrarDespesasLoja(): void {
    console.log('🔹 Iniciando filtro. Expression:', this.expression, 'Data início:', this.dataVencInicio, 'Data fim:', this.dataVencFim);

    const termo = this.expression?.toLowerCase().trim() || '';
    const inicioStr = this.dataVencInicio;
    const fimStr = this.dataVencFim;

    this.despesasLojaFiltradas = this.allDespesasLoja.filter(despesasLoja => {
      const contemTexto = termo === '' || Object.values(despesasLoja).some(value =>
        String(value).toLowerCase().includes(termo)
      );

      const dataVenc = despesasLoja.dataVencimento ? new Date(despesasLoja.dataVencimento) : null;
      let dataFimFiltrada: Date | null = null;
      let dataInicioFiltrada: Date | null = null;

      if (inicioStr) dataInicioFiltrada = new Date(inicioStr);
      if (fimStr) {
        dataFimFiltrada = new Date(fimStr);
        dataFimFiltrada.setDate(dataFimFiltrada.getDate() + 1);
      }

      const dentroDoPeriodo =
        (!dataInicioFiltrada || (dataVenc && dataVenc >= dataInicioFiltrada)) &&
        (!dataFimFiltrada || (dataVenc && dataVenc < dataFimFiltrada));

      const statusValido =
        (!this.filtroAtivo && !this.filtroInativo) ||
        (this.filtroAtivo && despesasLoja.ativo === 1) ||
        (this.filtroInativo && despesasLoja.ativo === 0);

      const resultado = contemTexto && dentroDoPeriodo && statusValido;

      console.log('🔹 Despesa:', despesasLoja.despesa, 'Ativo:', despesasLoja.ativo, 'Resultado filtro:', resultado);

      return resultado;
    });

    console.log('✅ Despesas filtradas:', this.despesasLojaFiltradas.length);
    const naoCheques = this.despesasLojaFiltradas.filter(c => c.despesa?.toLowerCase() !== 'cheque');

    // 🔹 Helper para somar
    const soma = (lista: any[], fn: (c: any) => number) => lista.reduce((s, c) => s + fn(c), 0);

    // 🔹 Totais gerais (excluindo cheques)
    this.totalValorCobr = soma(naoCheques, c => c.valorCobr || 0);
    this.totalValorPago = soma(naoCheques, c => c.valorPago || 0);
    this.totalSaldo = soma(naoCheques, c => Math.max(0, (c.valorCobr || 0) - (c.valorPago || 0)));

    // 🔹 Totais por status (ativas e inativas — sem cheques)
    const ativas = naoCheques.filter(c => c.ativo === 1);
    const inativas = naoCheques.filter(c => c.ativo === 0);

    this.totalSaldoAtivas = soma(ativas, c => Math.max(0, (c.valorCobr || 0) - (c.valorPago || 0)));
    this.totalPagoInativas = soma(inativas, c => c.valorPago || 0);


    this.ordenarPorDataVencimento();
    this.p = 1;
  }
  ordenarPorDataVencimento(): void {
    this.despesasLojaFiltradas.sort((a, b) => {
      const dataA = a.dataVencimento ? new Date(a.dataVencimento).getTime() : Infinity;
      const dataB = b.dataVencimento ? new Date(b.dataVencimento).getTime() : Infinity;

      return dataB - dataA;
    });
  }


  limparPesquisa() {
    this.expression = '';
    this.filtrarDespesasLoja();
  }



  onFiltroCheck(): void {
    console.log('🔹 Checkbox Ativo:', this.filtroAtivo, 'Inativo:', this.filtroInativo);

    // Garante que só um checkbox pode ser marcado por vez
    if (this.filtroAtivo) this.filtroInativo = false;
    else if (this.filtroInativo) this.filtroAtivo = false;

    console.log('🔹 Checkbox ajustado - Ativo:', this.filtroAtivo, 'Inativo:', this.filtroInativo);

    this.filtrarDespesasLoja();
  }

  onFecharAlerta(): void {


    this.mensagem = '';
    this.despesasLojaFiltradas = this.allDespesasLoja;
    this.router.navigate([], { queryParams: {} });

  }

  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }

  mostraObservacao(cobranca: any): void {
    this.observacaoSelecionada = cobranca;
    const modalElement = document.getElementById('modalObservacao');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  isVencidaOuHoje(dataVenc: string | Date, ativo: number): boolean {
    if (!dataVenc || ativo === 0) return false;




    const hoje = new Date();
    const venc = new Date(dataVenc);

    hoje.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);

    return venc < hoje;
  }

  cadastrarDespesas(): void {
    const formData = this.formDespesasLoja.value;

    formData.valorCobr = formData.valorCobr ? parseFloat((formData.valorCobr + '').replace(',', '.')) : null;
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });

    if (formData.dataVencimento) {
      const data = new Date(formData.dataVencimento);
      formData.dataVencimento = data.toISOString().split('T')[0];
    } else {
      formData.dataVencimento = null;
    }

    console.log('Form Data:', formData);

    this.httpClient.post(environment.financa + "/despesasLoja", this.formDespesasLoja.value)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.formDespesasLoja.reset();


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
  onEdite(id: string, modo: 'editar' | 'pagar'): void {
    this.httpClient.get(`${environment.financa}/despesasLoja/${id}`)
      .subscribe({
        next: (data: any) => {
          console.log('🔹 Dados recebidos da API:', data);

          const valorFormatado = Number(data.valorCobr || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });

          let valorPagoFormatado = '';
          if (modo === 'pagar') {
            // ✅ Se for pagar, já preenche com o valor cobrado
            valorPagoFormatado = valorFormatado;
          } else if (modo === 'editar' && data.valorPago != null && data.valorPago !== '') {
            // ✅ Se for editar e tiver valorPago na base, preenche
            valorPagoFormatado = Number(data.valorPago).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          }

          // Datas
          const dataVencimento = data.dataVencimento
            ? new Date(data.dataVencimento).toISOString().split('T')[0]
            : '';

          let dataPagamentoFormatada = '';
          if (data.dataPagamento) {
            dataPagamentoFormatada = new Date(data.dataPagamento).toISOString().split('T')[0];
          } else if (modo === 'pagar') {
            dataPagamentoFormatada = new Date().toISOString().split('T')[0];
          }

          // Ajuste da categoria/despesa
          if (data.categoria === 'OUTROS') {
            this.mostrarInputDespesa = true;
            this.despesasSelect = [];
          } else {
            this.mostrarInputDespesa = false;
            this.despesasSelect = this.categoriasDespesas[data.categoria] || [];

            if (data.despesa && !this.despesasSelect.includes(data.despesa)) {
              this.despesasSelect.push(data.despesa);
            }
          }

          if (data.categoria && !this.categoria.includes(data.categoria)) {
            this.categoria.push(data.categoria);
          }

          // ✅ Atualiza o form conforme o modo
          this.formDespesasLoja.patchValue({
            id: data.id,
            loja: data.loja,
            despesa: data.despesa,
            categoria: data.categoria,
            quantidade: data.quantidade,
            valorCobr: valorFormatado,
            dataVencimento: dataVencimento,
            observacao: data.observacao || '',
            valorPago: valorPagoFormatado || '', // ⚡ aqui fica vazio se não houver
            conta: data.conta || '',
            dataPagamento: dataPagamentoFormatada,
            formaPagamento: data.formaPagamento || '',
            mesReferencia: data.mesReferencia || ''
          });

          console.log('✅ Formulário preenchido:', this.formDespesasLoja.value);
        },
        error: (e) => {
          console.error('❌ Erro ao buscar despesa:', e.error);
        }
      });
  }








  onSubmit(): void {
    const formData = { ...this.formDespesasLoja.value };


    delete formData.valorPago;

    // Trata valores monetários
    if (typeof formData.valorCobr === 'string') {
      const cleaned = formData.valorCobr
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');
      formData.valorCobr = parseFloat(cleaned);
    }

    // Datas: enviar null se vazio
    formData.dataVencimento = formData.dataVencimento ? new Date(formData.dataVencimento).toISOString().split('T')[0] : null;
    formData.dataPagamento = formData.dataPagamento ? new Date(formData.dataPagamento).toISOString().split('T')[0] : null;

    // Campos string: enviar '' se undefined ou null
    formData.loja = formData.loja || '';
    formData.categoria = formData.categoria || '';
    formData.despesa = formData.despesa || '';
    formData.mesReferencia = formData.mesReferencia || '';
    formData.quantidade = formData.quantidade || '';
    formData.conta = formData.conta || '';
    formData.observacao = formData.observacao || '';
    formData.formaPagamento = formData.formaPagamento || '';

    console.log('Form enviado ajustado para PUT:', formData);

    this.httpClient.put(`${environment.financa}/despesasLoja`, formData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.router.navigate(['/despesas-loja']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar :', error);
          alert('Erro ao atualizar. Verifique os campos e tente novamente.');
        }
      });
  }


  onConcluir(): void {
    const rawForm = this.formDespesasLoja.value;

    let valorPagoFormatado = rawForm.valorPago;
    if (typeof valorPagoFormatado === 'string') {
      valorPagoFormatado = valorPagoFormatado
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');

      valorPagoFormatado = parseFloat(valorPagoFormatado);
    }

    const dadosParaEnviar = {
      id: rawForm.id,
      valorPago: valorPagoFormatado,
      dataPagamento: rawForm.dataPagamento,
      conta: rawForm.conta,
      formaPagamento: rawForm.formaPagamento
    };

    this.httpClient.put(`${environment.financa}/despesasLoja/baixa`, dadosParaEnviar)
      .subscribe({
        next: () => {
          this.httpClient.get(`${environment.financa}/despesasLoja/${rawForm.id}`)
            .subscribe({
              next: (despesasLojaAtualizada: any) => {



                const cobrancaProcessada = {
                  ...despesasLojaAtualizada,

                  dataCadastro: despesasLojaAtualizada.dataCadastro,
                  ativo: despesasLojaAtualizada.dataPagamento == null ? 1 : 0
                };

                const indexAll = this.allDespesasLoja.findIndex(c => c.id === rawForm.id);
                if (indexAll !== -1) {
                  this.allDespesasLoja[indexAll] = cobrancaProcessada;
                }

                const indexFiltrada = this.despesasLojaFiltradas.findIndex(c => c.id === rawForm.id);
                if (indexFiltrada !== -1) {
                  this.despesasLojaFiltradas[indexFiltrada] = cobrancaProcessada;
                }
              },
              error: (err) => {
                console.error('Erro ao buscar cobrança atualizada:', err);
                alert('Erro ao atualizar visualização.');
              }
            });
        },
        error: (error) => {
          console.error('Erro ao dar baixa:', error);
          alert('Erro ao concluir pagamento.');
        }
      });
  }



















}

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



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  compras: any[] = [];
  cobranca: any[] = [];
  cobrancasProximoVencimento: any[] = [];
  cobrancasPagasNoMes: any[] = [];
  cobrancasPagasNoDia: any[] = [];
  cobrancasVencidasNoDia: any[] = [];
  cobrancasSemPagamentos: any[] = [];
  fornecedor: any[] = [];
  filteredFornecedores: any[] = [];
  mensagem: string | null = null;
  mensagemErro: string | null = null;
  devePerguntarCobranca = false;
  ultimaCompra: any = null;
  cobrancaJaInicializada = false;
  tipoFornec: string[] = ['DISTRIBUIDOR', 'FABRICA', 'DIST / FABR', 'TRANSPORTADORA'];
  formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  formaPagDespesa: string[] = ['BOLETO','CARTÃO DE CREDITO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
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
  totalValorPagoPagasDia: number = 0;
  cobrancasAVencer: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService

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

    this.carregarDadosCobrancas();


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


  carregarDadosCobrancas(): void {
  const hoje = normalizarData(new Date());

  const dataLimiteProximoVencimento = new Date(hoje);
  dataLimiteProximoVencimento.setDate(hoje.getUTCDate() + 5);

  const formasIgnoradas = ['DINHEIRO', 'CHEQUE', 'TRANSFERÊNCIA'];

  this.httpClient.get(environment.financa + "/cobranca/ativo")
    .subscribe({
      next: (data) => {
        const cobrancasAtivas = data as any[];

        // 🔴 FILTRO 1: VENCIDAS
        this.cobranca = cobrancasAtivas.filter((cobranca: any) => {
          const dataVencimento = normalizarData(new Date(cobranca.dataVenc));
          const tipo = (cobranca.tipoCobr || '').toUpperCase();
          return (
            dataVencimento < hoje && // ⬅️ Só menores que hoje
            !formasIgnoradas.includes(tipo)
          );
        });
        this.qtdCobrancasVencidas = this.cobranca.length;
        this.totalValorCobrVencidas = this.cobranca.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


        // 🟡 FILTRO 2: Próximas ao vencimento
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1); // começa a contar a partir de amanhã

        this.cobrancasProximoVencimento = cobrancasAtivas.filter((cobranca: any) => {
          const dataVencimento = normalizarDataLocal(new Date(cobranca.dataVenc));
          const incluir = dataVencimento >= amanha && dataVencimento <= dataLimiteProximoVencimento;

          //if (incluir) {
            //console.log(`Cobrança incluída: ${cobranca.id || cobranca.valorCobr} - Vencimento: ${dataVencimento.toLocaleDateString('pt-BR')}`);
         // }

          return incluir;
        });
        this.qtdCobrancasProximoVencimento = this.cobrancasProximoVencimento.length,
        this.totalValorCobrProximo = this.cobrancasProximoVencimento.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 🔵 FILTRO 3: Vencidas no dia
        this.cobrancasVencidasNoDia = cobrancasAtivas.filter((cobranca: any) => {
          const dataVencimento = normalizarData(new Date(cobranca.dataVenc));
          return dataVencimento.getTime() === hoje.getTime();
        });
        this.qtdCobrancasVencidasNoDia = this.cobrancasVencidasNoDia.length;
        this.totalValorCobrVencidasDia = this.cobrancasVencidasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 🟢 FILTRO 4: A vencer
        this.cobrancasAVencer = cobrancasAtivas.filter((cobranca: any) => {
          const dataVencimento = normalizarData(new Date(cobranca.dataVenc));
          return dataVencimento > hoje && !cobranca.dataPag;
        });
        this.qtdCobrancasAVencer = this.cobrancasAVencer.length;
        this.totalValorCobrAVencer = this.cobrancasAVencer.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 🔶 FILTRO 5: VENCIDAS COM PAGAMENTO MANUAL
        this.cobrancasSemPagamentos = cobrancasAtivas.filter((cobranca: any) => {
          const dataVencimento = normalizarData(new Date(cobranca.dataVenc));
          const tipo = (cobranca.tipoCobr || '').toUpperCase();
          return (
            dataVencimento < hoje && // ⬅️ Só menores que hoje
            formasIgnoradas.includes(tipo)
          );
        });
        this.qtdCobrancasSemPagamento = this.cobrancasSemPagamentos.length;
        this.totalValorCobrSemPagamento = this.cobrancasSemPagamentos.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        console.log('🔶 Cobranças vencidas com pagamento manual:', this.cobrancasSemPagamentos);
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
        this.cobrancasPagasNoMes = cobrancasInativas.filter((cobranca: any) => {
          if (!cobranca.dataPag) return false;
          const dataPagamento = new Date(cobranca.dataPag);
          return (
            dataPagamento.getUTCMonth() === hoje.getUTCMonth() &&
            dataPagamento.getUTCFullYear() === hoje.getUTCFullYear()
          );
        });
        this.qtdCobrancasPagasNoMes = this.cobrancasPagasNoMes.length;
        this.totalValorCobrPagasMes = this.cobrancasPagasNoMes.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // ✅ Cobranças pagas no dia
        this.cobrancasPagasNoDia = cobrancasInativas.filter((cobranca: any) => {
          if (!cobranca.dataPag) return false;
          const dataPagamento = normalizarData(new Date(cobranca.dataPag));
          return dataPagamento.getTime() === hoje.getTime();
        });
        this.qtdCobrancasPagasNoDia = this.cobrancasPagasNoDia.length;
        this.totalValorCobrPagasDia = this.cobrancasPagasNoDia.reduce((acc, c) => acc + (Number(c.valorCobr) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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






}




function normalizarData(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function normalizarDataLocal(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

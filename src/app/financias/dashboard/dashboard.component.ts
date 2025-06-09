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
  cards = [
    { title: 'Cobranças Vencidas', bg: 'bg-danger text-white', icon: 'bi-exclamation-circle' },
    { title: 'Próx. Vencimento', bg: 'bg-warning text-dark', icon: 'bi-calendar-event' },
    { title: 'Pagas no Mês', bg: 'bg-info text-white', icon: 'bi-check-circle' },
    { title: 'Compras no Mês', bg: 'bg-primary text-white', icon: 'bi-bag-check' }
  ];
  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  compras: any[] = [];
  cobranca: any[] = [];
  fornecedor: any[] = [];
  mensagem: string | null = null;
  mensagemErro: string | null = null;
  devePerguntarCobranca = false;
  ultimaCompra: any = null;
  cobrancaJaInicializada = false;
  tipoCobranca: string[] = ['DISTRIBUIDOR', 'FABRICA', 'DIST / FABR', 'TRANSPORTADORA' ];
  formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA' ];


  formCompras: FormGroup = this.formBuilder.group({

    idForn: ['', Validators.required],
    idEmpFrete: [''],
    numNF: [''],
    numNota: [''],
    formaPag: [''],
    formaPagFrete: [''],
    obs: [''],
    valorNota: [''],
    valorFrete: [''],
    valorTotal: [''],
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
      numNF:'',
      conta: '',
      formaPag: '',
      obs: '',
      parcela: '1',
      valorPago: '',
      valorCobr: '',
      dataVenc: '',
      dataPag: '',
      loja: '',
      valorFrete: '',
      valorTotal: ''
    };

    if (this.cobrancas.length > 0) {
      const ultima = this.cobrancas.at(this.cobrancas.length - 1).value;
      dadosBase = { ...ultima };

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
      loja: [dadosBase.loja],
      valorPago: [dadosBase.valorPago],
      valorCobr: [this.formatarDecimalParaReal(dadosBase.valorCobr)],
      dataVenc: [Validators.required],
      dataPag: [dadosBase.dataPag],
      // Aqui uso a formatação:
      valorFrete: [this.formatarDecimalParaReal(dadosBase.valorFrete)],
      valorTotal: [this.formatarDecimalParaReal(dadosBase.valorTotal)],
    });

    novaCobranca.get('numNota')?.valueChanges.subscribe(nota => {
      if (!nota) {
        novaCobranca.patchValue({
          idCompra: '',
          idForn: '',
          loja: '',
          valorFrete: '',
          valorTotal: '',
          numNF:'',
          
        });
        return;
      }

      const compra = this.compras.find(c => c.numNota === nota);

      if (compra) {
        novaCobranca.patchValue({
          idCompra: compra.id,
          idForn: compra.idForn,
          valorFrete: this.formatarDecimalParaReal(compra.valorFrete),
          valorTotal: this.formatarDecimalParaReal(compra.valorTotal),
          numNF: compra.numNF,
          loja: compra.loja
        });
      } else {
        novaCobranca.patchValue({
          idCompra: '',
          idForn: '',
          valorFrete: '',
          valorTotal: '',
          loja: '',
          numNF:'',
        });
      }
    });

    this.cobrancas.push(novaCobranca);
  }
  /*calcularProximaDataVencimento(): string {
    const cobrancas = this.cobrancas;
    if (cobrancas.length === 0) return '';

    const ultima = cobrancas.at(cobrancas.length - 1);
    const dataAnteriorStr = ultima.get('dataVenc')?.value;

    if (!dataAnteriorStr) return '';

    const [ano, mes, dia] = dataAnteriorStr.split('-').map(Number);


    const dataAtual = new Date(ano, mes - 1, dia);

    const mesSomado = dataAtual.getMonth() + 1;
    const novaData = new Date(dataAtual.getFullYear(), mesSomado, 1);


    const ultimoDiaMes = new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0).getDate();


    const diaAjustado = Math.min(dia, ultimoDiaMes);

    novaData.setDate(diaAjustado);


    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${novaData.getFullYear()}-${pad(novaData.getMonth() + 1)}-${pad(novaData.getDate())}`;
  }*/




  confirmarCriarCobranca(): void {
    if (!this.ultimaCompra) return;

    this.cobrancas.clear();

    const novaCobranca = this.formBuilder.group({
      idForn: [this.ultimaCompra.idForn, Validators.required],
      idCompra: [this.ultimaCompra.id, Validators.required],
      tipoCobr: [''],
      numCobr: [''],
      numNota: [this.ultimaCompra.numNota],
      numNF:[this.ultimaCompra.numNF],
      conta: [''],
      formaPag: [''],
      obs: [''],
      parcela: ['1'],
      valorPago: [''],
      valorCobr: [this.formatarDecimalParaReal(this.ultimaCompra.valorCobr)],
      dataVenc: [''],
      dataPag: [''],
      loja: [this.ultimaCompra.loja],
      valorFrete: [this.formatarDecimalParaReal(this.ultimaCompra.valorFrete)],
      valorTotal: [this.formatarDecimalParaReal(this.ultimaCompra.valorTotal)],
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

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService

  ) { }

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
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    this.httpClient.get(environment.financa + "/cobranca")
      .subscribe({
        next: (data) => {
          this.cobranca = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });

    this.httpClient.get(environment.financa + "/fornecedor")
      .subscribe({
        next: (data) => {
          this.fornecedor = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
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

  // Função para converter string com vírgula para número (ponto decimal)
  converterRealParaDecimal(valor: string): number | null {
    if (!valor) return null;
    const num = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }
  CadastrarCompras(): void {
    this.spinner.show();


    const formData = { ...this.formCompras.value };



    formData.valorNota = formData.valorNota ? parseFloat((formData.valorNota + '').replace(',', '.')) : null;
    formData.valorFrete = formData.valorFrete ? parseFloat((formData.valorFrete + '').replace(',', '.')) : null;
    formData.valorTotal = formData.valorTotal ? parseFloat((formData.valorTotal + '').replace(',', '.')) : null;

    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });

    this.httpClient.post(environment.financa + "/compras", formData)
      .subscribe({
        next: (data: any) => {
          console.log('🔍 Resposta da API após cadastro de compra:', data);
          this.mensagem = data.message;
          this.spinner.hide();

          this.ultimaCompra = {
            id: data.comprasGet.id,
            idForn: data.comprasGet.idForn,
            valorFrete: data.comprasGet.valorFrete ?? formData.valorFrete,
            valorTotal: data.comprasGet.valorTotal ?? formData.valorTotal,
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
          }, 5000);
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




  CadastrarCobranca(): void {
    this.spinner.show();

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
        valorTotal: this.converterRealParaDecimal(copia.valorTotal),
      };
    });

    this.httpClient.post(environment.financa + "/cobranca", cobrancasData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = 'Cobranças cadastradas com sucesso!';
          this.formCobrancas.reset();
          this.cobrancas.clear();
          this.spinner.hide();
          setTimeout(() => this.mensagem = null, 5000);
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

    // Como o valor total está em cada cobrança, vamos pegar o valorTotal da primeira cobrança
    // (assumindo que todas são da mesma compra)
    const valorTotalStr = this.cobrancas.at(0).get('valorTotal')?.value;
    return this.converterRealParaDecimal(valorTotalStr) ?? 0;
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

    this.spinner.show();
    const formData = this.formFornecedor.value;
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].toUpperCase();
      }
    });

    console.log('Form Data:', formData);

    this.httpClient.post(environment.financa + "/fornecedor", this.formFornecedor.value)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.formFornecedor.reset();

          this.spinner.hide();
          setTimeout(() => {
            this.mensagem = null;
          }, 5000);


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









}





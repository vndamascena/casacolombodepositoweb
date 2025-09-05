import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';
import { forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
declare var bootstrap: any;

@Component({
  selector: 'app-cobranca',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './cobranca.component.html',
  styleUrl: './cobranca.component.css'
})
export class CobrancaComponent implements OnInit {
  [x: string]: any;
  filtroAtivo: boolean = false;
  filtroInativo: boolean = false;
  cobrancasFiltradas: any[] = [];
  mensagem: string | null = null;
  mensagemErro: string | null = null;
  listaCobrancas: any[] = [];
  allCobrancas: any[] = [];
  compras: any[] = [];
  fornecedor: any[] = [];
  expression: string = '';
  cobranca: any = {};
  p: number = 1;
  cobrancarForm: any;
  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  conta: string[] = ['ITAU-JC1', 'ITAU-VA', 'ITAU-JC2', 'ITAU-CL', 'BRAD-JC1',];
  dataVencInicio: string = '';
  dataVencFim: string = '';
  indiceAberto: number | null = null;
  observacaoSelecionada: any = {};
  filteredFornecedores: any[] = [];
  selectedFornecedor: any = null;
  selectedEmpresaFrete: any = null;
  ultimaCompra: any = null;

  filtroIdCompraAtivo: string | null = null;

  form: FormGroup = this.formBuilder.group({
    id: [''],
    idForn: [''],
    idCompra: [''],
    tipoCobr: [''],
    numCobr: [''],
    numNota: [''],
    numNF: [''],
    conta: ['', Validators.required],
    formaPag: [''],
    obs: [''],
    parcela: [''],
    valorPago: [''],
    valorCobr: [''],
    dataVenc: [''],
    dataPag: ['', Validators.required],
    loja: [''],
    valorFrete: [''],
    valorCompra: [''],
    ativo: ['']
  });

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

  formCobrancas: FormGroup = this.formBuilder.group({
    cobrancas: this.formBuilder.array([])
  });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService
  ) { }

  get f(): any {
    return this.form.controls;
  }

  get cb(): any {
    return this.form.controls;
  }

  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }


  get cobrancasFormArray(): FormArray {
    return this.formCobrancas.get('cobrancas') as FormArray;
  }

  get valorCobradoIgualValorTotal(): boolean {

    const total = this.valorTotalCompraDoForm;
    const soma = this.somaValorCobrancaDoForm;
    return Math.abs(total - soma) < 0.01;
  }


  get valorTotalCompraDoForm(): number {
    if (this.cobrancasFormArray.length === 0) return 0;
    const valorCompraStr = this.cobrancasFormArray.at(0).get('valorCompra')?.value;
    return this.converterRealParaDecimal(valorCompraStr) ?? 0;
  }


  get somaValorCobrancaDoForm(): number {
    return this.cobrancasFormArray.controls.reduce((acc, grupo) => {
      const valorCobrStr = grupo.get('valorCobr')?.value || '0';
      const valor = this.converterRealParaDecimal(valorCobrStr) ?? 0;
      return acc + valor;
    }, 0);
  }


  limparPesquisa() {
    this.expression = '';
    this.filtrarCobranca();
  }

  limparFiltroData(): void {
    this.dataVencInicio = '';
    this.dataVencFim = '';
    this.cobrancasFiltradas = [...this.allCobrancas];
    this.ordenarPorDataVencimento();
    this.p = 1;
  }

  mostraObservacao(cobranca: any): void {
    this.observacaoSelecionada = cobranca;
    const modalElement = document.getElementById('modalObservacao');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  filtrarPorDataVencimento(): void {
    const inicioStr = this.dataVencInicio;
    const fimStr = this.dataVencFim;

    this.cobrancasFiltradas = this.allCobrancas.filter(c => {
      if (!c.dataVenc) return false;

      const dataFormatada = new Date(c.dataVenc).toISOString().slice(0, 10);

      if (inicioStr && dataFormatada < inicioStr) return false;
      if (fimStr && dataFormatada > fimStr) return false;

      return true;
    });

    this.ordenarPorDataVencimento();
    this.p = 1;
  }

  aplicarFiltroDashboard(tipo: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLimite = new Date(hoje);
    dataLimite.setDate(hoje.getDate() + 5);
    dataLimite.setHours(0, 0, 0, 0);
    const formasIgnoradas = ['DINHEIRO', 'CHEQUE', 'TRANSFERÊNCIA'];
    switch (tipo) {
      case 'vencidas':
        
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const venc = new Date(c.dataVenc);
          venc.setHours(0, 0, 0, 0);
          const tipo = (c.tipoCobr || '').toUpperCase();
          return c.ativo && venc <= hoje && !formasIgnoradas.includes(tipo);
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo apenas cobranças vencidas';
        break;

      case 'proxvenc':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const venc = new Date(c.dataVenc);
          venc.setHours(0, 0, 0, 0);
          return c.ativo && venc > hoje && venc <= dataLimite;
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo cobranças com vencimento nos próximos 5 dias';
        break;

      case 'avencer':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const venc = new Date(c.dataVenc);
          venc.setHours(0, 0, 0, 0);
          return c.ativo && venc > hoje && !c.dataPag;
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo cobranças a vencer';
        break;

      case 'pagasmes':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const pag = new Date(c.dataPag);
          return !c.ativo && pag.getMonth() === hoje.getMonth() && pag.getFullYear() === hoje.getFullYear();
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo cobranças pagas no mês';
        break;

      case 'pagasdia':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const pag = new Date(c.dataPag);
          pag.setHours(0, 0, 0, 0);
          return !c.ativo && pag.getTime() === hoje.getTime();
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo cobranças pagas hoje';
        break;

      case 'vencidadia':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const venc = new Date(c.dataVenc);
          venc.setHours(0, 0, 0, 0);
          return c.ativo && venc.getTime() === hoje.getTime();
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Exibindo cobranças vencidas hoje';
        break;

      case 'vencidasSemPagamento':
        this.cobrancasFiltradas = this.allCobrancas.filter(c => {
          const venc = new Date(c.dataVenc);
          venc.setHours(0, 0, 0, 0);
          const tipo = (c.tipoCobr || '').toUpperCase();
          return c.ativo && venc <= hoje && formasIgnoradas.includes(tipo);
        });
        this.ordenarPorDataVencimento();
        this.mensagem = 'Cobranças vencidas com pagamento manual (DINHEIRO, CHEQUE, TRANSFERÊNCIA)';
        break;
    }
  }
  getCorTexto(idCompra: number): string {
    const ehVermelho = this.isSomaDasCobrancasDiferenteDaCompra(idCompra);
    console.log(`Cor do texto para idCompra ${idCompra}: ${ehVermelho ? 'red' : 'black'}`);
    return ehVermelho ? 'red' : 'blue';
  }
  isSomaDasCobrancasDiferenteDaCompra(idCompra: number): boolean {
    const compra = this.compras.find(c => c.id === idCompra);
    if (!compra) {

      return false;
    }

    const valorCompra = this.converterValorSeguro(compra.valorCompra);
    const valorFrete = this.converterValorSeguro(compra.valorFrete);
    const totalCompra = valorCompra + valorFrete;

    const cobrancasDaCompra = this.allCobrancas.filter(c => c.idCompra === idCompra);
    const somaCobrancas = cobrancasDaCompra.reduce((acc, c) => {
      return acc + this.converterValorSeguro(c.valorCobr);
    }, 0);

    const totalCompraArred = Math.round(totalCompra * 100) / 100;
    const somaCobrancasArred = Math.round(somaCobrancas * 100) / 100;




    return Math.abs(somaCobrancasArred - totalCompraArred) >= 0.01;
  }



  ngOnInit(): void {






    forkJoin({
      fornecedores: this.httpClient.get<any[]>(environment.financa + "/fornecedor").pipe(
        catchError(error => {
          console.error('Erro ao carregar fornecedores:', error);
          return of([]);
        })
      ),
      cobrancasApi: this.httpClient.get<any[]>(environment.financa + '/cobranca').pipe(
        catchError(error => {
          console.error('Erro ao carregar cobranças:', error);
          return of([]);
        })
      ),
      comprasApi: this.httpClient.get<any[]>(environment.financa + "/compras").pipe(
        catchError(error => {
          console.error('Erro ao carregar compras:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        this.fornecedor = results.fornecedores;
        this.compras = results.comprasApi;

        this.allCobrancas = results.cobrancasApi.map(cobranca => {
          const fornecedorEncontrado = this.fornecedor.find(f => f.id === cobranca.idForn);
          const nomeFornecedor = fornecedorEncontrado ? fornecedorEncontrado.fornecedo : '-';
          const compraRelacionada = this.compras.find(c => c.id === cobranca.idCompra);
          const numNotaCompra = compraRelacionada ? compraRelacionada.numNota : '-';
          const dataNotaCompra = compraRelacionada ? compraRelacionada.dataNota : null;



          return {
            ...cobranca,
            nomeFornecedor,
            numNota: numNotaCompra,
            dataNota: dataNotaCompra,
            dataCadastro: cobranca.dataCadastro,
            ativo: cobranca.dataPag == null ? 1 : 0
          };
        });

        this.route.queryParams.subscribe(params => {
          this.filtroIdCompraAtivo = params['idCompra'] || null;

          if (this.filtroIdCompraAtivo) {
            this.aplicarFiltroPorIdCompra(this.filtroIdCompraAtivo);
          } else {
            this.carregarCobrancasPorTipo('todos');
            this.route.queryParams.subscribe(params => {
              const filtroDashboard = params['filtroDashboard'];
              if (filtroDashboard) {
                this.aplicarFiltroDashboard(filtroDashboard);
              }
            });
          }
        });
        console.log('Total de cobranças carregadas:', this.allCobrancas.length);
        console.log('Dados iniciais carregados e processados no CobrancaComponent.');
      },
      error: (e) => {
        console.error('Erro ao carregar dados iniciais (forkJoin) no CobrancaComponent:', e);
      }
    });

    const modalComprasEl = document.getElementById('cadastrarCompras');
    if (modalComprasEl) {
      modalComprasEl.addEventListener('hidden.bs.modal', () => { });
    }
  }

  isVencidaOuHoje(dataVenc: string | Date, ativo: number, tipoCobr: string): boolean {
    if (!dataVenc || ativo === 0) return false;

    // Ignorar formas de pagamento específicas
    const formasIgnoradas = ['DINHEIRO', 'CHEQUE', 'TRANSFERÊNCIA'];
    if (formasIgnoradas.includes(tipoCobr?.toUpperCase())) return false;

    const hoje = new Date();
    const venc = new Date(dataVenc);

    hoje.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);

    return venc <= hoje;
  }


  carregarCobrancasPorTipo(tipo: 'ativo' | 'inativo' | 'todos') {
    let cobrancasParaFiltrar = [...this.allCobrancas]; // Usa allCobrancas aqui

    if (tipo === 'ativo') {
      cobrancasParaFiltrar = cobrancasParaFiltrar.filter(c => c.ativo === 1);
    } else if (tipo === 'inativo') {
      cobrancasParaFiltrar = cobrancasParaFiltrar.filter(c => c.ativo === 0);
    }

    this.cobrancasFiltradas = cobrancasParaFiltrar;
    this.ordenarPorDataVencimento();
    this.p = 1;
  }

  onFiltroCheck(): void {
    // Garante que só um checkbox pode ser marcado por vez (opcional)
    if (this.filtroAtivo) this.filtroInativo = false;
    else if (this.filtroInativo) this.filtroAtivo = false;

    this.filtrarCobranca();

    // Se tinha filtro de ID de compra ativo via rota, limpa
    if (this.filtroIdCompraAtivo) {
      this.router.navigate([], {
        queryParams: { idCompra: null },
        queryParamsHandling: 'merge'
      }).then(() => {
        this.filtroIdCompraAtivo = null;
        this.mensagem = '';
      });
    }
  }



  get cobrancasArrayForForm(): FormArray {
    return this.formCobrancas.get('cobrancas') as FormArray;
  }

  abrirModalCobranca(): void {

    this.cobrancasArrayForForm.clear();
    this.adicionarCobranca();
  }

  formatarDecimalParaReal(valor: number | string): string {
    if (valor == null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '';
    return num.toFixed(2).replace('.', ',');
  }
  converterValorSeguro(valor: any): number {
    if (valor === null || valor === undefined) return 0;

    if (typeof valor === 'number') return valor;

    // Trata string "199,00" ou "1.234,56"
    const num = this.converterRealParaDecimal(valor);
    return num ?? 0;
  }
  converterRealParaDecimal(valor: string): number | null {
    if (!valor) return null;
    const num = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

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

    if (this.cobrancasArrayForForm.length > 0) {
      const ultima = this.cobrancasArrayForForm.at(this.cobrancasArrayForForm.length - 1).value;

      dadosBase = {
        ...ultima,
        valorCobr: ultima.valorCobr,
        valorFrete: ultima.valorFrete,
        valorCompra: ultima.valorCompra,
      };

      const novoNumero = +ultima.parcela + 1;
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
      qtdParc: [''], // será preenchido logo abaixo
      loja: [dadosBase.loja],
      valorPago: [dadosBase.valorPago],
      valorCobr: [dadosBase.valorCobr], // preenchido manualmente depois
      dataVenc: ['', Validators.required],
      dataPag: [dadosBase.dataPag],
      valorFrete: [dadosBase.valorFrete],
      valorCompra: [dadosBase.valorCompra],
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

      const compra = this.compras.find(c => c.id == id);

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

    this.cobrancasArrayForForm.push(novaCobranca);

    const totalParcelas = this.cobrancasArrayForForm.length;
    this.cobrancasArrayForForm.controls.forEach(grupo => {
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

  onSubmit(): void {
    const formData = { ...this.form.value };
    delete formData.valorPago;

    if (typeof formData.valorCobr === 'string') {
      const cleaned = formData.valorCobr
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');
      formData.valorCobr = parseFloat(cleaned);
    }
    console.log('Form enviado:', this.form.value);

    this.httpClient.put(`${environment.financa}/cobranca`, formData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.router.navigate(['/cobranca']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar :', error);
          alert('Erro ao atualizar . Verifique os campos e tente novamente.');
        }
      });
  }

  CadastrarCompras(): void {
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

  CadastrarCobranca(): void {
    const cobrancasRaw = this.cobrancasArrayForForm.value || []; // Use the renamed getter

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
          this.cobrancasArrayForForm.clear(); // Use the renamed getter

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

  onConcluir(): void {
    const rawForm = this.form.value;

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
      dataPag: rawForm.dataPag,
      conta: rawForm.conta,
      formaPag: rawForm.formaPag
    };

    this.httpClient.put(`${environment.financa}/cobranca/baixa`, dadosParaEnviar)
      .subscribe({
        next: () => {
          this.httpClient.get(`${environment.financa}/cobranca/${rawForm.id}`)
            .subscribe({
              next: (cobrancaAtualizada: any) => {


                const fornecedorEncontrado = this.fornecedor.find(f => f.id === cobrancaAtualizada.idForn);
                const nomeFornecedor = fornecedorEncontrado ? fornecedorEncontrado.fornecedo : '-';

                const compraRelacionada = this.compras.find(c => c.id === cobrancaAtualizada.idCompra);
                const numNotaCompra = compraRelacionada ? compraRelacionada.numNota : '-';

                const cobrancaProcessada = {
                  ...cobrancaAtualizada,
                  nomeFornecedor,
                  numNota: numNotaCompra,
                  dataCadastro: cobrancaAtualizada.dataCadastro,
                  ativo: cobrancaAtualizada.dataPag == null ? 1 : 0
                };

                const indexAll = this.allCobrancas.findIndex(c => c.id === rawForm.id);
                if (indexAll !== -1) {
                  this.allCobrancas[indexAll] = cobrancaProcessada;
                }

                const indexFiltrada = this.cobrancasFiltradas.findIndex(c => c.id === rawForm.id);
                if (indexFiltrada !== -1) {
                  this.cobrancasFiltradas[indexFiltrada] = cobrancaProcessada;
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









  filtrarCobranca(): void {
    const termo = this.expression?.toLowerCase().trim() || '';
    const inicioStr = this.dataVencInicio;
    const fimStr = this.dataVencFim;

    this.cobrancasFiltradas = this.allCobrancas.filter(cobranca => {
      const contemTexto = termo === '' || Object.values(cobranca).some(value =>
       String(value).toLowerCase().includes(termo)
      );

      const dataVenc = cobranca.dataVenc ? new Date(cobranca.dataVenc) : null;
      let dataFimFiltrada: Date | null = null;
      let dataInicioFiltrada: Date | null = null;

      if (inicioStr) {
        dataInicioFiltrada = new Date(inicioStr);
      }

      if (fimStr) {
        dataFimFiltrada = new Date(fimStr);
        dataFimFiltrada.setDate(dataFimFiltrada.getDate() + 1);
      }

      const dentroDoPeriodo =
        (!dataInicioFiltrada || (dataVenc && dataVenc >= dataInicioFiltrada)) &&
        (!dataFimFiltrada || (dataVenc && dataVenc < dataFimFiltrada));

      const statusValido =
        (!this.filtroAtivo && !this.filtroInativo) ||
        (this.filtroAtivo && cobranca.ativo === 1) ||
        (this.filtroInativo && cobranca.ativo === 0);

      return contemTexto && dentroDoPeriodo && statusValido;
    });

    this.ordenarPorDataVencimento();
    this.p = 1;
  }



  onEdite(id: string): void {
    this.httpClient.get(environment.financa + "/cobranca/" + id)
      .subscribe({
        next: (data: any) => {
          // Formata para exibir no campo valorCobr
          const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(data.valorCobr);

          const valorNumerico = data.valorCobr;

          data.valorCobr = valorFormatado;

          if (data.dataVenc) {
            const venc = new Date(data.dataVenc);
            data.dataVenc = venc.toISOString().split('T')[0];
          }

          if (!data.dataPag) {
            const hoje = new Date();
            data.dataPag = hoje.toISOString().split('T')[0];
          }

          // Preenche os campos adicionais
          data.valorPago = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(valorNumerico);

          data.formaPag = data.tipoCobr;

          this.form.patchValue(data);
        },
        error: (e) => {
          console.log('Erro ao buscar Cobranças:', e.error);
        }
      });
  }


  ordenarPorDataVencimento(): void {
    this.cobrancasFiltradas.sort((a, b) => {
      const dataA = a.dataVenc ? new Date(a.dataVenc).getTime() : Infinity;
      const dataB = b.dataVenc ? new Date(b.dataVenc).getTime() : Infinity;

      return dataA - dataB;
    });
  }

  aplicarFiltroPorIdCompra(id: string): void {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      console.warn(`ID de compra inválido recebido: ${id}`);
      this.mensagem = 'ID de compra inválido para filtro.';
      this.filtroIdCompraAtivo = null;
      this.cobrancasFiltradas = [...this.allCobrancas];
      this.ordenarPorDataVencimento();
      return;
    }

    this.cobrancasFiltradas = this.allCobrancas.filter(cobranca => cobranca.idCompra === idNum);
    this.ordenarPorDataVencimento();
    this.p = 1;
    this.mensagem = `Exibindo cobranças da Compra ID: ${idNum}`;
    this.filtroIdCompraAtivo = id;
  }

  limparFiltroIdCompra(): void {
    this.filtroIdCompraAtivo = null;
    this.mensagem = '';
    this.cobrancasFiltradas = [...this.allCobrancas];
    this.ordenarPorDataVencimento();
    this.p = 1;
    this.router.navigate([], {
      queryParams: { idCompra: null },
      queryParamsHandling: 'merge'
    });
  }
  removerCobranca(index: number): void {
    this.cobrancasArrayForForm.removeAt(index);
  }

  removerUltimaCobranca(): void {
    if (this.cobrancasArrayForForm.length > 0) {
      this.cobrancasArrayForForm.removeAt(this.cobrancasArrayForForm.length - 1);
    }
  }
  onFecharAlerta(): void {
    if (this.filtroIdCompraAtivo) {
      this.limparFiltroIdCompra();
    } else {
      this.mensagem = '';
      this.cobrancasFiltradas = this.allCobrancas;
      this.router.navigate([], { queryParams: {} });
    }
  }


}
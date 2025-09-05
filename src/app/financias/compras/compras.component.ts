import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
declare var bootstrap: any;

@Component({
    selector: 'app-compras',
    imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
    templateUrl: './compras.component.html',
    styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit, AfterViewInit {
    [x: string]: any;
    loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
    mensagem: string | null = null;
    mensagemErro: string | null = null;
    p: number = 1;
    expression: string = '';
    compras: any[] = [];
    cobranca: any[] = [];
    fornecedor: any[] = [];
    comprasFiltradas: any[] = [];
    ultimaCompra: any = null;
    dataNotaInicio: string = '';
    dataNotaFim: string = '';
    observacaoSelecionada: any = {};
    selectedFornecedor: any = null;
    selectedEmpresaFrete: any = null;
    tipoFornec: string[] = ['DISTRIBUIDOR', 'FABRICA', 'DIST / FABR', 'TRANSPORTADORA'];
    formaPag: string[] = ['BOLETO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];


    private cobrancasPorCompraId: { [key: number]: any[] } = {};

    private cobrancasCarregadas: boolean = false;
    private comprasCarregadas: boolean = false;
    private fornecedoresCarregados: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private httpClient: HttpClient,
        private router: Router,
        private formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
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
            // Aqui uso a formatação:
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
    get cobrancas() {
        return this.formCobrancas.get('cobrancas') as FormArray;
    }

    getColor(index: number): string {
        return index % 2 === 0 ? '#8bc546' : '#ffffff';
    }

    limparPesquisa() {
        this.expression = '';
        this.filtrarCompras();
    }

    enriquecerComprasComFornecedores() {
        if (this.compras?.length && this.fornecedor?.length) {
            this.compras.forEach(compra => {
                const fornecedorRelacionado = this.fornecedor.find(f => f.id === compra.idForn);
                compra.nomeFornecedor = fornecedorRelacionado ? fornecedorRelacionado.fornecedo : 'Desconhecido';
            });
            this.comprasFiltradas = [...this.compras];
            console.log('📌 Compras com fornecedo:', this.compras);
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

    ngOnInit(): void {
        this.httpClient.get(environment.financa + "/compras")
            .subscribe({
                next: (comprasData) => {
                    this.compras = (comprasData as any[]).sort((a, b) =>
                        new Date(a.dataNota).getTime() - new Date(b.dataNota).getTime()
                    );
                    this.comprasFiltradas = [...this.compras];
                    console.log('📦 Compras carregadas e ordenadas:', this.compras);
                    this.comprasCarregadas = true;
                    this.verificarEInicializarPopovers();
                },
                error: (e) => {
                    console.log("Erro ao carregar compras:", e.error);
                }
            });

        this.httpClient.get(environment.financa + "/cobranca")
            .subscribe({
                next: (data) => {
                    this.cobranca = data as any[];
                    this.cobranca.forEach(cob => {
                        if (!this.cobrancasPorCompraId[cob.idCompra]) {
                            this.cobrancasPorCompraId[cob.idCompra] = [];
                        }
                        this.cobrancasPorCompraId[cob.idCompra].push(cob);
                    });
                    console.log('🧾 Cobranças carregadas e mapeadas:', this.cobrancasPorCompraId);
                    this.cobrancasCarregadas = true;
                    this.verificarEInicializarPopovers();
                },
                error: (e) => {
                    console.log("Erro ao carregar cobranças:", e.error);
                }
            });

        this.httpClient.get<any[]>(environment.financa + "/fornecedor")
            .subscribe({
                next: (fornecedoresData) => {
                    console.log('Fornecedores carregados:', fornecedoresData);
                    this.fornecedor = fornecedoresData;
                    this.fornecedoresCarregados = true;
                    this.verificarEInicializarPopovers();
                },
                error: (e) => {
                    console.log("Erro ao carregar fornecedores:", e.error);
                }
            });
    }

    ngAfterViewInit() {


    }
    valoresIguais(a: number, b: number): boolean {
        return a.toFixed(2) === b.toFixed(2);
    }
    onPageChange(newPage: number) {
        this.p = newPage;
        setTimeout(() => {
            this.initializePopovers();
        }, 1550);
    }

    verificarEInicializarPopovers() {
        if (this.comprasCarregadas && this.cobrancasCarregadas && this.fornecedoresCarregados) {
            this.enriquecerComprasComFornecedores();
            this.cdr.detectChanges();
            setTimeout(() => {
                this.initializePopovers();
            }, 100);
        }
    }

    initializePopovers() {
        const existingPopovers = document.querySelectorAll('[data-bs-toggle="popover"]');
        existingPopovers.forEach((el: any) => {
            const popoverInstance = bootstrap.Popover.getInstance(el);
            if (popoverInstance) {
                popoverInstance.dispose();
            }
        });

        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        console.log(`Encontrados ${popoverTriggerList.length} elementos para popover.`);
        popoverTriggerList.map(function (popoverTriggerEl: any) {
            return new bootstrap.Popover(popoverTriggerEl, {
                html: true,
                trigger: 'hover',
                placement: 'right'
            });
        });
        console.log('✅ Popovers inicializados ou re-inicializados!');
    }

    filtrarCompras(): void {
        const termo = this.expression.toLowerCase().trim();
        const inicioStr = this.dataNotaInicio;
        const fimStr = this.dataNotaFim;

        this.comprasFiltradas = this.compras.filter(p => {
            const contemTexto = Object.values(p).some(value =>
                String(value).toLowerCase().includes(termo)
            );
            const dataNotaValida = p.dataNota ? new Date(p.dataNota).toISOString().slice(0, 10) : '';
            const dentroDoPeriodo =
                (!inicioStr || dataNotaValida >= inicioStr) &&
                (!fimStr || dataNotaValida <= fimStr);
            return contemTexto && dentroDoPeriodo;
        });
        this.p = 1;
        setTimeout(() => {
            this.initializePopovers();
        }, 1550);
    }

    mostraObservacao(compras: any): void {
        this.observacaoSelecionada = compras;
        const modalElement = document.getElementById('modalObservacao');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    }

    // --- FUNÇÃO getCobrancasParaCompra MODIFICADA ---
    // ... (seu código existente)

    getCobrancasParaCompra(idCompra: number): string {
        const cobrancasRelacionadas = this.cobrancasPorCompraId[idCompra];
        let content = '';

        if (!cobrancasRelacionadas || cobrancasRelacionadas.length === 0) {
            content = 'Nenhuma cobrança registrada.';
        } else {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);



            const cobrancasOrdenadas = [...cobrancasRelacionadas].sort((a, b) => {
                const dateAValue = a.dataVenc;
                const dateBValue = b.dataVenc;

                const dateA = dateAValue ? new Date(dateAValue).getTime() : Infinity;
                const dateB = dateBValue ? new Date(dateBValue).getTime() : Infinity;

                // --- NOVO: LOG DA COMPARAÇÃO ---
                if (isNaN(dateA) || isNaN(dateB)) {
                    console.warn(`Data inválida encontrada na ordenação! A: ${dateAValue} (Convertido: ${dateA}), B: ${dateBValue} (Convertido: ${dateB})`);
                }

                return dateA - dateB;
            });




            content = '<ul style="list-style-type: none; padding: 0; margin: 0;">';
            cobrancasOrdenadas.forEach(cob => {
                const dataVencimentoObj = cob.dataVenc ? new Date(cob.dataVenc) : null;
                if (dataVencimentoObj) dataVencimentoObj.setHours(0, 0, 0, 0);

                const dataPagamentoObj = cob.dataPag ? new Date(cob.dataPag) : null;
                if (dataPagamentoObj) dataPagamentoObj.setHours(0, 0, 0, 0);

                const dataVencimentoStr = dataVencimentoObj ? dataVencimentoObj.toLocaleDateString('pt-BR') : 'N/A';
                const dataPagamentoStr = dataPagamentoObj ? dataPagamentoObj.toLocaleDateString('pt-BR') : 'N/A';

                const valor = cob.valorCobr ? cob.valorCobr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                const valorPago = cob.valorPago ? cob.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

                let vencimentoClass = '';
                let valorClass = '';
                let pagamentoClass = '';

                const estaPago = dataPagamentoObj !== null && dataPagamentoObj instanceof Date && !isNaN(dataPagamentoObj.getTime());

                if (!estaPago) {
                    if (dataVencimentoObj && dataVencimentoObj <= hoje) {
                        vencimentoClass = 'text-danger';
                        valorClass = 'text-danger';
                    }
                } else {
                    pagamentoClass = 'text-primary';
                }

                content += `<li>`;
                content += `<strong class="${valorClass}">Valor:</strong> <strong class="${valorClass}">R$ ${valor}</strong> <br>`;
                content += `<strong class="${vencimentoClass}">Vencimento:</strong> <strong class="${vencimentoClass}">${dataVencimentoStr}</strong><br>`;
                content += `<strong class="${pagamentoClass}">Pago dia:</strong> <strong class="${pagamentoClass}">${dataPagamentoStr}</strong> <br>`;
                content += `<strong class="${pagamentoClass}">Valor pago:</strong> <strong class="${pagamentoClass}">R$ ${valorPago}</strong> <br>-`;
                content += `</li>`;
            });
            content += '</ul>';
        }
        return content;
    }

    // ...
    trackByCompraId(index: number, compra: any): number {
        return compra.id;
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
    removerUltimaCobranca(): void {
        if (this.cobrancas.length > 0) {
            this.cobrancas.removeAt(this.cobrancas.length - 1);
        }
    }
    removerCobranca(index: number): void {
        this.cobrancas.removeAt(index);
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
    cancelarCriacaoCobranca(): void {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarCobranca'));
        modal?.hide(); // Fecha o modal
        location.reload(); // Recarrega a página
    }

    cadastrarCobranca(): void {


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
    atualizarCompra(id: number): void {
        const compra = this.compras.find(c => c.id === id);
        if (!compra) return;

        const nomeEmpresaForn = this.fornecedor.find(f => f.id === compra.idForn)?.empresa || '';
        const nomeEmpresaFrete = this.fornecedor.find(f => f.id === compra.idEmpFrete)?.empresa || '';

        this.formCompras.patchValue({
            idForn: nomeEmpresaForn,
            idEmpFrete: nomeEmpresaFrete,
            numNF: compra.numNF,
            numNota: compra.numNota,
            formaPag: compra.formaPag,
            formaPagFrete: compra.formaPagFrete,
            obs: compra.obs,
            valorNF: compra.valorNF,
            valorCompra: compra.valorCompra,
            valorFrete: compra.valorFrete,
            valorOutro: compra.valorOutro,
            loja: compra.loja,
            dataNota: compra.dataNota?.substring(0, 10),
            dataEntrega: compra.dataEntrega?.substring(0, 10)
        });

        // Salva o ID da compra para atualizar depois
        this.formCompras.addControl('id', this.formBuilder.control(id));
    }


    atualizar(): void {
        if (!this.formCompras.valid || !this.formCompras.value.id) return;

        const formData = { ...this.formCompras.value };

        formData.valorNF = formData.valorNF ? parseFloat((formData.valorNF + '').replace(',', '.')) : 0;
        formData.valorFrete = formData.valorFrete ? parseFloat((formData.valorFrete + '').replace(',', '.')) : 0;
        formData.valorCompra = formData.valorCompra ? parseFloat((formData.valorCompra + '').replace(',', '.')) : 0;
        formData.valorOutro = formData.valorOutro ? parseFloat((formData.valorOutro + '').replace(',', '.')) : 0;
        formData.dataNota = formData.dataNota || null;
        formData.dataEntrega = formData.dataEntrega || null;

        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'string') {
                formData[key] = formData[key].toUpperCase();
            }
        });
        const fornecedor = this.fornecedor.find(f => f.empresa === formData.idForn);
        const empresaFrete = this.fornecedor.find(f => f.empresa === formData.idEmpFrete);

        formData.idForn = fornecedor?.id || null;
        formData.idEmpFrete = empresaFrete?.id || 0;

        this.spinner.show();
        this.httpClient.put(environment.financa + "/compras/id", formData).subscribe({
            next: (data: any) => {
                this.spinner.hide();
                this.mensagem = "Compra atualizada com sucesso!";
                this.formCompras.reset();


                const modalElement = document.getElementById('atualizarCompra');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance?.hide();

                this.ngOnInit();

                setTimeout(() => this.mensagem = null, 4000);
            },
            error: (e) => {
                console.error("Erro ao atualizar:", e.error);
                this.spinner.hide();
                this.mensagemErro = e.error?.message || 'Erro inesperado ao atualizar.';
                setTimeout(() => this.mensagemErro = null, 5000);
            }
        });
    }

}
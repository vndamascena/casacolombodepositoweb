import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
declare var bootstrap: any;


@Component({
  selector: 'app-despesas',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.css'
})
export class DespesasComponent implements OnInit {

  mensagem: string | null = null;
  mensagemErro: string | null = null;
  p: number = 1;
  expression: string = '';
  despesasFiltradas: any[] = [];
  ultimaCompra: any = null;
  dataInicio: string = '';
  dataFim: string = '';
  despesas: any[] = [];
  tipoDespesa: string[] = ['COMBUSTÍVEL', 'CONTABILIDADE', 'DESINFETANTE E CLORO', 'INSUMOS', 'MECÂNICA', 'MERCADO', 'OBRA', 'REFEIÇÃO', 'SACOLAS', 'TRABALHO EXTRA', 'OUTROS',]
  formaPag: string[] = ['BOLETO', 'CARTÃO DE CREDITO', 'CHEQUE', 'DINHEIRO', 'TRANSFERÊNCIA', 'SEM COBRANÇA'];
  loja: string[] = ['JC1', 'VA', 'JC2', 'CL', 'CONSTRUTORA', 'OUTROS'];
  private DespesasCarregadas: boolean = false;


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
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  filtrarCompras(): void {
    const termo = this.expression.toLowerCase().trim();
    const inicioStr = this.dataInicio;
    const fimStr = this.dataFim;

    this.despesasFiltradas = this.despesas.filter(p => {
      const contemTexto = Object.values(p).some(value =>
        String(value).toLowerCase().includes(termo)
      );
      const dataNotaValida = p.dataCompra ? new Date(p.dataCompra).toISOString().slice(0, 10) : '';
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
  limparPesquisa() {
    this.expression = '';
    this.filtrarCompras();
  }
  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }

  ngOnInit(): void {
    this.httpClient.get(environment.financa + "/despesas")
      .subscribe({
        next: (comprasData) => {
          this.despesas = (comprasData as any[]).sort((a, b) =>
            new Date(a.dataCompra).getTime() - new Date(b.dataCompra).getTime()
          );
          this.despesasFiltradas = [...this.despesas];
          console.log('📦 Compras carregadas e ordenadas:', this.despesas);
          this.DespesasCarregadas = true;

        },
        error: (e) => {
          console.log("Erro ao carregar compras:", e.error);
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

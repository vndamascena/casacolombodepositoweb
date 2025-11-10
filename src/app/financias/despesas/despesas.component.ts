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
            new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime()
          );
          this.despesasFiltradas = [...this.despesas];
          
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
  onEdite(id: number): void {
    const despesa = this.despesas.find(c => c.id === id);
    if (!despesa) return;
   
  let valorFormatado = '';
  if (despesa.valor !== null && despesa.valor !== undefined) {
    const numero = Number(despesa.valor);
    if (!isNaN(numero)) {
      valorFormatado = numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }


          this.formDespesas.patchValue({
            id: despesa,

            nomeLocal: despesa.nomeLocal,
            nomeDespesa:despesa.nomeDespesa,
            quantidade:despesa.quantidade,
            observacao:despesa.observacao,
            valor:valorFormatado,
            dataCompra:despesa.dataCompra,
            formaPagamento:despesa.formaPagamento,
            loja:despesa.loja,



          });
          // Salva o ID da compra para atualizar depois
        this.formDespesas.addControl('id', this.formBuilder.control(id));
     
  }
Editar(): void {

  const formData = { ...this.formDespesas.value };
    

    if (typeof formData.valor === 'string') {
      const cleaned = formData.valor
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');
      formData.valor = parseFloat(cleaned);
    }
    console.log('Form enviado:', this.formDespesas.value);

    this.httpClient.put(`${environment.financa}/despesas`, formData)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.router.navigate(['/despesas']).then(() => {
          window.location.reload();
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar :', error);
          alert('Erro ao atualizar . Verifique os campos e tente novamente.');
        }
      });



}

}

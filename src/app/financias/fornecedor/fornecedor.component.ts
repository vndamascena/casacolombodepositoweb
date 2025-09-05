import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
declare var bootstrap: any;

@Component({
  selector: 'app-fornecedor',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './fornecedor.component.html',
  styleUrl: './fornecedor.component.css'
})
export class FornecedorComponent implements OnInit {

  mensagem: string | null = null;
  mensagemErro: string | null = null;
  fornecedores: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  fornecedor: any = {}
  p: number = 1;
  fornecedorForm: any;
  tipoFornec: string[] = ['DISTRIBUIDOR', 'FABRICA', 'DIST / FABR', 'TRANSPORTADORA'];
  observacaoSelecionada: any = {};

  formFornecedor: FormGroup = this.formBuilder.group({
    id: [''],
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





  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService


  ) { }

  get f(): any {
    return this.formFornecedor.controls;

  }
  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }


  ngOnInit(): void {
    this.httpClient.get<any[]>(environment.financa + '/fornecedor')
      .subscribe({
        next: (fornecedorData) => {
          console.log(fornecedorData); // Verifique a estrutura dos dados aqui
          this.fornecedores = fornecedorData;
        },
        error: (error) => {
          console.error('Erro ao carregar os fornecedores:', error);
        }
      });


  }
  limparPesquisa() {
    this.expression = '';
    this.filtrarFornecedores(); // Chama filtro com campo limpo
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
          }, 2000);
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
  filtrarFornecedores(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os fornecedores
      this.ngOnInit();
    } else {
      // Filtra os fornecedores com base na expressão de pesquisa
      this.fornecedores = this.fornecedores.filter(p =>
        Object.values(p).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(this.expression.toLowerCase())
        )
      );
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

  //função para obter os dados do fornecedor através do ID
  onEdite(id: string): void {
    console.log(id)
    this.httpClient.get(environment.financa + "/fornecedor/" + id)
      .subscribe({
        next: (data: any) => {
          this.formFornecedor.patchValue(data);  // Preenche o formulário com os dados recebidos
        },
        error: (e) => {
          console.log('Erro ao buscar fornecedor:', e.error);
        }
      });
  }


  onSubmit(): void {

    const formDataWithId = this.formFornecedor.value;


    this.httpClient.put(`${environment.financa}/fornecedor`, formDataWithId)
      .subscribe({
        next: (data: any) => {

          this.mensagem = data.message;
          this.router.navigate(['/fornecedor']).then(() => {
            window.location.reload();
            this.mensagem = data.message;
            window.location.reload();
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar fornecedor:', error);
          alert('Erro ao atualizar o fornecedor. Verifique os campos e tente novamente.');
        }
      });

  }

  mostraObservacao(compras: any): void {
    this.observacaoSelecionada = compras;
    const modalElement = document.getElementById('modalObservacao');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }
}




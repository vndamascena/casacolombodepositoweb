import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

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
    

    form: FormGroup = this.formBuilder.group({
        id: [''],
        nome: ['', Validators.required],
        vendedor: [''],
        forneProdu: [''],
        tipo: [''],
        telVen: [''],
        telFor: ['']
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

CadastrarFornecedo(): void {

    this.spinner.show();
    const formData = this.formFornecedor.value;


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

}

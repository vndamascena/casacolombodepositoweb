import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-cobranca',
    imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule],
    templateUrl: './cobranca.component.html',
    styleUrl: './cobranca.component.css'
})
export class CobrancaComponent implements OnInit{

    mensagem: string = '';
    cobrancas: any[] = []; 
    expression: string = ''; 
    cobranca: any = {}
    p: number = 1;
    cobrancarForm: any;

    form: FormGroup = this.formBuilder.group({
        id: [''],
        nome: ['', Validators.required],
        vendedor: [''],
        forneProdu: [''],
        tipo: [''],
        telVen: [''],
        telFor: ['']
    });
   constructor(
        private route: ActivatedRoute,
        private httpClient: HttpClient,
        private router: Router,
        private formBuilder: FormBuilder,

    ) { }
       get f(): any {
        return this.form.controls;

    }
  getColor(index: number): string {
        return index % 2 === 0 ? '#8bc546' : '#ffffff';
    }

      ngOnInit(): void {
            this.httpClient.get<any[]>(environment.financa + '/cobranca/ativo')
                .subscribe({
                    next: (cobrancaData) => {
                        console.log(cobrancaData); // Verifique a estrutura dos dados aqui
                        this.cobrancas = cobrancaData;
                    },
                    error: (error) => {
                        console.error('Erro ao carregar os Compras:', error);
                    }
                });
    
        }
    
    
        filtrarFornecedores(): void {
            if (this.expression.trim() === '') {
                // Se a expressão de pesquisa estiver vazia, recarrega todos os fornecedores
                this.ngOnInit();
            } else {
                // Filtra os fornecedores com base na expressão de pesquisa
                this.cobrancas = this.cobrancas.filter(p =>
                    Object.values(p).some(value =>
                        typeof value === 'string' && value.toLowerCase().includes(this.expression.toLowerCase())
                    )
                );
            }
        }
}

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
export class CobrancaComponent implements OnInit {

    mensagem: string = '';
    cobrancas: any[] = [];
    fornecedor: any[] = [];
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
  // 1. Carrega fornecedores primeiro
  this.httpClient.get<any[]>(environment.financa + "/fornecedor").subscribe({
    next: (fornecedoresData) => {
      console.log('Fornecedores carregados:', fornecedoresData); // 🔍 Log 1
      this.fornecedor = fornecedoresData;

      // 2. Depois, carrega cobranças
      this.httpClient.get<any[]>(environment.financa + '/cobranca/ativo').subscribe({
        next: (cobrancaData) => {
          console.log('Cobranças carregadas:', cobrancaData); // 🔍 Log 2

          // 3. Enriquecer as cobranças com nome do fornecedor
          this.cobrancas = cobrancaData.map(cobranca => {
            const fornecedorEncontrado = this.fornecedor.find(f => f.id === cobranca.idForn);
            const nomeFornecedor = fornecedorEncontrado ? fornecedorEncontrado.fornecedo : '-';

            console.log(`ID Fornecedor ${cobranca.idForn} => Nome: ${nomeFornecedor}`); // 🔍 Log 3

            return {
              ...cobranca,
              nomeFornecedor
            };
          });

          console.log('Cobranças final com nomeFornecedor:', this.cobrancas); // 🔍 Log 4
        },
        error: (error) => {
          console.error('Erro ao carregar as cobranças:', error);
        }
      });
    },
    error: (e) => {
      console.error('Erro ao carregar fornecedores:', e);
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

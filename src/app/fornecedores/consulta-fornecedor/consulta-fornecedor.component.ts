import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-consulta-fornecedor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './consulta-fornecedor.component.html',
  styleUrls: ['./consulta-fornecedor.component.css']
})
export class ConsultaFornecedorComponent implements OnInit {


  mensagem: string = '';
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
  spinner: any;


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,

  ) {   }



  get f(): any {
    return this.form.controls;

  }

  ngOnInit(): void {
    this.httpClient.get<any[]>(environment.ocorrencApi + '/fornecedorocorrencia')
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

  //função para obter os dados do fornecedor através do ID
  onEdite(id: string): void {


    //fazendo uma consulta na API do produto através do ID
    this.httpClient.get(environment.ocorrencApi + "/fornecedorocorrencia/" + id)
      .subscribe({
        next: (data: any) => {
          this.fornecedores = (data);
          this.form.patchValue(data); 
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }



  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }

  // Método para filtrar os fornecedores com base na expressão de pesquisa
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

  onSubmit(): void {

    const formDataWithId = this.form.value;

    
      this.httpClient.put(`${environment.ocorrencApi}/fornecedorocorrencia`, formDataWithId )
        .subscribe({
          next: (data: any) => {
           
            this.mensagem = data.message;
            this.router.navigate(['/consulta-fornecedor']).then(() => {
              window.location.reload();
              this.mensagem = data.message;
            });
          },
          error: (error) => {
            console.error('Erro ao atualizar fornecedor:', error);
            alert('Erro ao atualizar o fornecedor. Verifique os campos e tente novamente.');
          }
        });
    
  }
}

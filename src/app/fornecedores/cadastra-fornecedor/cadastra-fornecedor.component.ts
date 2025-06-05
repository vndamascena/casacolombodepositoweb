import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-cadastra-fornecedor',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxSpinnerModule],
    templateUrl: './cadastra-fornecedor.component.html',
    styleUrl: './cadastra-fornecedor.component.css'
})
export class CadastraFornecedorComponent  {

  matricula: string = ''; 
  senha: string = '';
  mensagem: string = '';
  cadastrafornecedor: any;
  fornecedor: any = {};



  constructor(
    private route: ActivatedRoute,
    private formBiulder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }



  form = new FormGroup({

    nome: new FormControl('',[Validators.required,]),
    vendedor: new FormControl('',[]),
    forneProdu: new FormControl('',[]),
    tipo: new FormControl('', []),
    telVen: new FormControl('',[]),
    telFor: new FormControl('', [])
    
    
   
    
  });





 



  onSubmit(): void {
    
      // Configuração dos parâmetros da solicitação PUT
      
      this.spinner.show();
      const formData = this.form.value;
      
      console.log('Form Data:', formData);
    // Se o FormArray 'lotes' não estiver vazio, envia o formulário para o servidor
    this.httpClient.post(environment.ocorrencApi  + "/fornecedorGeral", this.form.value)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message; // exibir mensagem de sucesso
          this.form.reset(); // limpar os campos do formulário
          
          this.spinner.hide();
          
        },
        error: (e) => {
          console.log(e.error);
          alert('Falha ao cadastrar o fornecedor. Verifique os campos preenchidos');
          this.spinner.hide();
        }
      });
  
  }


}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-editar-titulo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ReactiveFormsModule,NgxPaginationModule, NgxSpinnerModule,
    NgxImageZoomModule
  ],
  templateUrl: './editar-titulo.component.html',
  styleUrl: './editar-titulo.component.css'
})
export class EditarTituloComponent implements OnInit {


  mensagem: string = '';
  matricula: string = '';
  senha: string = '';
  titulo: any = {};
  tituloSelecionado: any;







  form: FormGroup = this.formBuilder.group({
    
    nomeCliente: [''],
  
    imagemUrl: [''],
    numeroNota: [''],
    valor: [''],
    loja: [''],
    vendedor:[''],
    telefone:[''],
    observacao: [''],
    dataVenda:[''],
    
  });



  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }


  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      
      nomeCliente: ['', [
        //campo 'nome'
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s]{4,100}$/)
      ]],
     
      numeroNota: [''],
     
    valor: [''],
    loja: [''],
    vendedor:[''],
    telefone:[''],
    observacao: [''],
    dataVenda:[''],
      

    });


    this.httpClient.get(`${environment.entregatitulo}/tituloreceber/${productId}`)
    .subscribe({
      next: (data: any) => {
        this.titulo = data;
        this.form.patchValue(data); // Preencher os outros campos do formulário

       
      },
      error: (error) => {
        console.error('Erro ao recuperar detalhes do produto:', error);
      }
    });


    
  }

  onSubmit(): void {
    const tituloId = this.route.snapshot.params['id'];
    const formDataWithId = { ...this.form.value, id: tituloId };

    if (this.matricula && this.senha) {
      // Configuração dos parâmetros da solicitação PUT
      const options = { params: { matricula: this.matricula, senha: this.senha } };

      this.httpClient.put(`${environment.entregatitulo}/tituloreceber`, formDataWithId, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message;
            //this.form.reset();
            this.router.navigate(['/consultar-titulo']);
            this.fecharFormularioCredenciais();
          },
          error: (error) => {
            console.error('Erro ao atualizar produto:', error);
            alert('Erro ao atualizar o produto. Verifique os campos e tente novamente.');
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
    }
  }

  atualizarValor(): void {
    const valorControl = this.form.get('valor');

    if (valorControl) {
      let valorValue = valorControl.value;

      // Verifica se o valor é uma string
      if (typeof valorValue === 'string') {
        // Substitui vírgulas por pontos para enviar o valor corretamente ao backend
        let valorNumerico = parseFloat(valorValue.replace(',', '.')) || 0;

        if (!isNaN(valorNumerico)) {
          // Formata o valor para exibição no frontend com vírgula
          const valorFormatado = valorNumerico.toFixed(2).replace('.', ',');
          valorControl.setValue(valorFormatado);

          // Se necessário, envie o valor numérico ao backend com ponto como separador decimal

        } else {
          valorControl.setValue('0,00');
        }
      } else {
        valorControl.setValue('0,00');
      }
    } else {
      console.error("O controle 'valor' é nulo.");
    }
  }

  abrirFormularioCredenciais(titulo: any): void {
    this.tituloSelecionado = titulo;
  }

  fecharFormularioCredenciais(): void {
    this.tituloSelecionado = null;
    this.matricula = '';
    this.senha = '';
  }






























}

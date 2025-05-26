import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-editar-entrega',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxSpinnerModule],
    templateUrl: './editar-entrega.component.html',
    styleUrl: './editar-entrega.component.css'
})
export class EditarEntregaComponent implements OnInit{
 
  mensagem: string = '';
  matricula: string = '';
  senha: string = '';
  ent: any;
  entrega: any = {};
  editarEntrega: any;
  diasSemana: string[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  periodo: string[] = ['Horário comercial', 'Manhã', 'Tarde', 'Diferênciado'];
  entregaId: number | null = null;
  showModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formBiulder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  form = new FormGroup({
    numeroNota: new FormControl('', [Validators.required]),
    nomeCliente: new FormControl(''),
    usuarioId: new FormControl(''),
    observacao: new FormControl(''),
    diaSemana: new FormControl(''),
    periodo: new FormControl('Horário comercial'),
    dataEntrega: new FormControl(''),
    
  });

  
  formm: FormGroup = this.formBiulder.group({
    
    nomeCliente: [''],
    numeroNota: [''],
    observacao: [''],
    dataEntrega:[''],
    diaSemana:[''],
    periodo:[''],
    
  });



  abrirFormularioCredenciais(entrega: any): void {
    this.editarEntrega = entrega;
  }

  fecharFormularioCredenciais(): void {
    this.editarEntrega = null;
    this.matricula = '';
    this.senha = '';
  }


  ngOnInit(): void {

    
    this.form.get('dataEditar')?.valueChanges.subscribe((date) => {
      if (date) {
        this.updateDayOfWeek(date);
      }
    });

    const productId = this.route.snapshot.params['id'];

    this.formm = this.formBiulder.group({
      
      nomeCliente: ['', [
        //campo 'nome'
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s]{4,100}$/)
      ]],
     
      numeroNota: [''],
      diasSemana:[''],
    observacao: [''],
    dataEntrega:[''],
    periodo:[''],
      

    });


    this.httpClient.get(`${environment.entregatitulo}/entrega/${productId}`)
    .subscribe({
      next: (data: any) => {
        this.entrega = data;
        this.form.patchValue(data); // Preencher os outros campos do formulário

       
      },
      error: (error) => {
        console.error('Erro ao recuperar detalhes do produto:', error);
      }
    });
  }

  onDateChange(event: any): void {
    const selectedDate = event.target.value;
    if (selectedDate) {
      this.updateDayOfWeek(selectedDate);
    }
  }

  updateDayOfWeek(dateString: string): void {
    const date = new Date(dateString + 'T00:00:00'); // Adicione a hora para garantir que a data esteja correta
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayOfWeek = daysOfWeek[date.getUTCDay()]; // Use getUTCDay() para evitar problemas de fuso horário
    this.form.get('diaSemana')?.setValue(dayOfWeek);
  }



  onSubmit(): void {
    const entregaId = this.route.snapshot.params['id'];
    const formDataWithId = { ...this.form.value, id: entregaId };
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      

      this.spinner.show();
      this.httpClient.put(environment.entregatitulo + "/entrega", formDataWithId, options)
        .subscribe({
          next: (data: any) => {
            console.log('Resposta do backend:', data);
            this.mensagem = data.message;
            this.entregaId = data.id;
            console.log('Entrega ID recebido:', this.entregaId); // Adicione este logve se 
            this.form.reset();
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            

          },
          error: (e) => {
            console.log(e.error);
            alert('Falha ao cadastrar a entrega. Verifique os campos preenchidos');
            this.spinner.hide();
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
      this.spinner.hide();
    }
  }

}

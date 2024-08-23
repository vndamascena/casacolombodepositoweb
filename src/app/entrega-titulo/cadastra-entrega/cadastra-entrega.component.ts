import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import Tesseract from 'tesseract.js';


@Component({
  selector: 'app-cadastra-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxSpinnerModule],
  templateUrl: './cadastra-entrega.component.html',
  styleUrls: ['./cadastra-entrega.component.css']
})
export class CadastraEntregaComponent implements OnInit {

  mensagem: string = '';
  matricula: string = '';
  senha: string = '';
  ent: any;
  entrega: any = {};
  cadastrarEntrega: any;
  imagemFile: File | null = null;
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
    valor: new FormControl(''),
    usuarioId: new FormControl(''),
    observacao: new FormControl(''),
    dataCadastro: new FormControl(''),
    vendedor: new FormControl(''),
    diaSemana: new FormControl(''),
    periodo: new FormControl('Horário comercial'),
    dataEntrega: new FormControl(''),
    loja: new FormControl('')
  });






  ngOnInit(): void {
    this.form.get('dataCadastro')?.valueChanges.subscribe((date) => {
      if (date) {
        this.updateDayOfWeek(date);
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
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      const formData = this.form.value;

      this.spinner.show();
      this.httpClient.post(environment.entregatitulo + "/entrega", formData, options)
        .subscribe({
          next: (data: any) => {
            console.log('Resposta do backend:', data);
            this.mensagem = data.message;
            this.entregaId = data.id;
            console.log('Entrega ID recebido:', this.entregaId); // Adicione este logve se 
            this.form.reset();
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            this.uploadImagem();

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


  abrirFormularioCredenciais(entrega: any): void {
    this.cadastrarEntrega = entrega;
  }

  fecharFormularioCredenciais(): void {
    this.cadastrarEntrega = null;
    this.matricula = '';
    this.senha = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagemFile = file;
    }
  }
  
  processFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const fileType = file.type;
  
      if (fileType.startsWith('image/jpeg') || fileType.startsWith('image/jpg') || 
          fileType.startsWith('image/png') || fileType.startsWith('image/bmp') || 
          fileType.startsWith('image/gif')) {
        this.extractTextFromImage(file);
      } else if (fileType.startsWith('text/html')) {
        this.extractTextFromHtml(file);
      } else {
        alert('Por favor, selecione um arquivo de imagem ou HTML.');
      }
      this.imagemFile = file;
    }
  }
  
  extractTextFromImage(file: File): void {
    Tesseract.recognize(file, 'eng', { logger: info => console.log(info) })
      .then(({ data: { text } }) => {
        this.preencherFormulario(text);
      })
      .catch(error => console.error(error));
  }
  
  extractTextFromHtml(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const extractedText = doc.body.textContent || '';
      this.preencherFormulario(extractedText);
    };
    reader.readAsText(file);
  }
  
  preencherFormulario(text: string): void {
    console.log(text);
  
    // Captura o nome do cliente
    const nomeMatch = text.match(/Nome:\s*(.*?)(?=\s*CPF|CRFICPY|cPFICNPU)/);
    const nome = nomeMatch ? nomeMatch[1].trim() : '';
    console.log('nome:', nome);
  
    // Captura o vendedor
    const vendedorMatch = text.match(/Vendedor.\s*([^\n]+)/);
    const vendedor = vendedorMatch ? vendedorMatch[1].trim() : '';
    console.log('vendedor:', vendedor);
  
    // Captura o número do documento antes da data
    const docMatch = text.match(/(?:N° DOC:|POC:|DOC:|OC:|oc\.|N DOC:|ie: N° DOC:|i"POC:|Casa Colombo oficial\s*\|,\s*|oc\.\s*|)\s*(\d{6,})(?:[^\d]*(?:\d{2}[\/]?\d{2}[\/]?\d{4}))/i);
    const DOC = docMatch ? docMatch[1].trim() : '';
    console.log('doc:', DOC);
  
    // Captura o valor líquido
    const valorLiquidoLinhaMatch = text.match(/Valor Liquido\s*([^\n]*)/);
    let valorLiquido = '';
    if (valorLiquidoLinhaMatch) {
      const valorLiquidoLinha = valorLiquidoLinhaMatch[1];
      const valorLiquidoMatch = valorLiquidoLinha.match(/R?\$?\s*([\d.,]+)\s*$/);
      valorLiquido = valorLiquidoMatch ? valorLiquidoMatch[1].replace('.', ',').replace(',', '.') : '';
    }
    console.log('valorliquido: ', valorLiquido);
  
    // Captura a observação
    const observacaoMatch = text.match(/Valor Liquido\s*R?\$?\s*[\d.,]+[^\n]*\n([^]*?)(?=ENTREGAS)/);
    const observacao = observacaoMatch ? observacaoMatch[1].trim() : '';
    console.log('observação:', observacao);
  
    const lojaMatch = text.match(/Casa Colombo\s*(\w+)/);
    let loja = lojaMatch ? lojaMatch[1].trim() : '';
  
    // Define o tipo de índice para o mapeamento de lojas
    const mapeamentoLojas: { [key: string]: string } = {
      '3C01': 'JC - 01', '3c01': 'JC - 01',
      '3c02': 'JC - 02',
      '3c03': 'VA - 01',  'VA': 'VA - 01',
      
     
      
      // Adicione outros códigos e nomes aqui, se necessário
    };
    console.log('loja:', loja);
  
    // Substitui o código da loja pelo nome correspondente
    loja = mapeamentoLojas[loja] || loja;
  
    // Atualiza o formulário
    this.form.patchValue({
      nomeCliente: nome,
      vendedor: vendedor,
      numeroNota: DOC,
      valor: valorLiquido,
      observacao: observacao,
      loja: loja,
    });
  }
  

  uploadImagem(): void {
    if (!this.imagemFile) {
      alert('Por favor, selecione uma imagem para a entrega cadastrada.');
      return;
    }

    if (this.entregaId === null || this.entregaId === undefined) {
      alert('O ID da entrega não está disponível. Por favor, cadastre a entrega primeiro.');
      console.log('Entrega ID está nulo ou indefinido:', this.entregaId);
      return;
    }

    const formData = new FormData();
    formData.append('imageFile', this.imagemFile as Blob);

    this.spinner.show();

    this.httpClient.post(`${environment.entregatitulo}/entrega/upload?entregaId=${this.entregaId}`, formData)
      .subscribe({
        next: (data: any) => {
          console.log('Imagem enviada com sucesso:', data);
          this.mensagem = 'Imagem enviada com sucesso!';
          this.spinner.hide();

          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

          this.imagemFile = null;
          this.spinner.hide();
          window.location.reload();
        },
        error: (e) => {
          console.log('Erro ao enviar a imagem:', e.error);
          alert('Erro ao enviar a imagem. Tente novamente.');
          this.spinner.hide();
        }
      });
  }
}
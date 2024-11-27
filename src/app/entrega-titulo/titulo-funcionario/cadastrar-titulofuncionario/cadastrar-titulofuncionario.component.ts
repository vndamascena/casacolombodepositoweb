import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../environments/environment.development';
import Tesseract from 'tesseract.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastrar-titulofuncionario',
  standalone: true,
  imports: [

    CommonModule, FormsModule,
    ReactiveFormsModule, RouterModule, NgxSpinnerModule

  ],
  templateUrl: './cadastrar-titulofuncionario.component.html',
  styleUrl: './cadastrar-titulofuncionario.component.css'
})
export class CadastrarTitulofuncionarioComponent implements OnInit {


  mensagem: string = '';
  matricula: string = '';
  senha: string = '';
  tit: any;
  titulo: any = {};
  cadastrarTitulo: any;
  imagemFile: File | null = null;
  tituloId: number | null = null;
  showModal: boolean = false;


  form = new FormGroup({
    numeroNota: new FormControl('', [Validators.required]),
    nomeCliente: new FormControl(''),
    valor: new FormControl(''),
    usuarioId: new FormControl(''),
    observacao: new FormControl(''),
    dataCadastro: new FormControl(''),
    vendedor: new FormControl(''),
    loja: new FormControl(''),
    dataVenda: new FormControl(''),
    dataPrevistaPagamento: new FormControl(''),
   
  });


  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }


  

  ngOnInit(): void {
    this.configurarDataPagamento();
  }
  configurarDataPagamento(): void {
    const currentDate = new Date(); // Data atual
    const paymentDate = new Date(); 
    paymentDate.setDate(currentDate.getDate() + 30); // Adiciona 30 dias à data atual
  
    this.form.patchValue({
     
      dataPrevistaPagamento: paymentDate.toISOString().split('T')[0] // Preenche com a data padrão de pagamento
    });
  }

  onSubmit(): void {
    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };
      const formData = this.form.value;

      this.spinner.show();
      this.httpClient.post(environment.entregatitulo + "/tituloReceberfuncionario", formData, options)
        .subscribe({
          next: (data: any) => {
            console.log('Resposta do backend:', data);
            this.mensagem = data.message;
            this.tituloId = data.id;
            console.log('Entrega ID recebido:', this.tituloId); // Adicione este logve se 
            this.form.reset();
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            this.uploadImagem();
            this.configurarDataPagamento();

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
    this.cadastrarTitulo = titulo;
  }

  fecharFormularioCredenciais(): void {
    this.cadastrarTitulo = null;
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
    const vendedorMatch = text.match(/Vendedor\s*([^\|]+)/i);
    const vendedor = vendedorMatch ? vendedorMatch[1].trim() : '';
    console.log('vendedor:', vendedor);

    // Captura o número do documento antes da data
    const docMatch = text.match(/(?:N° DOC:|POC:|DOC:|OC:|oc\.|N DOC:|ie: N° DOC:|i"POC:|Casa Colombo oficial\s*\|,\s*|oc\.\s*|)\s*(\d{6,})(?:[^\d]*(?:\d{2}[\/]?\d{2}[\/]?\d{4}))/i);
    const DOC = docMatch ? docMatch[1].trim() : '';
    console.log('doc:', DOC);


    // Captura a data logo após o número do documento
    const dataMatch = text.match(/(?:N° DOC:|POC:|DOC:|OC:|oc\.|N DOC:|ie: N° DOC:|i"POC:|Casa Colombo oficial\s*\|,\s*|oc\.\s*|)\s*\d{6,}[^\d]*(\d{2}\/\d{2}\/\d{4})/i);
    const data = dataMatch ? dataMatch[1].trim() : '';
    console.log('data:', data);

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

    const lojaMatch = text.match(/Vendedor\s*[^|]*\|\s*(\w+)/);
    let loja = lojaMatch ? lojaMatch[1].trim() : '';

    // Define o tipo de índice para o mapeamento de lojas
    const mapeamentoLojas: { [key: string]: string } = {
      'JCO1': 'JC1',
      'JCO2': 'JC2',
      'VA': 'VA',
      // Adicione outros códigos e nomes aqui, se necessário
    };

     
     const telefoneMatch = text.match(/Compl[^\d]*TEL:\s*(\d{8,12})(?=\s*Vendedor)/);
     const telefone = telefoneMatch ? telefoneMatch[1].trim() : '';
     
console.log('telefone:', telefone);

  

    console.log('loja:', loja);

    // Substitui o código da loja pelo nome correspondente
    loja = mapeamentoLojas[loja] || loja;

    // Atualiza o formulário
    this.form.patchValue({
      nomeCliente: nome,
      vendedor: vendedor,
      numeroNota: DOC,
      dataVenda: data,
      valor: valorLiquido,
      observacao: observacao,
      loja: loja,
      
    });
    
  }


  uploadImagem(): void {
    if (!this.imagemFile) {
      alert('Por favor, selecione uma imagem para o titulo cadastrada.');
      return;
    }

    if (this.tituloId === null || this.tituloId === undefined) {
      alert('O ID do título não está disponível. Por favor, cadastre a entrega primeiro.');
      console.log('Título ID está nulo ou indefinido:', this.tituloId);
      return;
    }

    const formData = new FormData();
    formData.append('imageFile', this.imagemFile as Blob);

    this.spinner.show();

    this.httpClient.post(`${environment.entregatitulo}/tituloReceberFuncionario/upload?tituloId=${this.tituloId}`, formData)
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
         
        },
        error: (e) => {
          console.log('Erro ao enviar a imagem:', e.error);
          alert('Erro ao enviar a imagem. Tente novamente.');
          this.spinner.hide();
        }
      });
  }





}

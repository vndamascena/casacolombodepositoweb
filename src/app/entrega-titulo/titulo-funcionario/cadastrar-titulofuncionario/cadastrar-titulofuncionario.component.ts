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
  
      // Permitir qualquer entrada no campo
      if (typeof valorValue === 'string') {
        
        const valorSomenteNumeros = valorValue.replace(/[^0-9,]/g, '').replace(',', '.');
        const valorNumerico = parseFloat(valorSomenteNumeros);
  
        if (!isNaN(valorNumerico)) {
          // Formata o valor para o padrão brasileiro ao final da digitação
          const valorFormatado = valorNumerico
            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace('.', ','); // Garante que o separador decimal seja vírgula
  
          
        }
       
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

  if (!input.files?.length) return;

  const file = input.files[0];
  const fileType = file.type;

  this.imagemFile = file;

  // 🟢 IMAGEM → mantém como está
  if (
    fileType.startsWith('image/jpeg') ||
    fileType.startsWith('image/jpg') ||
    fileType.startsWith('image/png') ||
    fileType.startsWith('image/bmp') ||
    fileType.startsWith('image/gif')
  ) {
    this.extractTextFromImage(file);
    return;
  }

  // 🟢 PDF → envia para backend
  if (fileType === 'application/pdf') {
    this.processarPdfNoBackend(file);
    return;
  }

  alert('Formato não suportado.');
}
processarPdfNoBackend(file: File): void {
  const formData = new FormData();
  formData.append('arquivo', file);

  this.httpClient
    .post<any>(
      environment.entregatitulo + '/tituloReceberFuncionario/extrairTextoPdf',
      formData
    )
    .subscribe({
      next: (res) => {
        this.preencherFormularioPdf(res.textoExtraido);
      },
      error: () => {
        alert('Erro ao processar PDF');
      }
    });
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

preencherFormularioPdf(text: string): void {
  console.log('OCR PDF RAW:', text);

  // ===============================
  // NOME (mesma linha OU linha abaixo)
  // ===============================
  let nome = '';

  const nomeLinhaUnica = text.match(/Nome:\s*(.+)/i);
  if (nomeLinhaUnica && nomeLinhaUnica[1].trim().length > 3) {
    nome = nomeLinhaUnica[1].trim();
  } else {
    const nomeLinhaSeguinte = text.match(/Nome:\s*\n\s*(.+)/i);
    nome = nomeLinhaSeguinte ? nomeLinhaSeguinte[1].trim() : '';
  }

  // ===============================
  // DOCUMENTO
  // ===============================
  const docMatch = text.match(/N[°º]?\s*DOC:\s*(\d{6,})/i);
  const DOC = docMatch ? docMatch[1] : '';

  // ===============================
  // DATA
  // ===============================
  const dataMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  const data = dataMatch ? dataMatch[1] : '';

  // ===============================
  // VENDEDOR (para na quebra de linha)
  // ===============================
 const vendedorMatch = text.match(
  /Vendedor\s+([A-ZÀ-Ú\s]+?)(?=\s*(?:I|\||\-)?\s*(?:JC0[1-9]|VA|CL)|\n)/i
);

const vendedor = vendedorMatch ? vendedorMatch[1].trim() : '';

  // ===============================
  // VALOR LÍQUIDO
  // ===============================
  const valorMatch = text.match(/Valor\s*L[ií]quido\s*R?\$?\s*([\d.,]+)/i);
  const valorLiquido = valorMatch ? valorMatch[1] : '';

  // ===============================
  // LOJA
  // ===============================

let loja = '';

const lojaMatch = text.match(
  /Vendedor\s+[A-ZÀ-Ú\s]+[\s\S]{0,1200}?\b(?:I|\||\-)?\s*(JC[1-9]|VA|CL)\b/i
);

if (lojaMatch) {
  loja = lojaMatch[1].toUpperCase();
}


let observacao = '';

const obsMatch = text.match(
  /Valor\s*L[ií]quido[\s\S]*?\n([\s\S]*?)(?=\nENTREGAS\s+EM\s+HOR)/i
);

if (obsMatch) {
  observacao = obsMatch[1]
    .replace(/\n{2,}/g, '\n')
    .trim();
}


  console.log({
    nome,
    vendedor,
    DOC,
    data,
    valorLiquido,
    loja,
    observacao
  });

  // ===============================
  // PATCH FORM
  // ===============================
  this.form.patchValue({
    nomeCliente: nome,
    vendedor: vendedor,
    numeroNota: DOC,
    dataVenda: data,
    valor: valorLiquido,
    loja: loja
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
    const isPdf = this.imagemFile.type === 'application/pdf';

    // 🔹 MANTÉM O PADRÃO ANTIGO PARA IMAGEM
    if (isPdf) {
      formData.append('arquivo', this.imagemFile);
    } else {
      formData.append('imageFile', this.imagemFile);
    }

    this.spinner.show();
    const url = isPdf
      ? `${environment.entregatitulo}/tituloReceberFuncionario/uploadDocumento?tituloId=${this.tituloId}`
      : `${environment.entregatitulo}/tituloReceberFuncionario/upload?tituloId=${this.tituloId}`;

    this.httpClient.post(url, formData).subscribe({
      next: (data: any) => {
        console.log('Arquivo enviado com sucesso:', data);
        this.mensagem = 'Arquivo enviado com sucesso!';
        this.resetarFileInput();
        this.spinner.hide();
      },
      error: (e) => {
        console.error('Erro ao enviar arquivo:', e);
        alert('Erro ao enviar o arquivo.');
        this.spinner.hide();
      }
    });
  }

  private resetarFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.imagemFile = null;
  }



}

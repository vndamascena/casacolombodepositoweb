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
    loja: new FormControl(''),
    dataVenda: new FormControl('')
  });

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
      environment.entregatitulo + '/entrega/extrairTextoPdf',
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
      'CL': 'CL',
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

// ===============================
// LOJA (regra definitiva)
// ===============================
let loja = '';

// 1️⃣ tenta pegar loja colada no VENDEDOR (caso bom)
const lojaComVendedor = text.match(
  /Vendedor\s+[A-ZÀ-Ú\s]+.*?(?:\||\-|I)\s*(JC0?1|JC0?2|VA|CL)\b/i
);

if (lojaComVendedor) {
  loja = lojaComVendedor[1]
    .replace(/^0/, '')
    .toUpperCase();
}

// 2️⃣ fallback: pegar ÚLTIMA ocorrência de JC / VA (IGNORA CL)
if (!loja) {
  const lojasEncontradas = [...text.matchAll(
    /\bI?\s*(JC0?1|JC0?2|VA)\b/gi
  )];

  if (lojasEncontradas.length) {
    loja = lojasEncontradas[lojasEncontradas.length - 1][1]
      .replace(/^0/, '')
      .toUpperCase();
  }
}




let observacao = '';

const limparObservacao = (raw: string): string => {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l =>
      l &&

      // valores
      !/^R?\$?\s*\d+[.,]\d+/.test(l) &&

      // UF / loja
      !/^RJ$/.test(l) &&
      !/^I\s*JC\d+/i.test(l) &&

      // colunas
      !/^VI\s+L[ií]q/i.test(l) &&
      !/^Vl\s+Uni/i.test(l) &&
      !/^VI\s+Uni$/i.test(l) &&
      !/^Desc$/i.test(l) &&
      !/^IVA$/i.test(l) &&

      // cabeçalho
      !/^Casa\s+Colombo/i.test(l) &&
      !/^Av\./i.test(l) &&
      !/^CNPJ/i.test(l) &&

      // endereço numérico (👈 ESTE É O QUE RESOLVE SEU CASO)
      !(/^\d+\s+[A-ZÀ-Úa-zà-ú\s.-]+-\s*[A-Z]{1,3}$/i.test(l)) &&

      // telefones
      !/^0?\s*\(?\d{2}\)?\s?\d{4,5}-\d{4}/.test(l) &&

      // data + hora
      !/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(l) &&

      // cidade
      !/^Cidade:/i.test(l)
    )
    .join('\n')
    .trim();
};



const obsFreteMatch = text.match(
  /Valor\s+Frete\s*\n([\s\S]*?)(?=\n(?:Casa\s+Colombo|Valor\s+L[ií]quido))/i
);

if (obsFreteMatch) {
  observacao = limparObservacao(obsFreteMatch[1]);
}

// ---------- 2️⃣ fallback: após VALOR LÍQUIDO ----------
if (!observacao) {
  const obsLiquidoMatch = text.match(
    /Valor\s*L[ií]quido[\s\S]*?\n([\s\S]*?)(?=\nENTREGAS\s+EM\s+HOR[ÁA]RIO\s+COMERCIAL)/i
  );

  if (obsLiquidoMatch) {
    observacao = limparObservacao(obsLiquidoMatch[1]);
  }
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
    observacao: observacao,
    loja: loja
  });
}


uploadImagem(): void {
  if (!this.imagemFile) {
    alert('Por favor, selecione um arquivo.');
    return;
  }

  if (this.entregaId === null || this.entregaId === undefined) {
    alert('O ID da entrega não está disponível. Cadastre a entrega primeiro.');
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
    ? `${environment.entregatitulo}/entrega/uploadDocumento?entregaId=${this.entregaId}`
    : `${environment.entregatitulo}/entrega/upload?entregaId=${this.entregaId}`;

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
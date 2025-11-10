import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-consultar-titulofuncionario',
    imports: [
        CommonModule, FormsModule, RouterModule,
        ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule,
        NgxImageZoomModule
    ],
    templateUrl: './consultar-titulofuncionario.component.html',
    styleUrl: './consultar-titulofuncionario.component.css'
})
export class ConsultarTitulofuncionarioComponent implements OnInit{

  currentForm: 'baixaTitulo' | null = null;
  currentFormi:'concluirSelecionados' | null = null;
  p: number = 1;
  mensagem: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  titulos: any[] = [];
  titulo: any = {};
  tit: any;
  clientes: any[] = []
  imagemAmpliadaUrl: string | null = null;
  zoomLevel: string = 'scale(1)';
  matricula: string = '';
  senha: string = '';
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  baixaTitulo: any;

  idBaixaTitulo: number | null = null;
  originalTitulos: any[] = [];
  expression: string = '';
  selecionados: number[] = [];

  formi = new FormGroup({
    numeroNota: new FormControl('', [Validators.required]),
    nomeCliente: new FormControl(''),
    valor: new FormControl(''),
    usuarioId: new FormControl(''),
    observacao: new FormControl(''),
    dataVenda: new FormControl(''),
    vendedor: new FormControl(''),
    loja: new FormControl(''),
   
    dataPrevistaPagamento: new FormControl(''),



  });


  form: FormGroup = this.formBiulder.group({
    id: [''],
    numeroNota: ['', Validators.required],
    nomeCliente: [''],
    valor: [''],
    usuarioId: [''],
    observacao: [''],
    dataVenda: [''],
    vendedor: [''],
    loja: [''],
   
    dataPrevistaPagamento:[''],


  });


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }

  getRowClass(i: number): string {
    return i % 2 === 0 ? 'row-even' : 'row-odd';
  }

  getTextColorClass(i: number, dataVenda: string, dataPrevistaPagamento: string): string {
    // Converte as datas do formato DD/MM/YYYY para Date
    const dataVendaDate = new Date(dataVenda.split('/').reverse().join('-'));  // Formato DD/MM/YYYY para Date
    const dataPrevistaPagamentoDate = new Date(dataPrevistaPagamento.split('/').reverse().join('-'));
    
    // Cria uma nova data para 30 dias após a data de venda
    const limiteDate = new Date(dataVendaDate);
    limiteDate.setDate(limiteDate.getDate() + 31);  // Adiciona 30 dias à data de venda
    
    // Obtém a data atual
    const currentDate = new Date();
    
    // Verifica se a data prevista de pagamento está mais de 30 dias após a data de venda
    // ou se a data atual já passou da data prevista de pagamento
    if (dataPrevistaPagamentoDate > limiteDate || currentDate > dataPrevistaPagamentoDate) {
      return 'text-red';  // Se estiver mais de 30 dias após a data de venda ou se já passou da data prevista
    }
    
    // Caso contrário, mantém a cor preta
    return 'text-black';
  }
  
  filtrarTitulo(): void {
    if (this.expression.trim() === '') {
      // Exibe todos os títulos, recriando a estrutura agrupada por clientes
      this.titulos = [...this.originalTitulos];
      this.categorizarTitulosPorCliente(); // Recria os clientes agrupados
    } else {
      // Filtra os títulos com base na expressão
      const titulosFiltrados = this.originalTitulos.filter(titulo =>
        Object.values(titulo).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(this.expression.toLowerCase());
          } else if (typeof value === 'number') {
            return value.toString().includes(this.expression);
          }
          return false;
        })
      );
  
      // Reagrupa os títulos filtrados por cliente
      this.titulos = titulosFiltrados;
      this.categorizarTitulosPorCliente(); // Recria os clientes agrupados
    }
  }
  

  
getSomaValores(titulos: any[]): number {
  const total = titulos.reduce((total, titulo) => {
    // Remove o ponto (separador de milhar) e substitui a vírgula por ponto (para parseFloat funcionar)
    const valorNumerico = parseFloat(titulo.valor.replace(/\./g, '').replace(',', '.')) || 0;
    return total + valorNumerico;
  }, 0);

  const totalComDesconto = total * 0.85; // Aplica 15% de desconto
  return totalComDesconto;
}
  
  limparPesquisa() {
  this.expression = '';
  this.filtrarTitulo(); // Chama filtro com campo limpo
}
  


  convertToBrazilTime(date: Date): Date {
    const pstDate = new Date(date);
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);
    return brazilTime;
  }



  loadUserName(tituloo: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${tituloo.usuarioId}`)
      .subscribe({
        next: (userData) => {
          tituloo.nome = userData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
  }
  ngOnInit(): void {
    console.log('ngOnInit iniciado'); // Log inicial para rastrear a execução do método

    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const ocorrencId = this.route.snapshot.queryParams['id'];
    console.log('Parâmetro id:', ocorrencId); // Verificar se o parâmetro 'id' está sendo capturado

    if (ocorrencId) {
        console.log('Buscando títulos específicos com id:', ocorrencId);
        this.httpClient.get<any[]>(`${environment.entregatitulo}tituloreceberfuncionario/${ocorrencId}`)
            .subscribe({
                next: (titulosData) => {
                    console.log('Dados recebidos do backend:', titulosData); // Log dos dados recebidos
                    
                    this.titulos = titulosData.map(titulo => {
                        console.log('Processando título:', titulo); // Log para cada título processado
                        titulo.dataTime = this.convertToBrazilTime(new Date(titulo.dataTime));
                        this.loadUserName(titulo);
                        return titulo;
                    });

                    // Ordenar por cliente em ordem alfabética
                    this.titulos.sort((a, b) => {
                        if (a.nomeCliente && b.nomeCliente) {
                            return a.nomeCliente.localeCompare(b.nomeCliente);
                        }
                        return 0; // Mantém a ordem se clienteNome não for definido
                    });
                    this.categorizarTitulosPorCliente();

                    this.originalTitulos = [...this.titulos];
                    console.log('Títulos processados e ordenados por cliente:', this.titulos);
                },
                error: (error) => {
                    console.error('Erro ao carregar os títulos com id:', error); // Log em caso de erro
                }
            });
    } else {
        console.log('Buscando todos os títulos');
        this.httpClient.get<any[]>(`${environment.entregatitulo}/tituloreceberfuncionario`)
            .subscribe({
                next: (titulosData) => {
                    console.log('Dados recebidos do backend:', titulosData); // Log dos dados recebidos

                    this.titulos = titulosData.map(titulo => {
                        console.log('Processando título:', titulo); // Log para cada título processado
                        titulo.dataTime = this.convertToBrazilTime(new Date(titulo.dataTime));
                        this.loadUserName(titulo);
                        return titulo;
                    });

                    // Ordenar por cliente em ordem alfabética
                    this.titulos.sort((a, b) => {
                        if (a.nomeCliente && b.nomeCliente) {
                            return a.nomeCliente.localeCompare(b.nomeCliente);
                        }
                        return 0; // Mantém a ordem se clienteNome não for definido
                    });
                    this.categorizarTitulosPorCliente();
                    this.originalTitulos = [...this.titulos];
                    console.log('Títulos processados e ordenados por cliente:', this.titulos);
                },
                error: (error) => {
                    console.error('Erro ao carregar os títulos:', error); // Log em caso de erro
                }
            });
    }
}
categorizarTitulosPorCliente(): void {
  const titulosPorCliente: { [key: string]: any[] } = {};

  // Agrupar os títulos por cliente
  this.titulos.forEach(titulo => {
    if (!titulosPorCliente[titulo.nomeCliente]) {
      titulosPorCliente[titulo.nomeCliente] = [];
    }
    titulosPorCliente[titulo.nomeCliente].push(titulo);
  });

  // Agora, iteramos sobre os clientes para definir a contagem
  this.clientes = Object.keys(titulosPorCliente).map(nomeCliente => {
    return {
      nomeCliente: nomeCliente,
      titulos: titulosPorCliente[nomeCliente], // Todos os títulos do cliente
      contagemTotal: titulosPorCliente[nomeCliente].length, // Contagem total de títulos do cliente
      exibir: false
    };
  });

  // Ordenar os clientes por nome
  this.clientes.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente));

  console.log('Clientes organizados:', this.clientes);
}

contarTitulosPorCliente(titulos: any[]): any[] {
  const clientesContabilizados: { [key: string]: boolean } = {};
  const titulosUnicas: any[] = [];

  titulos.forEach(titulo => {
    if (!clientesContabilizados[titulo.nomeCliente]) {
      clientesContabilizados[titulo.nomeCliente] = true;
      titulosUnicas.push(titulo);
    }
  });

  return titulosUnicas;
}
  
  toggleTable(cliente: any) {
    cliente.exibir = !cliente.exibir;
  }
  toggleSection(cliente: any, section: string) {
    cliente[section] = !cliente[section];
  }
  clienteAutenticacaoVisivel: string | null = null;
  clienteAutenticado: string | null = null;
  mensagemErroAutenticacao: string | null = null;
  mensagemErroAutenticacaoEspecifica: string = '';

  abrirFormularioAutenticacao(cliente: any) {
    if (this.clienteAutenticado === cliente.nomeCliente) {
      this.clienteAutenticado = null; // Desautentica se já estava autenticado
    } else {
      this.clienteAutenticacaoVisivel = cliente.nomeCliente;
      this.mensagemErroAutenticacao = null;
      this.mensagemErroAutenticacaoEspecifica = '';
    }
  }

  fecharFormularioAutenticacao() {
    this.clienteAutenticacaoVisivel = null;
    this.mensagemErroAutenticacao = null;
    this.mensagemErroAutenticacaoEspecifica = '';
  }

 autenticarCliente(cliente: any, matriculaDigitada: string, senhaDigitada: string) {
  // Lista de usuários especiais que podem acessar a rota admin
  const usuariosEspeciais = [
    { matricula: 'admin', senha: '2525' },
    { matricula: '1', senha: '5555' },
    { matricula: '2', senha: '1470' }
  ];

  // Verifica se é um dos usuários especiais
  const isUsuarioEspecial = usuariosEspeciais.some(
    (user) =>
      matriculaDigitada.toLowerCase() === user.matricula &&
      senhaDigitada === user.senha
  );

  // Define a rota da API conforme o tipo de usuário
  let apiUrl = `${this.userApiUrl}/autenticar`;
  if (isUsuarioEspecial) {
    apiUrl = `${this.userApiUrl}/autenticaradmin`;
  }

  const body = {
    matricula: matriculaDigitada,
    senha: senhaDigitada,
  };

  console.log('Tentando autenticar...');
  console.log('matriculaDigitada:', matriculaDigitada);
  console.log('isUsuarioEspecial:', isUsuarioEspecial);

  this.httpClient.post<any>(apiUrl, body).subscribe(
    (response) => {
      console.log('Resposta da API:', response);
      if (response && response.id) {
        const nomeUsuarioAPI = response.nome ? response.nome.toLowerCase() : '';
        const nomeCliente = cliente.nomeCliente.toLowerCase();

        if (isUsuarioEspecial || (nomeCliente.includes(nomeUsuarioAPI) && response.matricula === matriculaDigitada)) {
          this.clienteAutenticado = cliente.nomeCliente;
          this.clienteAutenticacaoVisivel = null;
          console.log('Autenticação bem-sucedida. clienteAutenticado:', this.clienteAutenticado);
        } else {
          this.mensagemErroAutenticacao = cliente.nomeCliente;
          this.mensagemErroAutenticacaoEspecifica = 'Credenciais inválidas para este cliente.';
          this.clienteAutenticado = null;
          console.log('Falha na autenticação (nome/matrícula). mensagemErro:', this.mensagemErroAutenticacaoEspecifica);
        }
      } else {
        this.mensagemErroAutenticacao = cliente.nomeCliente;
        this.mensagemErroAutenticacaoEspecifica = 'Matrícula ou senha incorretos.';
        this.clienteAutenticado = null;
        console.log('Falha na autenticação (resposta inválida). mensagemErro:', this.mensagemErroAutenticacaoEspecifica);
      }
    },
    (error) => {
      console.error('Erro na chamada da API:', error);
      this.mensagemErroAutenticacao = cliente.nomeCliente;
      this.mensagemErroAutenticacaoEspecifica = 'Erro ao verificar credenciais.';
      this.clienteAutenticado = null;
      console.log('Erro na chamada da API. mensagemErro:', this.mensagemErroAutenticacaoEspecifica, 'Erro:', error);
    }
  );
}

  formatarValor(valor: string): string {
    
    valor = valor.trim();

    // Detecta se o separador decimal é vírgula ou ponto
    const separadorDecimal = valor.includes(',') ? ',' : '.';
    const separadorMilhar = separadorDecimal === ',' ? '.' : ',';

    // Normaliza o valor, removendo o separador de milhar
    const valorSemMilhar = valor.replace(new RegExp(`\\${separadorMilhar}`, 'g'), '');

    // Substitui o separador decimal por ponto
    const valorComPonto = valorSemMilhar.replace(separadorDecimal, '.');

    // Converte para número e formata com separador decimal e milhar
    const valorNumerico = parseFloat(valorComPonto);

    if (isNaN(valorNumerico)) {
      return '0,00';
    }

    // Formata com separador de milhar e vírgula como separador decimal
    const partes = valorNumerico.toFixed(2).split('.');
    const inteiro = partes[0];
    const decimal = partes[1];

    const inteiroComMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${inteiroComMilhar},${decimal}`;
  }

  concluirTitulo(baixaTituloo: any): void {
    this.tit = baixaTituloo;
    const params = { matricula: this.matricula, senha: this.senha, id: this.tit.id };



    console.log('Dados enviados:', params);

    this.httpClient.post<any>(`${environment.entregatitulo}/tituloreceberfuncionario/baixatitulofuncionario`, {}, { params })
      .subscribe({
        next: (response: any) => {
          console.log('Resposta do backend:', response);
          this.mensagem = response.message;
          // Captura o idBaixaEntrega gerado na resposta
          this.idBaixaTitulo = response.idBaixaTitulo;
          console.log('ID da baixa de título gerado:', this.idBaixaTitulo);

          this.spinner.hide();
          this.fecharFormularios();
          window.location.reload();




        },
        error: (error) => {
          alert('Erro ao concluir a baixa. Usuário e senha incorretos, tente novamente.');
          console.error('Erro ao concluir a título:', error);
          this.spinner.hide();
        }
      });
  }


  editartitulo(id: string): void {
    this.router.navigate(['/editar-titulo', id]);
  }


  controlarZoom(event: WheelEvent) {
    event.preventDefault();
    const incremento = event.deltaY < 0 ? 0.1 : -0.1;
    this.zoomLevel = this.calcularNovoZoom(incremento);
  }

  calcularNovoZoom(incremento: number): string {
    const match = this.zoomLevel.match(/scale\(([^)]+)\)/);
    if (match) {
      const currentScale = parseFloat(match[1]);
      const newScale = Math.max(0.1, currentScale + incremento);
      return `scale(${newScale})`;
    }
    return this.zoomLevel;
  }

  getFullImageUrl(imagemUrl: string): string {
    return `${environment.entregatitulo}/tituloreceberfuncionario${imagemUrl}`;
  }

  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl); // Adicione esta linha
    this.imagemAmpliadaUrl = this.getFullImageUrl(imagemUrl);
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }

  fecharImagemAmpliada(dia: any = null): void {
    const target = dia || this;
    target.imagemAmpliadaUrl = null;
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
    }
  }

  exibirMenuImpressao(event: MouseEvent): void {
    event.preventDefault(); // Evita o menu de contexto padrão
    const imagem = event.target as HTMLImageElement;
    if (imagem) {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            const imgHTML = `<img src="${imagem.src}" style="width:100%;" onload="window.print();">`;
            printWindow.document.write(imgHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.onafterprint = () => {
                printWindow.close(); // Fecha a janela após a impressão
            };
        }
    }
}


  abrirFormularioBaixaTitulo(baixatituloo: any): void {
    this.currentForm = 'baixaTitulo';
   
    this.baixaTitulo = baixatituloo;

  }
  abrirFormularioBaixaTituloSelecionado(baixatituloo: any): void {
    
    this.currentFormi = 'concluirSelecionados' ;
    this.baixaTitulo = baixatituloo;

  }


  // Fecha todos os formulários
  fecharFormularios(): void {

    this.matricula = '';
    this.senha = '';
    this.currentForm = null;
    this.currentFormi = null;


  }

  isDateOlder(dateString: string): boolean {
    // Converter a data para o formato "YYYY-MM-DD" se estiver em "DD/MM/YYYY"
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // Ajuste do mês para zero-indexed
    
    const now = new Date();
    const referenceDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtrai 15 dias
    return date < referenceDate;
}

updateSelection(titulo: any): void {
  if (titulo.selected) {
    this.selecionados.push(titulo.id);
  } else {
    this.selecionados = this.selecionados.filter(id => id !== titulo.id);
  }
}

toggleAllSelection(cliente: any): void {
  cliente.titulos.forEach((titulo: any) => {
    titulo.selected = !titulo.selected;
    if (titulo.selected && !this.selecionados.includes(titulo.id)) {
      this.selecionados.push(titulo.id);
    } else if (!titulo.selected) {
      this.selecionados = this.selecionados.filter(id => id !== titulo.id);
    }
  });
}


concluirSelecionados(): void {
  // Obter os IDs dos títulos selecionados
  this.selecionados = this.titulos
    .filter(titulo => titulo.selected) // Verificar seleção no array `titulos`
    .map(titulo => titulo.id);

  if (this.selecionados.length === 0) {
    alert('Nenhum título selecionado para concluir.');
    return;
  }

  if (!this.matricula || !this.senha) {
    alert('Por favor, preencha a matrícula e senha.');
    return;
  }

  const erros: any[] = [];
  const sucessos: any[] = [];

  this.selecionados.forEach(id => {
    const params = { matricula: this.matricula, senha: this.senha, id };

    this.httpClient.post<any>(`${environment.entregatitulo}/tituloreceberfuncionario/baixatitulofuncionario`, {}, { params })
      .subscribe({
        next: (response: any) => {
          console.log(`Título ID ${id} concluído com sucesso.`, response);
          sucessos.push(id);

          // Atualiza localmente o status do título
          const titulo = this.titulos.find(t => t.id === id);
          if (titulo) titulo.concluido = true;
        },
        error: (error: any) => {
          console.error(`Erro ao concluir o título ID ${id}:`, error);
          erros.push({ id, error });
        }
      });
  });

  // Exibe os resultados
  if (sucessos.length > 0) {
    alert(`${sucessos.length} títulos concluídos com sucesso.`);
  }
  if (erros.length > 0) {
    alert(`${erros.length} títulos não foram concluídos. Verifique os erros no console.`);
  }

  this.fecharFormularios(); // Fecha o formulário
}





}

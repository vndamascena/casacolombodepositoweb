import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { NgxImageZoomModule } from 'ngx-image-zoom';


@Component({
  selector: 'app-consulta-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule],
  templateUrl: './consulta-entrega.component.html',
  styleUrls: ['./consulta-entrega.component.css']
})
export class ConsultaEntregaComponent implements OnInit {
  p: number = 1;
  mensagem: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  entregas: any[] = [];
  entrega: any = {};
  pendencias: any[] = [];
  pendencia: any = {};
  ent: any;
  datas: any [] = []
  imagemFile: File | null = null;
  imagemAmpliadaUrl: string | null = null;
  imagemAmpliadaUrlPendencia:string |null = null;
  zoomLevel: string = 'scale(1)';
  matricula: string = '';
  senha: string = '';
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';
  dias: any[] = [
    { nome: 'Segunda-feira', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
    { nome: 'Terça-feira', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
    { nome: 'Quarta-feira', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
    { nome: 'Quinta-feira', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
    { nome: 'Sexta-feira', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
    { nome: 'Sábado', entregas: [], pendencias: [], exibir: false, filaEntrega: false, saiuEntrega: false, pendentes: false },
  ];
  motoristas: string[] = ['JORGE', 'DOUGLAS', 'MAURÍCIO', 'ARTHUR', 'LEONARDO', 'OUTROS'];
  pagamentos: string [] =['PAGO', 'REC NO LOCAL', 'CARTEIRA'];
  isEditing: string | null = null;
  entregaEditando: any = null;
  erroValidacao: string = '';
  baixaEntrega: any;
  pendenciaEntrega: any;
  currentForm: 'impressao' | 'motorista' | 'baixaEntrega' | 'pendencia' |'pagamento'| null = null;
  idBaixaEntrega: number | null = null; 
  cadastrarPagamentos: any;
  originalEntregas: any[] = [];
  expression: string = '';
  originalPendencias: any[] = [];
  

  
  


  formi = new FormGroup ({
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
    observacaoPendencia: new FormControl(''),
    dataEntregaProximaEntrega:new FormControl(''),
    diaSemanaPendencia: new FormControl(''),
    loja: new FormControl(''),
    

  });


  form: FormGroup = this.formBiulder.group({
    id: [''],
    numeroNota: ['', Validators.required],
    nomeCliente: [''],
    valor: [''],
    usuarioId: [''],
    observacao: [''],
    dataCadastro: [''],
    dataEntrega: [''],
    diaSemana: [''],
    periodo: [''],
    vendedor: [''],
    motorista: [''],
    motoristaAtual: [''],
    observacaoPendencia:[''],
    dataEntregaProximaEntrega:[''],
    diaSemanaPendencia: [''],
    loja: [''],
    pagamento:[''],

  });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }
 
// Método para filtrar os produtos com base na expressão de pesquisa
filtrarEntregas(): void {
  if (this.expression.trim() === '') {
    // Se a expressão de pesquisa estiver vazia, recarrega todas as entregas para o estado original
    this.datas.forEach(data => {
      data.entregas = data.entregas.map((entrega: { id: any; }) => {
        return this.originalEntregas.find(e => e.id === entrega.id) || entrega;
      });
    });
  } else {
    // Filtra as entregas com base na expressão de pesquisa na lista original
    this.datas.forEach(data => {
      data.entregas = this.originalEntregas.filter(p =>
        Object.values(p).some(value => {
          // Verifica se o valor é string ou número
          if (typeof value === 'string') {
            return value.toLowerCase().includes(this.expression.toLowerCase());
          } else if (typeof value === 'number') {
            // Converte o número para string e verifica se contém a expressão de pesquisa
            return value.toString().includes(this.expression);
          }
          return false;
        })
        
      );
    });
  }
}

  getAllPendencias() {
    return this.dias.reduce((acc, dia) => acc.concat(dia.pendencias), []);
  }
  togglePendencias() {
    this.pendenciaEntrega = !this.pendenciaEntrega;
  }
 

  ngOnInit(): void {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    const ocorrencId = this.route.snapshot.queryParams['id'];
    if (ocorrencId) {
      // Requisição para obter dados das entregas
      this.httpClient.get<any[]>(`${environment.entregatitulo}entrega/${ocorrencId}`)
        .subscribe({
          next: (ocorrenciasData) => {
            this.entregas = ocorrenciasData.map(entrega => {
              entrega.dataTime = this.convertToBrazilTime(new Date(entrega.dataTime));
              this.loadUserName(entrega);
              this.originalEntregas = [...this.entregas];

              return entrega;
            });
            this.verificarStatusDePagamento();
            // Ordena por dataEntrega em ordem crescente
            this.entregas.sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
            this.categorizarEntregasPorDia();
  
            this.buscarPendencias();
  
            // Requisição para obter dados de impressão
            this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/impressao`)
              .subscribe({
                next: (impressaoData) => {
                  const impressaoIds = impressaoData.map(i => i.entregaId);
  
                  this.entregas.forEach(entrega => {
                    entrega.confirmado = impressaoIds.includes(entrega.id);
                    entrega.disabled = entrega.confirmado; // Desabilita o checkbox se estiver marcado
                  });
  
                  this.verificarPendencias();
                },
                error: (error) => {
                  console.error('Erro ao carregar os dados de impressão:', error);
                }
              });
          },
          error: (error) => {
            console.error('Erro ao carregar as entregas:', error);
          }
        });
    } else {
      this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega`)
        .subscribe({
          next: (ocorrenciasData) => {
            this.entregas = ocorrenciasData.map(entrega => {
              entrega.dataTime = this.convertToBrazilTime(new Date(entrega.dataTime));
              this.loadUserName(entrega);
              return entrega;
            });
            this.verificarStatusDePagamento();
            // Ordena por dataEntrega em ordem crescente
            this.entregas.sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
            this.categorizarEntregasPorDia();
            this.buscarPendencias();
            this.originalEntregas = [...this.entregas];

            // Requisição para obter dados de impressão
            this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/impressao`)
              .subscribe({
                next: (impressaoData) => {
                  const impressaoIds = impressaoData.map(i => i.entregaId);
  
                  this.entregas.forEach(entrega => {
                    entrega.confirmado = impressaoIds.includes(entrega.id);
                    entrega.disabled = entrega.confirmado; // Desabilita o checkbox se estiver marcado
                  });
  
                  this.verificarPendencias();
                },
                error: (error) => {
                  console.error('Erro ao carregar os dados de impressão:', error);
                }
              });
          },
          error: (error) => {
            console.error('Erro ao carregar as ocorrências:', error);
          }
        });
    }
  }
  
  


  getColor(index: number): string {
    return index % 2 === 0 ? '#b6e18f' : '#ffffff';
  }
 

  formatarData(dataString: string): string {
    const partes = dataString.split('-'); // Divide a string no formato 'yyyy-MM-dd'
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Meses são baseados em zero
    const dia = parseInt(partes[2], 10);
    const data = new Date(ano, mes, dia);
    
    const diaFormatado = String(data.getDate()).padStart(2, '0');
    const mesFormatado = String(data.getMonth() + 1).padStart(2, '0');
    const anoFormatado = data.getFullYear();
    
    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
  }


  // Nova função para verificar pendências e exibir alerta
  verificarPendencias(): void {
    const diasComPendencias = this.dias
      .filter(dia => dia.pendencias.length > 0)
      .map(dia => {
        // Para cada pendência, obtenha a data e formate
        const pendencia = dia.pendencias[0]; // Supondo que todas as pendências têm a mesma data
        const dataFormatada = this.formatarData(pendencia.dataEntrega);
        return `${dia.nome} (Data: ${dataFormatada})`;
      });
    
    if (diasComPendencias.length > 0) {
      const mensagem = `Possui entregas pendentes para os dias: ${diasComPendencias.join(', ')}. Favor verificar.`;
      alert(mensagem);
    }
  }


  verificarStatusDePagamento(): void {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/pagamento`)
      .subscribe({
        next: (pagamentosData) => {
          // Itera sobre as entregas e verifica se o pagamento já foi confirmado
          this.entregas.forEach(entrega => {
            const pagamento = pagamentosData.find(p => p.entregaId === entrega.id);
  
            if (pagamento) {
              entrega.pagamento = pagamento.statusDePagamento;  // Atualiza o status de pagamento
              entrega.pagamentoConfirmado = true;  // Marca como confirmado
  
              // Carrega o nome do usuário associado ao pagamento
              this.httpClient.get<any>(`${this.userApiUrl}?matricula=${pagamento.usuarioId}`)
                .subscribe({
                  next: (userData) => {
                    entrega.nomeUsuarioPagamento = userData.nome; // Atualiza o nome do usuário associado ao pagamento
                  },
                  error: (error) => {
                    console.error('Erro ao carregar o nome do usuário:', error);
                  }
                });
            }
          });
        },
        error: (error) => {
          console.error('Erro ao verificar status de pagamento:', error);
        }
      });
  }
  
 
  abrirFormularioCredenciais(entrega: any): void {
    this.cadastrarPagamentos = entrega;
    this.currentForm = 'pagamento';  // Atualiza o estado para exibir o formulário
  }

  fecharFormularioCredenciais(): void {
    this.cadastrarPagamentos = null;
    this.matricula = '';
    this.senha = '';
    this.currentForm = null;  // Fecha o formulário
  }

  onPagamentoChange(entrega: any) {
    if (entrega.pagamento !== entrega.pagamentoAtual) {
      entrega.pagamentoAtual = entrega.pagamento;
      this.cadastrarPagamentos = entrega;
      this.abrirFormularioCredenciais(entrega);
    }
  }

  salvarPagamento(): void {
    if (this.cadastrarPagamentos && this.matricula && this.senha) {
      const entregaId = this.cadastrarPagamentos.id;
      
      if (!entregaId) {
        console.error('Erro: ID da entrega não encontrado.');
        alert('Erro ao processar o pagamento: ID da entrega não encontrado.');
        return;
      }
  
      const params = { matricula: this.matricula, senha: this.senha, id: entregaId };
  
      const body = {
        statusDePagamento: this.cadastrarPagamentos.pagamento
      };
  
      this.spinner.show();
      console.log('Dados enviados:', params);
      console.log('Corpo da requisição:', body);
  
      this.httpClient.post(`${environment.entregatitulo}/entrega/pagamento`, body, { params })
        .subscribe({
          next: (response) => {
            console.log('Resposta do servidor:', response);
            this.mensagem = 'Pagamento salvo com sucesso!';
  
            // Atualiza o estado da entrega para impedir futuras alterações
            this.cadastrarPagamentos.pagamentoConfirmado = true;
            
            this.fecharFormularioCredenciais();
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erro ao concluir pagamento:', error);
            let errorMessage = 'Erro desconhecido';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            alert(`Erro ao concluir pagamento: ${errorMessage}`);
            this.spinner.hide();
          }
        });
    } else {
      alert('Preencha todos os campos de credenciais.');
    }
  }



  startEditing(id: string) {
    this.entregaEditando = this.entregas.find(e => e.id === id);
  }

  isEditingFor(id: string): boolean {
    return this.entregaEditando && this.entregaEditando.id === id;
  }

  onMotoristaChange(entrega: any) {
    if (this.isEditingFor(entrega.id)) {
      // Lógica de edição: se estamos editando a entrega e o motorista mudou, armazena a mudança
      if (entrega.motorista !== this.entregaEditando.motoristaAtual) {
        this.entregaEditando.motorista = entrega.motorista;
      }
    } else {
      // Lógica de seleção inicial: salva o motorista diretamente
      if (entrega.motorista !== entrega.motoristaAtual) {
        this.salvarMotorista(entrega);
      }
    }
  }

 


  validarUsuario(matricula: string, senha: string): Promise<boolean> {
    console.log('Iniciando validação de usuário...');
    return new Promise((resolve, reject) => {
      this.httpClient.post<any>(`${this.userApiUrl}/autenticar`, { matricula, senha })
        .subscribe({
          next: (response) => {
            console.log('Resposta da API de validação de usuário:', response);
            if (response && response.id) {
              resolve(true);
            } else {
              console.error('Estrutura inesperada na resposta da API:', response);
              resolve(false);
            }
          },
          error: (error) => {
            console.error('Erro ao validar usuário:', error);
            reject(false);
          }
        });
    });
  }

  salvarCredenciais() {
    console.log('salvarCredenciais chamado');
    if (this.entregaEditando) {
      console.log('Validando usuário...');
      this.validarUsuario(this.matricula, this.senha)
        .then(isValid => {
          console.log('Resultado da validação:', isValid);
          if (isValid) {
            console.log('Usuário válido, salvando motorista...');
            this.salvarMotorista(this.entregaEditando);
          } else {
            alert('Usuário ou senha inválidas. Verifique sua matrícula e senha.');
          }
        })
        .catch(error => {
          console.error('Erro ao validar usuário:', error);
          alert('Usuário ou senha inválidas. Verifique sua matrícula e senha.');
        });
    }
  }

  salvarMotorista(entrega: any) {
    if (entrega && entrega.motorista) {
      entrega.motoristaAtual = entrega.motorista; // Atualiza o motorista atual

      this.httpClient.put(`${environment.entregatitulo}/entrega/motorista/`, entrega)
        .subscribe({
          next: () => {
            console.log('Motorista atualizado com sucesso');
            this.entregaEditando = null; // Fecha o formulário após sucesso
            this.matricula = '';
            this.senha = '';
            this.atualizarListaEntregas(); // Atualiza a lista de entregas se necessário
          },
          error: (error) => console.error('Erro ao atualizar motorista:', error)
        });
    } else {
      console.error('Erro ao salvar motorista: dados de motorista ausentes');
    }
  }

  

  fecharFormularioCredenciaisMotorista(): void {
    this.entregaEditando = null;
    this.matricula = '';
    this.senha = '';
  }

  // Atualiza a lista de entregas após salvar motorista
  atualizarListaEntregas() {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega`)
      .subscribe({
        next: (entregas) => {
          this.entregas = entregas;
        },
        error: (error) => console.error('Erro ao atualizar lista de entregas:', error)
      });
  }






  // Adicione esta função no seu componente
  buscarPendencias() {
    this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/pendenciaEntrega`)
      .subscribe({
        next: (pendenciasData) => {
          // Iterar sobre os dias da semana
          pendenciasData.forEach(pendencia => {
            // Encontre o dia da semana correspondente
            const diaSemanaIndex = this.getDayOfWeekIndex(pendencia.diaSemana);
            
            if (diaSemanaIndex !== -1) {
              // Adicione a pendência ao dia correspondente
              this.dias[diaSemanaIndex].pendencias = this.dias[diaSemanaIndex].pendencias || [];
              this.dias[diaSemanaIndex].pendencias.push(pendencia);
              this.loadUserName(pendencia);

            }
          });
        },
        error: (error) => {
          console.error('Erro ao carregar as pendências:', error);
        }
      });
  }

  categorizarEntregasPorDia(): void {
    // Primeiro, criamos um objeto para armazenar as entregas por data de entrega
    const entregasPorData: { [key: string]: any[] } = {};
  
    this.entregas.forEach(entrega => {
      const dataEntregaStr = entrega.dataEntrega; // Obtém a data de entrega no formato de string
      const dataEntrega = new Date(dataEntregaStr); // Converte a string em um objeto Date
      const dataEntregaBrasileira = this.convertToBrazilTime(dataEntrega); // Ajusta a data para o fuso horário brasileiro
      
      // Define os dias da semana
      const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const diaDaSemana = diasDaSemana[dataEntregaBrasileira.getDay()]; // Obtém o dia da semana
      
      // Converte a data para o formato brasileiro
      const dia = String(dataEntregaBrasileira.getDate()).padStart(2, '0');
      const mes = String(dataEntregaBrasileira.getMonth() + 1).padStart(2, '0');
      const ano = dataEntregaBrasileira.getFullYear();
  
      // Formata a data com o dia da semana
      const dataStr = `${diaDaSemana}, ${dia}/${mes}/${ano}`;
  
      if (!entregasPorData[dataStr]) {
        entregasPorData[dataStr] = [];
      }
      entregasPorData[dataStr].push(entrega);
    });
  
    // Agora, atualizamos a estrutura de dados 'datas' para refletir as novas categorias
    this.datas = Object.keys(entregasPorData).map(dataStr => {
      return {
        nome: dataStr, // Usamos a string de data com o dia da semana como nome
        entregas: entregasPorData[dataStr],
        pendencias: [], // Iniciais pendências vazias, você pode atualizar isso conforme necessário
        exibir: false,
        filaEntrega: false,
        saiuEntrega: false,
        pendentes: false
      };
    });
  }
  categorizarPendenciasPorDia(): void {
    this.dias.forEach(dia => dia.pendencias = []);
    this.pendencias.forEach(pendencia => {
      const diaSemanaIndex = this.getDayOfWeekIndex(pendencia.diaSemana);
      if (diaSemanaIndex !== -1) {
        this.dias[diaSemanaIndex].pendencias.push(pendencia);
      }
    });
  }

  getDayOfWeekIndex(diaSemana: string): number {
    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return diasSemana.indexOf(diaSemana);
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
    return `${environment.entregatitulo}/entrega${imagemUrl}`;
  }

  expandirImagem(imagemUrl: string, dia: any = null): void {
    const target = dia || this; // Verifica se é dia de entrega ou pendente
    target.imagemAmpliadaUrl = this.getFullImageUrl(imagemUrl);
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
        printWindow.document.write(`<img src="${imagem.src}" style="width:100%;">`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onafterprint = () => {
          printWindow.close(); // Fecha a janela após a impressão
          
        };
        printWindow.print();
      }
    }
  }




  isDateOlderThanThreeDays(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 9));
    return date < threeDaysAgo;
  }

  convertToBrazilTime(date: Date): Date {
    const pstDate = new Date(date);
    const timeZoneOffset = pstDate.getTimezoneOffset() + (1 * 60);
    const brazilTime = new Date(pstDate.getTime() + timeZoneOffset * 60000);
    return brazilTime;
  }

  filterData(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setDate(end.getDate() + 1);

      this.httpClient.get<any[]>(`${environment.ocorrencApi}/ocorrencia`).subscribe({
        next: (ocorrenciasData) => {
          this.entregas = ocorrenciasData.map(entrega => {
            entrega.dataTime = this.convertToBrazilTime(new Date(entrega.dataTime));
            return entrega;
          }).filter(entrega => {
            const ocorrenciaDate = new Date(entrega.dataTime);
            return ocorrenciaDate >= start && ocorrenciaDate < end;
          });

          this.entregas.sort((a, b) => b.dataTime - a.dataTime);
          this.entregas.forEach(entrega => this.loadUserName(entrega));
        },
        error: (error) => {
          console.error('Erro ao filtrar o histórico de vendas:', error);
        }
      });
    }
  }

  loadUserName(entregaa: any): void {
    this.httpClient.get<any>(`${this.userApiUrl}?matricula=${entregaa.usuarioId}`)
      .subscribe({
        next: (userData) => {
          entregaa.nome = userData.nome;
        },
        error: (error) => {
          console.error('Erro ao carregar o nome do usuário:', error);
        }
      });
  }

  toggleTable(dia: any) {
    dia.exibir = !dia.exibir;
  }
  toggleSection(dia: any, section: string) {
    dia[section] = !dia[section];
  }
  getEntregasPorPeriodo(entregas: any[], periodo: string): any[] {
    return entregas.filter(entrega => entrega.periodo === periodo);
  }

  // Adicione esta função para filtrar pendências por período
  getPendenciasPorPeriodo(pendencias: any[], periodo: string): any[] {
    return pendencias.filter(pendencia => pendencia.periodo === periodo);
  }

  Impressao(entregaa: any): void {
    this.ent = entregaa;

    // Configuração dos parâmetros da solicitação POST
    const params = { matricula: this.matricula, senha: this.senha, id: this.ent.id };

    // Corpo da requisição (se necessário, ajuste conforme a API espera)
    const body = {};

    // Log para depuração
    console.log('Dados da Impressão:');
    console.log('Matrícula:', this.matricula);
    console.log('Senha:', this.senha);
    console.log('ID da Entrega:', entregaa.id);

    // Envio da requisição POST com corpo e parâmetros corretos
    this.httpClient.post<any>(environment.entregatitulo + '/entrega/impressao', body, { params })
      .subscribe({
        next: (response) => {

          this.mensagem = response.message;
          this.fecharFormularios();
        },
        error: (error) => {
          this.mensagem = error.error?.message || 'Erro ao registrar impressão';
          console.error('Erro ao registrar impressão:', error);
        }
      });
  }



  concluirEntrega(baixaEntregaa: any): void {
    this.ent = baixaEntregaa;
    const params = { matricula: this.matricula, senha: this.senha, id: this.ent.id };
    const body = {}; // Corpo da requisição, se necessário pode ser ajustado
    
  
    console.log('Dados enviados:', params);
  
    this.httpClient.post<any>(`${environment.entregatitulo}/entrega/baixaEntrega`, body, { params })
      .subscribe({
        next: (response: any) => {
          console.log('Resposta do backend:', response);
          this.mensagem = response.message;
          // Captura o idBaixaEntrega gerado na resposta
          this.idBaixaEntrega = response.idBaixaEntrega;
          console.log('ID da baixa de entrega gerado:', this.idBaixaEntrega);
  
          this.spinner.hide();
          this.fecharFormularios();
          
          // Agora que temos o idBaixaEntrega, podemos chamar o uploadImagem
          this.uploadImagem();
        
        },
        error: (error) => {
          alert('Erro ao concluir ocorrência. Usuário e senha incorretos, tente novamente.');
          console.error('Erro ao concluir a entrega:', error);
          this.spinner.hide();
        }
      });
  }
  
  
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagemFile = file;
    }
  }


 uploadImagem(): void {
  if (!this.imagemFile) {
    alert('Por favor, selecione uma imagem para a entrega concluida.');
    return;
  }

  if (this.idBaixaEntrega === null || this.idBaixaEntrega === undefined) {
    alert('O ID da baixaEntrega não está disponível. Por favor, conclua a entrega primeiro.');
    console.log('ID da baixa de entrega está nulo ou indefinido:', this.idBaixaEntrega); 
    return;
  }

  const formData = new FormData();
  formData.append('imageFile', this.imagemFile as Blob);

  this.spinner.show();

  this.httpClient.post(`${environment.entregatitulo}/entrega/uploadEntrega?idBaixaEntrega=${this.idBaixaEntrega}`, formData)
    .subscribe({
      next: (data: any) => {
        console.log('Imagem enviada com sucesso:', data);
        this.mensagem = 'Imagem enviada com sucesso!';
        this.spinner.hide();
        window.location.reload();

        
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.imagemFile = null;
        this.idBaixaEntrega = null; 
      },
      error: (e) => {
        console.log('Erro ao enviar a imagem:', e.error);
        alert('Erro ao enviar a imagem. Tente novamente.');
        this.spinner.hide();
      }
    });
}
  
updateDayOfWeek(dateString: string): void {
  const date = new Date(dateString + 'T00:00:00'); // Adicione a hora para garantir que a data esteja correta
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dayOfWeek = daysOfWeek[date.getUTCDay()]; // Use getUTCDay() para evitar problemas de fuso horário
  this.formi.get('diaSemana')?.setValue(dayOfWeek);
  this.formi.get('diaSemanaPendencia')?.setValue(dayOfWeek);
}
onDateChange(event: any): void {
  const selectedDate = event.target.value;
  if (selectedDate) {
    this.updateDayOfWeek(selectedDate);
  }
}




  onPendente(pendenciaEntregaa: any): void {
    this.ent = pendenciaEntregaa;
    const params = { matricula: this.matricula, senha: this.senha, id: this.ent.id };
    
    const body = { observacaoPendencia: this.formi.value.observacaoPendencia, 
      diaSemanaPendencia: this.formi.value.diaSemanaPendencia,
      dataentregaProximaEntrega: this.formi.value.dataEntregaProximaEntrega
     };
    this.spinner.show();


    console.log('Dados enviados:', params);
    console.log('observação', body)

    this.httpClient.post<any>(`${environment.entregatitulo}/entrega/pendenciaEntrega`, body, { params })
        .subscribe({
            next: (response) => {
                // this.spinner.hide();
                this.mensagem = response.message; // exibir mensagem de sucesso
               
                this.fecharFormularios();
                this.spinner.hide();
                
            },
            error: (error) => {
                // this.spinner.hide();
                console.error('Erro ao concluir ocorrência:', error); // Log do erro completo para depuração

                let errorMessage = 'Erro desconhecido';

                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else {
                    // Exibe o objeto inteiro como string se nenhuma das anteriores funcionar
                    errorMessage = JSON.stringify(error.error);
                }

                alert(`Erro ao concluir ocorrência: ${errorMessage}`);
                this.spinner.hide();
            }
        });
}


  abrirFormularioImpressao(entregaa: any): void {
    this.currentForm = 'impressao';
    this.ent = entregaa;
  }

  // Exibe o formulário de edição de motorista
  abrirFormularioMotorista(entregaa: any): void {
    this.currentForm = 'motorista';
    this.entregaEditando = entregaa;
  }

  // Exibe o formulário de conclusão de entrega
  abrirFormularioBaixaEntrega(baixaentregaa: any): void {
    this.currentForm = 'baixaEntrega';
    this.baixaEntrega = baixaentregaa;

  }

  // Exibe o formulário de pendência
  abrirFormularioPendencia(pendenciaEntregaa: any): void {
    this.currentForm = 'pendencia';
    this.pendenciaEntrega = pendenciaEntregaa;
  }

  // Fecha todos os formulários
  fecharFormularios(): void {
    this.currentForm = null;
    this.ent = null;
    this.matricula = '';
    this.senha = '';
    this.entregaEditando = null;
    this.baixaEntrega = null;
    this.pendenciaEntrega = null;
  }



 isNotaPendente(numeroNota: string, pendencias: any[]): boolean {
  return pendencias.some(pendente => pendente.numeroNota === numeroNota);
}
}

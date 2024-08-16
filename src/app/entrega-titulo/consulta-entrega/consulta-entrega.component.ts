import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

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
  imagemFile: File | null = null;
  imagemAmpliadaUrl: string | null = null;
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
  motoristas: string[] = ['JORGE(JOCA)', 'DOUGLAS(TOGURO)', 'MAURÍCIO', 'ARTHUR', 'LEONARDO', 'OUTROS'];
  isEditing: string | null = null;
  entregaEditando: any = null;
  erroValidacao: string = '';
  baixaEntrega: any;
  pendenciaEntrega: any;
  currentForm: 'impressao' | 'motorista' | 'baixaEntrega' | 'pendencia' | null = null;
  idBaixaEntrega: number | null = null; 
  diasSemana: string[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  diasSemanaPendencia: string[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];



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

  });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBiulder: FormBuilder,
  ) { }
  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
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
              return entrega;
            });
            this.entregas.sort((a, b) => b.dataTime - a.dataTime);
            this.categorizarEntregasPorDia();
            this.buscarPendencias();
            
            // Requisição para obter dados de impressão
            this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/impressao`)
              .subscribe({
                next: (impressaoData) => {
                  // Coleta todos os entregaId presentes na resposta da API de Impressão
                  const impressaoIds = impressaoData.map(i => i.entregaId);
  
                  // Marca os checkboxes com base na presença do ID na lista de Impressao
                  this.entregas.forEach(entrega => {
                    entrega.confirmado = impressaoIds.includes(entrega.id);
                    entrega.disabled = entrega.confirmado; // Desabilita o checkbox se estiver marcado
                  });
  
                  // Verifica e exibe pendências
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
            this.entregas.sort((a, b) => b.dataTime - a.dataTime);
            this.categorizarEntregasPorDia();
            this.buscarPendencias();
            
            // Requisição para obter dados de impressão
            this.httpClient.get<any[]>(`${environment.entregatitulo}/entrega/impressao`)
              .subscribe({
                next: (impressaoData) => {
                  // Coleta todos os entregaId presentes na resposta da API de Impressão
                  const impressaoIds = impressaoData.map(i => i.entregaId);
  
                  // Marca os checkboxes com base na presença do ID na lista de Impressao
                  this.entregas.forEach(entrega => {
                    entrega.confirmado = impressaoIds.includes(entrega.id);
                    entrega.disabled = entrega.confirmado; // Desabilita o checkbox se estiver marcado
                  });
  
                  // Verifica e exibe pendências
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
  
  // Nova função para verificar pendências e exibir alerta
  verificarPendencias(): void {
    const diasComPendencias = this.dias
      .filter(dia => dia.pendencias.length > 0)
      .map(dia => dia.nome);
  
    if (diasComPendencias.length > 0) {
      const mensagem = `Possui entregas pendentes para os dias: ${diasComPendencias.join(', ')}. Favor verificar.`;
      alert(mensagem);
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
    this.dias.forEach(dia => dia.entregas = []);
    this.entregas.forEach(entrega => {
      const diaSemanaIndex = this.getDayOfWeekIndex(entrega.diaSemana);
      if (diaSemanaIndex !== -1) {
        this.dias[diaSemanaIndex].entregas.push(entrega);
      }
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

  expandirImagem(imagemUrl: string): void {
    this.imagemAmpliadaUrl = `${environment.entregatitulo}/entrega${imagemUrl}`;
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.add('mostrar');
    }
  }

  fecharImagemAmpliada(): void {
    const imagemAmpliada = document.querySelector('.imagem-ampliada');
    if (imagemAmpliada) {
      imagemAmpliada.classList.remove('mostrar');
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
    alert('Por favor, selecione uma imagem para a entrega cadastrada.');
    return;
  }

  if (this.idBaixaEntrega === null || this.idBaixaEntrega === undefined) {
    alert('O ID da entrega não está disponível. Por favor, cadastre a entrega primeiro.');
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

        // Reset file input and state
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.imagemFile = null;
        this.idBaixaEntrega = null; // Reset idBaixaEntrega after upload
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

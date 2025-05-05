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
  selector: 'app-produtofalta-consultar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule],
  templateUrl: './produtofalta-consultar.component.html',
  styleUrl: './produtofalta-consultar.component.css'
})
export class ProdutofaltaConsultarComponent implements OnInit {

  matricula: string = '';
  senha: string = '';
  mensagem: string = '';
  mensagem_erro: string = '';
  p: number = 1;
  produtosFalta: any[] = [];
  selecionadoprodutoFalta: any;
  fornecedores: any[] = [];
  fornecedorSelecionado: any;
  produtoAll: any[] = [];
  produtoAlls: any;
  lojas: any[] = [];
  acaoAtual: 'cadastrar' | 'concluir' | null = null;
  produtoParaConcluir: any ;
  editarProduto: any;
  autorizar: any;
  produtoSelecionadoId: number | null = null;
  produtoAllId: number | null = null;
  termoPesquisa: string = '';
  produtosFiltradosPesquisa: any[] = [];
  originalProdutosFalta: any[] = []; 
  filtroLoja: string | null = null;


  produtosFaltaFiltrada: any[] = []; // Lista para os produtos filtrados
  filtroAtivo: string | null = null; // Controla qual filtro dropdown está visível
  filtroLojaAtivo: { [key: string]: boolean } = {};

  form: FormGroup = this.formBuilder.group({
    codigo: [''], // Agora usaremos para armazenar o código OU identificador do produto selecionado
    produtoNomeDisplay: [''], // Novo campo para exibir o nome do produto
    produtoCustom: [''], // Campo para o nome do produto customizado
    lojaId: ['', Validators.required],
    observacao: [''],
    
    
  });
  formi: FormGroup = this.formBuilder.group({
    valor: [''],
    quantidade: [''],
    fornecedorGeralId: [''],
    produtoFaltaId: ['']
  });
  produtosFiltradosDigitando: any[] = [];
  mostrarSugestoes: boolean = false;
  exibirCampoOutroProduto: boolean = false;
  produtoSelecionadoParaCadastro: any | null = null;
  codigoLength = 6; 
  

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
  ) { }
  get f(): any {
    return this.form.controls;
  }

  onLojaCheckboxChange(produto: any, lojaId: number, event: any): void {
    const marcado = event.target.checked;
  
    
  
    const payload = {
      id: produto.id,
      lojaId: lojaId,

      
     
    };
  
    this.httpClient.put(`${environment.apiUrl}/produtoFalta/lojas`, payload)
      .subscribe({
        next: (res) => {
          console.log('Loja adicionada com sucesso!', res);
          produto.loja = produto.loja || ''; // só pra garantir
          // Atualizar o produto com a nova loja adicionada
          const nomeLoja = this.getLojaPorId(lojaId);
          if (!produto.loja) produto.loja = nomeLoja;
          else if (!produto.loja2) produto.loja2 = nomeLoja;
          else if (!produto.loja3) produto.loja3 = nomeLoja;
          else if (!produto.loja4) produto.loja4 = nomeLoja;
        },
        error: (err) => {
          console.error('Erro ao adicionar loja', err);
          event.target.checked = false;
        }
      });

      
  }
  
  confirmarRecebimento(produto: any, lojaId: number): void {
    const confirmado = confirm('Deseja confirmar que o produto chegou nesta loja?');
    if (!confirmado) return;
  
    const dataAtual = new Date().toISOString();
  
    const payload: any = {
      id: produto.id,
      lojaId: lojaId,
      dataSolicitacao: dataAtual,
      jC1Recebido: false,
      jC2Recebido: false,
      vaRecebido: false,
      clRecebido: false
    };
  
    // Marca apenas a loja correta como true
    switch (lojaId) {
      case 1: payload.jC1Recebido = true; break;
      case 2: payload.jC2Recebido = true; break;
      case 3: payload.vaRecebido = true; break;
      case 4: payload.clRecebido = true; break;
    }
  
    this.httpClient.put(`${environment.apiUrl}/produtoFalta/chegouCor`, payload)
      .subscribe({
        next: () => {
          // Atualiza o produto localmente para refletir o recebimento (e pintar de verde)
          switch (lojaId) {
            case 1: produto.jC1Recebido = true; break;
            case 2: produto.jC2Recebido = true; break;
            case 3: produto.vaRecebido = true; break;
            case 4: produto.clRecebido = true; break;
          }
          console.log('Produto marcado como recebido com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao marcar como recebido:', err);
        }
      });
  }
  produtoPossuiLojas(produto: any, lojaId: number): boolean {
 
    switch (lojaId) {
      case 1: return produto.JC1Recebido;
      case 2: return produto.JC2Recebido;
      case 3: return produto.VARecebido;
      case 4: return produto.CLRecebido;
      default: return false;
    }
  }

  
  getLojaPorId(id: number): string | null {
    const loja = this.lojas.find(l => l.id === id);
    return loja ? loja.nome : null;
  }
  
  produtoPossuiLoja(produto: any, lojaId: number): boolean {
    const nomeLoja = this.getLojaPorId(lojaId);
    if (!nomeLoja) return false;
  
    return [produto.loja, produto.loja2, produto.loja3, produto.loja4]
      .some(l => l?.toLowerCase() === nomeLoja.toLowerCase());
  }
  
  formatarCodigo(codigo: any): string {
    const codigoStr = String(codigo);
    return codigoStr.padStart(this.codigoLength, '0');
  }

  filtrarProdutosDigitando(): void {
    const valorDigitado = this.form.get('codigo')?.value?.toLowerCase() || '';
    if (valorDigitado.length >= 1) {
      const valorFormatado = valorDigitado.padStart(this.codigoLength, '0');

      this.produtosFiltradosDigitando = this.produtoAll.filter(p => {
        const codigoFormatadoProduto = this.formatarCodigo(p.codigo);
        return codigoFormatadoProduto.includes(valorFormatado) || p.nomeProduto.toLowerCase().includes(valorDigitado);
      });
      this.mostrarSugestoes = true;
      this.exibirCampoOutroProduto = false; // Esconde o campo "Outro" ao digitar
      this.produtoSelecionadoParaCadastro = null; // Reseta a seleção
      this.form.get('produtoNomeDisplay')?.setValue(''); // Limpa o campo de nome display
    } else {
      this.produtosFiltradosDigitando = [];
      this.mostrarSugestoes = false;
      this.exibirCampoOutroProduto = false;
      this.produtoSelecionadoParaCadastro = null;
      this.form.get('produtoNomeDisplay')?.setValue(''); // Limpa o campo de nome display
    }
  }

  selecionarProduto(produto: any): void {
    this.form.get('codigo')?.setValue(produto.codigo); // Armazena o código (ou ID)
    this.form.get('produtoNomeDisplay')?.setValue(produto.nomeProduto.toUpperCase()); // Exibe o nome
    this.produtosFiltradosDigitando = [];
    this.mostrarSugestoes = false;
    this.exibirCampoOutroProduto = false;
    this.produtoSelecionadoParaCadastro = produto;
  }

  selecionarOutroProduto(): void {
    this.form.get('codigo')?.setValue(''); // Limpa o campo de código
    this.form.get('produtoNomeDisplay')?.setValue(''); // Limpa o campo de nome display
    this.produtosFiltradosDigitando = [];
    this.mostrarSugestoes = false;
    this.exibirCampoOutroProduto = true;
    this.produtoSelecionadoParaCadastro = null;
  }

  esconderSugestoes(): void {
    setTimeout(() => {
      this.mostrarSugestoes = false;
    }, 200); // Pequeno delay para permitir o clique na sugestão
  }

  ngOnInit(): void {
    this.httpClient.get(environment.apiUrl + "/Loja")
      .subscribe({
        next: (data) => {
          this.lojas = data as any[];
          console.log('Lojas recebidas:', this.lojas);
        },
        error: (e) => {
          console.log('Erro ao lojas:', e.error);
        }
      });

    this.httpClient.get(environment.apiUrl + "/ProdutoAll")
      .subscribe({
        next: (data) => {
          this.produtoAll = (data as any[]).map(produto => ({
            ...produto,
            codigoFormatado: this.formatarCodigo(produto.codigo) // Formata o código ao receber
          }));
        },
        error: (e) => {
          console.log('Erro ao buscar produtos:', e.error);
        }
      });

    console.log('Buscando fornecedores...');
    this.httpClient.get(environment.apiUrl + "/fornecedorGeral")
      .subscribe({
        next: (data) => {
          this.fornecedores = data as any[];
          console.log('Fornecedores recebidos:', this.fornecedores);
        },
        error: (e) => {
          console.log('Erro ao buscar fornecedores:', e.error);
        }
      });

    const productId = this.route.snapshot.queryParams['id'];
    this.spinner.show();

    if (productId) {
      this.httpClient.get(`${environment.apiUrl}/produtoFalta/${productId}`)
        .subscribe({
          next: (produtoData) => {
            this.selecionadoprodutoFalta = produtoData;
            this.carregarFornecedores(this.selecionadoprodutoFalta);
            this.produtoAlls = produtoData;
          },
          error: (error) => {
            console.error('Erro ao carregar o produto:', error);
            this.spinner.hide();
          }
        });
    } else {
      this.httpClient.get(`${environment.apiUrl}/produtoFalta`)
        .subscribe({
          next: (produtosData) => {
            this.produtosFalta = produtosData as any[];
            this.originalProdutosFalta = [...this.produtosFalta]; 
            this.produtosFaltaFiltrada = [...this.produtosFalta];

            // Agora carregamos os fornecedores para cada produto imediatamente
            this.produtosFalta.forEach(produto => {
              this.carregarFornecedores(produto);
            });

            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erro ao carregar os produtos:', error);
            this.spinner.hide();
          }
        });
    }
  }





  
  abrirFormularioCredenciais(produtoOuLista: any, acao: 'cadastrar' | 'concluir'): void {
    this.acaoAtual = acao;

    if (acao === 'concluir') {
      this.produtoParaConcluir = produtoOuLista;
    } else {
      this.produtoParaConcluir = null;
    }

    this.selecionadoprodutoFalta = produtoOuLista;
  }


  abrirFormularioCredenciaisEditar(produto: any): void {
    this.editarProduto = produto;
    this.produtoParaConcluir = produto;
    
  }

  abriformularioautorizar(produto:any): void{
    this.autorizar = produto;

  }
  fecharFormularioCredenciais(): void {
    this.autorizar = null;
    this.produtoParaConcluir = null;
    this.selecionadoprodutoFalta = null;
    this.editarProduto = null;
    this.matricula = '';
    this.senha = '';
  }
 
  
  carregarFornecedores(produto: any): void {
    if (!produto.fornecedores || produto.fornecedores.length === 0) {
      this.httpClient.get<any[]>(`${environment.apiUrl}/produtoFalta/${produto.id}/fornecedorProduto`)
        .subscribe(
          (FornecedoresData) => {
            produto.fornecedores = Array.isArray(FornecedoresData) ? FornecedoresData : [];

            // Agora já definimos o menor preço assim que carregamos os fornecedores
            produto.fornecedorMenorPreco = this.getMenorPreco(produto.fornecedores);
          },
          (error) => {
            console.error('Erro ao carregar os fornecedores:', error);
          }
        );
    } else {
      // Caso os fornecedores já estejam carregados, define o menor preço diretamente
      produto.fornecedorMenorPreco = this.getMenorPreco(produto.fornecedores);
    }
  }

  toggleDetalhes(produto: any): void {
    produto.mostrarDetalhes = !produto.mostrarDetalhes;
  }
  

  getMenorPreco(fornecedores: any[]): any {
    if (!fornecedores || fornecedores.length === 0) {
      return null;
    }
  
    return fornecedores.reduce((menor, atual) => {
      const valorAtual = parseFloat(atual.valor.toString().replace(',', '.'));
      const valorMenor = parseFloat(menor.valor.toString().replace(',', '.'));
  
      return valorAtual < valorMenor ? atual : menor;
    }, fornecedores[0]);
  }
  

  onSubmit(): void {
    if (!this.formi.valid || this.produtoSelecionadoId == null) {
      alert('Formulário inválido ou produto não selecionado');
      return;
    }

    const formDataWithId = {
      ...this.formi.value,
      produtoFaltaId: this.produtoSelecionadoId
    };

    this.httpClient.post(`${environment.apiUrl}/produtoFalta/fornecedorProduto`, formDataWithId)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
          this.router.navigate(['/produtofalta-consultar']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar fornecedor:', error);
          alert('Erro ao atualizar o fornecedor. Verifique os campos e tente novamente.');
        }
      });
  }

  onSubmitt(): void {
    if (!this.matricula || !this.senha) {
      alert('Preencha matrícula e senha');
      return;
    }

    const options = {
      params: { matricula: this.matricula, senha: this.senha }
    };

    this.spinner.show();

    const payload: any = {
      lojaId: this.form.get('lojaId')?.value,
      observacao: this.form.get('observacao')?.value,
    };

    if (this.produtoSelecionadoParaCadastro) {
      payload.codigo = this.produtoSelecionadoParaCadastro.codigo; // Envia o código para o backend
      payload.nomeProduto = this.form.get('produtoNomeDisplay')?.value; // Envia o nome para o backend (se necessário)
    } else if (this.exibirCampoOutroProduto && this.form.get('produtoCustom')?.value) {
      payload.nomeProduto = this.form.get('produtoCustom')?.value;
    } else if (this.form.get('codigo')?.value && !this.form.get('produtoNomeDisplay')?.value) {
      // Se algo foi digitado no código e nenhum produto foi selecionado, tenta enviar como código
      const codigoDigitado = this.form.get('codigo')?.value;
      const codigoNumerico = parseInt(codigoDigitado, 10);
      if (!isNaN(codigoNumerico)) {
        payload.codigo = codigoNumerico;
      } else {
        payload.nomeProduto = codigoDigitado;
      }
    } else if (!this.form.get('produtoNomeDisplay')?.value && !this.form.get('produtoCustom')?.value) {
      alert('Por favor, selecione um produto ou digite o nome.');
      this.spinner.hide();
      return;
    } else if (this.form.get('produtoNomeDisplay')?.value) {
      payload.nomeProduto = this.form.get('produtoNomeDisplay')?.value;
      payload.codigo = this.form.get('codigo')?.value; // Envia o código também, se disponível
    }

    if (this.acaoAtual === 'cadastrar') {
      console.log('Cadastrando produto com:', payload);
      this.httpClient.post(environment.apiUrl + "/produtoFalta/cadastrar", payload, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message;
            this.form.reset();
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            window.location.reload();
          },
          error: (e) => {
            console.log('Erro ao cadastrar produto:', e.error);
            
            this.mensagem_erro = e.error.message;
            this.spinner.hide();
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          }
        });
    }
    else if (this.acaoAtual === 'concluir' && this.produtoParaConcluir) {
      const body = {
        id: this.produtoParaConcluir.id
      };

      this.httpClient.post(`${environment.apiUrl}/produtoFalta/confirmar-baixa`, body, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message;
            this.fecharFormularioCredenciais();
            this.spinner.hide();
            window.location.reload();
          },
          error: (e) => {
            console.log('Erro ao concluir produto:', e.error);
            alert('Falha ao concluir o produto.');
            this.spinner.hide();
          }
        });
    }
  }
  setProdutoSelecionado(id: number) {
    this.produtoSelecionadoId = id;
  }
  onEdit(): void {
    if (!this.matricula || !this.senha) {
      alert('Preencha matrícula e senha');
      return;
    }
  
    const options = {
      params: { matricula: this.matricula, senha: this.senha }
    };
  
    const body = {
      id: this.editarProduto,
      dataSolicitacao: new Date().toISOString(),
     
      
    };
  
    this.spinner.show();
  
    this.httpClient.put(`${environment.apiUrl}/produtoFalta`, body, options)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
  
          
          const produto = this.produtosFalta.find(p => p.id === this.editarProduto);
          if (produto) {
            produto.editado = true;
          }
  
          this.fecharFormularioCredenciais();
          this.spinner.hide();
          window.location.reload();
        },
        error: (e) => {
          console.log('Erro ao concluir produto:', e.error);
          alert('Falha.');
          this.spinner.hide();
        }
      });
  }
  concluir(concluirFalta: any):void {
 
  this.produtoParaConcluir = concluirFalta;
   
    
  
    const params = {
      matricula: this.matricula,
      senha: this.senha,
      id: this.produtoParaConcluir.id  
    };
  
    
    console.log('Dados enviados:', params);
  
    this.spinner.show();
    console.log('🔍 Parâmetros enviados:', params);
    // 👇 Corpo vazio (conforme backend)
    this.httpClient.post(`${environment.apiUrl}/produtofalta/confirmar-baixa`,{}, { params })
      .subscribe({
        next: (data: any) => {
          console.log('Resposta do backend:', data);
          this.mensagem = data.message;
          this.fecharFormularioCredenciais();
          this.spinner.hide();
          window.location.reload();
        },
        error: (err) => {
          console.error('❌ Erro ao concluir produto:', err);
          alert('Erro ao concluir o produto. Verifique as credenciais e tente novamente.');
          this.spinner.hide();
      
        }
      });
  }
  autorizarCompra(): void {
    if (!this.matricula || !this.senha) {
      alert('Preencha matrícula e senha');
      return;
    }
  
    const options = {
      params: { matricula: this.matricula, senha: this.senha }
    };
  
    const body = {
      id: this.autorizar,
     
      dataHoraAutorizacao: new Date().toISOString()
    };
  
   
    this.spinner.show();
  
    this.httpClient.put(`${environment.apiUrl}/produtoFalta/autorizar`, body, options)
      .subscribe({
        next: (data: any) => {
          this.mensagem = data.message;
        
          // Encontrar o produto correto
          const produto = this.produtosFalta.find(p =>
            p.fornecedores.some((f: any) => f.id === this.autorizar)
          );
        
          if (produto) {
            const fornecedor = produto.fornecedores.find((f: any) => f.id === this.autorizar);
            if (fornecedor) {
              fornecedor.usuarioAutorizador = data.result?.usuarioAutorizador || 'NÃO INFORMADO';
            }
          }
        
          this.fecharFormularioCredenciais();
          this.spinner.hide();
        },
        error: (e) => {
          console.error('❌ Erro ao autorizar produto:', e.error);
          alert('Falha.');
          this.spinner.hide();
        }
      });
  }
  

  
  // Método para filtrar os produtos de falta baseado no termo de pesquisa
  filtrarProdutosFalta(): void {
    if (this.termoPesquisa.trim() === '') {
      this.produtosFalta = [...this.originalProdutosFalta]; // Recarrega a lista original
    } else {
      const termo = this.termoPesquisa.toLowerCase();
      this.produtosFalta = this.originalProdutosFalta.filter(p =>
        Object.values(p).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(termo);
          } else if (typeof value === 'number') {
            return value.toString().includes(termo);
          }
          return false;
        })
      );
    }
    this.p = 1; // Resetar a páginação ao filtrar
  }

  toggleFiltro(loja: string) {
    if (this.filtroLoja === loja) {
      this.filtroLoja = null; // Desativa o filtro se já estava ativo
    } else {
      this.filtroLoja = loja; // Ativa o filtro para a loja escolhida
    }
  }
  produtoFiltrado(produto: any): boolean {
    if (!this.filtroLoja) {
      return true; // Sem filtro, mostra tudo
    }
  
    switch (this.filtroLoja) {
      case 'JC1':
        return this.produtoPossuiLoja(produto, 1);
      case 'JC2':
        return this.produtoPossuiLoja(produto, 2);
      case 'VA':
        return this.produtoPossuiLoja(produto, 3);
      case 'CL':
        return this.produtoPossuiLoja(produto, 4);
      default:
        return true;
    }
  }
  get produtosFaltaFiltrados() {
    return this.produtosFalta.filter(produto => this.produtoFiltrado(produto));
  }
  
}
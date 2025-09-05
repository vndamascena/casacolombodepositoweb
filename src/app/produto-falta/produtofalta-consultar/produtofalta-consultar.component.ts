import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-produtofalta-consultar',
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
  produtoParaConcluir: any;
  editarProduto: any;
  autorizar: any;
  produtoSelecionadoId: number | null = null;
  produtoAllId: number | null = null;
  termoPesquisa: string = '';
  produtosFiltradosPesquisa: any[] = [];
  originalProdutosFalta: any[] = [];
  filtroLoja: string | null = null;
  selecionados: number[] = [];
  menuFlutuante: { produto: any, lojaId: number } | null = null;
  produtosFaltaFiltrada: any[] = [];
  filtroAtivo: string | null = null;
  filtroLojaAtivo: { [key: string]: boolean } = {};

  form: FormGroup = this.formBuilder.group({
    codigo: [''],
    produtoNomeDisplay: [''],
    produtoCustom: [''],
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

  updateSelection(produto: any): void {
    if (produto.selected) {
      this.selecionados.push(produto.id);
    } else {
      this.selecionados = this.selecionados.filter(id => id !== produto.id);
    }
  }
  toggleAllSelection(): void {
    this.produtosFaltaFiltrados.forEach(produto => {
      produto.selected = this.selecionados;
      this.updateSelection(produto); // Se necessário manter lógica atual
    });
  }



  confirmarRecebimento(produto: any, lojaId: number): void {
    this.menuFlutuante = null;

    const payload: any = {
      id: produto.id,
      lojaId: lojaId
    };

    switch (lojaId) {
      case 1: payload.jC1Recebido = true; break;
      case 2: payload.jC2Recebido = true; break;
      case 3: payload.vaRecebido = true; break;
      case 4: payload.clRecebido = true; break;
    }

    this.httpClient.put(`${environment.apiUrl}/produtoFalta/chegouCor`, payload)
      .subscribe({
        next: () => {
          switch (lojaId) {
            case 1:
              produto.jC1Recebido = true;
              produto.separadoJC1 = false;
              break;
            case 2:
              produto.jC2Recebido = true;
              produto.separadoJC2 = false;
              break;
            case 3:
              produto.vaRecebido = true;
              produto.separadoVA = false;
              break;
            case 4:
              produto.clRecebido = true;
              produto.separadoCL = false;
              break;
          }
        },
        error: (err) => {
          console.error('Erro ao marcar como recebido:', err);
        }
      });
  }
  limparPesquisa() {
    this.termoPesquisa = '';
    this.filtrarProdutosFalta(); // Reaplica o filtro com campo limpo
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
  produtoRecebido(produto: any, lojaId: number): boolean {
    switch (lojaId) {
      case 1: return produto.jC1Recebido;
      case 2: return produto.jC2Recebido;
      case 3: return produto.vaRecebido;
      case 4: return produto.clRecebido;
      default: return false;
    }
  }


  onCheckmarkClick(produto: any, lojaId: number, event: MouseEvent): void {
    event.stopPropagation();

    // IMPEDIR clique se o produto já foi recebido
    if (this.produtoRecebido(produto, lojaId)) {
      return; // Já recebido, não faz nada
    }

    // Só abrir se o checkbox estiver marcado
    if (!this.produtoPossuiLoja(produto, lojaId)) {
      return;
    }

    this.menuFlutuante = { produto, lojaId };
  }



  fecharMenu(): void {
    this.menuFlutuante = null;
  }

  marcarSeparado(produto: any, lojaId: number): void {
    let payload: any = {
      id: produto.id,
      lojaId: lojaId,
      recebido: false // sinaliza que não é um recebimento
    };

    // Alternar o valor de separado localmente e no payload
    switch (lojaId) {
      case 1:
        produto.separadoJC1 = !produto.separadoJC1;
        payload.separadoJC1 = produto.separadoJC1;
        break;
      case 2:
        produto.separadoJC2 = !produto.separadoJC2;
        payload.separadoJC2 = produto.separadoJC2;
        break;
      case 3:
        produto.separadoVA = !produto.separadoVA;
        payload.separadoVA = produto.separadoVA;
        break;
      case 4:
        produto.separadoCL = !produto.separadoCL;
        payload.separadoCL = produto.separadoCL;
        break;
    }

    // Chamada ao backend
    this.httpClient.put(`${environment.apiUrl}/produtoFalta/chegouCor`, payload)
      .subscribe({
        next: () => this.fecharMenu(),
        error: (err) => console.error('Erro ao marcar como separado:', err)
      });
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
            codigoFormatado: this.formatarCodigo(produto.codigo)
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
            // Ordenar pela data de cadastro (mais antiga primeiro)
            this.produtosFalta = (produtosData as any[]).sort((a, b) =>
              new Date(a.dataHoraCadastro).getTime() - new Date(b.dataHoraCadastro).getTime()
            );

            this.originalProdutosFalta = [...this.produtosFalta];
            this.produtosFaltaFiltrada = [...this.produtosFalta];

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

  abriformularioautorizar(produto: any): void {
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
    // Sempre carrega do backend
    this.httpClient.get<any[]>(`${environment.apiUrl}/produtoFalta/${produto.id}/fornecedorProduto`)
      .subscribe(
        (fornecedoresData) => {
          produto.fornecedores = Array.isArray(fornecedoresData) ? fornecedoresData : [];

          // Define menor preço após carregar
          produto.fornecedorMenorPreco = this.getMenorPreco(produto.fornecedores);

          // Atualiza lista para refletir no front-end
          this.produtosFaltaFiltrada = [...this.produtosFalta];
          this.originalProdutosFalta = [...this.produtosFalta];
        },
        (error) => {
          console.error('Erro ao carregar os fornecedores:', error);
        }
      );
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
          this.mensagem = "Cadastro realizado com sucesso.";

          // ✅ Aqui está a correção
          if (this.produtoSelecionadoId !== null) {
            this.carregarFornecedoresDoBanco(this.produtoSelecionadoId);
          }

          this.formi.reset();
          this.produtoSelecionadoId = null;
          this.produtoSelecionadoParaCadastro = null;

          setTimeout(() => this.mensagem = '', 3000);
        },
        error: (error) => {
          console.error('Erro ao cadastrar fornecedor:', error);
          this.mensagem_erro = "Erro ao cadastrar fornecedor.";
          alert("Erro ao cadastrar. Verifique o console para mais detalhes.");
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
            produto.dataSolicitacao = body.dataSolicitacao;
          }

          this.fecharFormularioCredenciais();
          this.spinner.hide();

        },
        error: (e) => {
          console.log('Erro ao concluir produto:', e.error);
          alert('Falha.');
          this.spinner.hide();
        }
      });
  }
  concluir(concluirFalta: any): void {

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
    this.httpClient.post(`${environment.apiUrl}/produtofalta/confirmar-baixa`, {}, { params })
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
  concluirSelecionados(): void {
    // Obter os IDs dos títulos selecionados
    this.selecionados = this.produtosFalta
      .filter(produto => produto.selected) // Verificar seleção no array `titulos`
      .map(produto => produto.id);

    if (this.selecionados.length === 0) {
      alert('Nenhum produto selecionado para concluir.');
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

      this.httpClient.post<any>(`${environment.apiUrl}/produtofalta/confirmar-baixa`, {}, { params })
        .subscribe({
          next: (response: any) => {
            console.log(`produtos em falta de ID ${id} concluído com sucesso.`, response);
            sucessos.push(id);

            // Atualiza localmente o status do título
            const produto = this.produtosFalta.find(t => t.id === id);
            if (produto) produto.concluido = true;

            this.spinner.hide();
            this.fecharFormularioCredenciais();
            window.location.reload();

          },
          error: (error: any) => {
            console.error(`Erro ao concluir o produtos em falta de  ID ${id}:`, error);
            erros.push({ id, error });
          }
        });
    });

    // Exibe os resultados
    if (sucessos.length > 0) {
      alert(`${sucessos.length} produtos em falta concluídos com sucesso.`);
    }
    if (erros.length > 0) {
      alert(`${erros.length} produtos em falta não foram concluídos. Verifique os erros no console.`);
    }

    this.fecharFormularioCredenciais(); // Fecha o formulário
  }
  carregarFornecedoresDoBanco(produtoId: number): void {
    this.httpClient.get<any>(`${environment.apiUrl}/produtoFalta/${produtoId}/fornecedorProduto`)
      .subscribe({
        next: (fornecedores: any[]) => {
          const index = this.produtosFalta.findIndex(p => p.id === produtoId);
          if (index !== -1) {
            const produtoAtualizado = {
              ...this.produtosFalta[index],
              fornecedores: fornecedores,
              mostrarDetalhes: true // se quiser manter expandido
            };
            this.produtosFalta[index] = produtoAtualizado;

            // 🔁 Gatilho de atualização reativa
            this.produtosFalta = [...this.produtosFalta];
          }
        },
        error: (err) => {
          console.error('Erro ao buscar fornecedores atualizados:', err);
          alert("Erro ao atualizar fornecedores após cadastro.");
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

  exportarBancoParaExcel(): void {
    this.spinner.show();

    this.httpClient.get<any[]>(`${environment.apiUrl}/produtoFalta`)
      .subscribe({
        next: (dados) => {
          const dadosExcel: any[] = [];

          dados.forEach(p => {
            if (p.fornecedores?.length > 0) {
              p.fornecedores.forEach((f: any) => {
                dadosExcel.push({
                  ID: p.id,
                  Produto: p.nomeProduto,
                  Código: p.codigo,
                  CódigoFornecedor: p.codigoFornecedor,
                  Loja1: p.loja,
                  Loja2: p.loja2,
                  Loja3: p.loja3,
                  Loja4: p.loja4,
                  JC1Recebido: p.jC1Recebido ? 'Sim' : 'Não',
                  JC2Recebido: p.jC2Recebido ? 'Sim' : 'Não',
                  VARecebido: p.vaRecebido ? 'Sim' : 'Não',
                  CLRecebido: p.clRecebido ? 'Sim' : 'Não',
                  SeparadoJC1: p.separadoJC1 ? 'Sim' : 'Não',
                  SeparadoJC2: p.separadoJC2 ? 'Sim' : 'Não',
                  SeparadoVA: p.separadoVA ? 'Sim' : 'Não',
                  SeparadoCL: p.separadoCL ? 'Sim' : 'Não',
                  Observação: p.observacao,
                  SolicitadoEm: new Date(p.dataSolicitacao).toLocaleDateString(),
                  CadastradoEm: new Date(p.dataHoraCadastro).toLocaleDateString(),
                  UsuárioSolicitante: p.usuario,
                  UsuárioAutorizador: p.usuarioAutorizador,
                  Fornecedor: f.nome,

                  Valor: f.valor,
                  Quantidade: f.quantidade,
                  EntradaFornecedor: f.dataEntrada ? new Date(f.dataEntrada).toLocaleDateString() : '',
                  AutorizadoEm: f.dataHoraAutorizacao ? new Date(f.dataHoraAutorizacao).toLocaleDateString() : ''
                });
              });
            } else {
              // Produto sem fornecedores — ainda exporta os dados do produto
              dadosExcel.push({
                ID: p.id,
                Produto: p.nomeProduto,
                Código: p.codigo,
                CódigoFornecedor: p.codigoFornecedor,
                Loja1: p.loja,
                Loja2: p.loja2,
                Loja3: p.loja3,
                Loja4: p.loja4,
                JC1Recebido: p.jC1Recebido ? 'Sim' : 'Não',
                JC2Recebido: p.jC2Recebido ? 'Sim' : 'Não',
                VARecebido: p.vaRecebido ? 'Sim' : 'Não',
                CLRecebido: p.clRecebido ? 'Sim' : 'Não',
                SeparadoJC1: p.separadoJC1 ? 'Sim' : 'Não',
                SeparadoJC2: p.separadoJC2 ? 'Sim' : 'Não',
                SeparadoVA: p.separadoVA ? 'Sim' : 'Não',
                SeparadoCL: p.separadoCL ? 'Sim' : 'Não',
                Observação: p.observacao,
                SolicitadoEm: new Date(p.dataSolicitacao).toLocaleDateString(),
                CadastradoEm: new Date(p.dataHoraCadastro).toLocaleDateString(),
                UsuárioSolicitante: p.usuario,
                UsuárioAutorizador: p.usuarioAutorizador,
                Fornecedor: '',

                Valor: '',
                Quantidade: '',
                EntradaFornecedor: '',
                AutorizadoEm: ''
              });
            }
          });

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dadosExcel);
          const workbook: XLSX.WorkBook = {
            Sheets: { 'Relatório Completo': worksheet },
            SheetNames: ['Relatório Completo']
          };

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          FileSaver.saveAs(blob, `relatorio_completo_produtofalta_${new Date().toISOString()}.xlsx`);

          this.spinner.hide();
        },
        error: (err) => {
          console.error('Erro ao exportar:', err);
          alert('Erro ao exportar os dados completos.');
          this.spinner.hide();
        }
      });
  }



}
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment.development';
declare var bootstrap: any;

@Component({
  selector: 'app-suprimentos',
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, NgxPaginationModule, NgxSpinnerModule, NgxImageZoomModule,],
  templateUrl: './suprimentos.component.html',
  styleUrl: './suprimentos.component.css'
})
export class SuprimentosComponent implements OnInit {

  mensagem: string | null = null;
  mensagemErro: string | null = null;
  p: number = 1;
  expression: string = '';
  suprimentosFiltradas: any[] = [];
  ultimaCompra: any = null;
  dataInicio: string = '';
  dataFim: string = '';
  suprimentos: any[] = [];
  private suprimentosCarregados: boolean = false;
  tipoSuprimentos: string[] = ['ÁLCOOL EM GEL', 'AÇÚCAR', 'BOBINA DE CAIXA', 'BOBINA MQ DE CARTÃO', 'BLOCO DE NOTAS', 'CAFÉ', 'CAIXA DE SOM',
    'CALCULADORA', 'CANETA', 'CLIPS', 'CLORO', 'CLORO ATIVO', 'COPO', 'COPO DE CAFÉ', 'CUADOR DE CAFE', 'DETERGENTE', 'DESINFETANTE', 'DUREX', 'ELÁSTICO',
    'ESPONJA','ETIQUETA B VERMELHA', 'FOLHA A4', 'GRAMPEADOR', 'GRAMPO', 'LÁPIS', 'LEITOR', 'LIMPADOR MULTIUSO', 'LIXEIRA', 'MANTEIGA', 'MONITOR', 'MOEDAS', 'MOUSE', 'OUTROS',
    'PANO DE CHÃO G', 'PANO DE CHÃO P', 'PANO DE LIMPEZA', 'PAPEL HIGIÊNICO', 'PAPEL TOALHA', 'PÁ DE LIXO', 'PASTA ARQUIVO', 'PANO DE PATRO', 'PORTA PAPEL TOALHA',
    'PORTA SABONETE', 'POST-IT','SABÃO EM PÓ', 'SABONETE LÍQUIDO', 'SACO DE AREIA', 'SACO DE PAPEL ½ KG', 'SACO P/ MOEDA', 'SACO PARA LIXO 100LT',
    'SACO PARA LIXO 200LT', 'SACOLAS LEVE G', 'SACOLAS LEVE M', 'SACOLAS LEVE P', 'SACOLAS PESADA G', 'SACOLAS PESADA M', 'SACOLAS PESADA P',
    'TECLADO','TROCO', 'TINTA IMPRESSORA']

  jC1: string[] = ['JC1'];
  va: string[] = ['VA'];
  jC2: string[] = ['JC2'];
  cl: string[] = ['CL'];
  Roberta: string[] = ['ROBERTA']
  produtoSelecionado: any = null;
  suprimentoSelecionado: any = null;
  lojaSelecionada: string = '';

  LSelecionada: string | null = null;
  observacaoSelecionada: any = {};
  exibirCampoNovaObservacao = false;
  novaObservacao: string = '';
  novaObservacaoModalQuantidade: string = '';
  matricula: string = '';
  senha: string = '';
  selecionados: number[] = [];
  filtroAtivo: boolean = false;
  filtroInativo: boolean = false;
  filtroIdCompraAtivo: string | null = null;




  formSuprimentos: FormGroup = this.formBuilder.group({

    nome: ['', Validators.required],
    observacao: [''],
    quantidadeJC1: [''],
    quantidadeVA: [''],
    quantidadeJC2: [''],
    quantidadeCL: [''],
    formaPagamento: [''],
    jC1: [''],
    va: [''],
    jC2: [''],
    cl: [''],
    dataEntrega: [''],
    dataEntrega_JC2: [''],
    dataEntrega_CL: [''],
    quantidade: [''],
    loja: ['', Validators.required]




  });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService

  ) { }
  FormularioCredenciais(suprimento: any, loja: string): void {
    this.suprimentoSelecionado = suprimento;
    this.lojaSelecionada = loja;
  }
  fecharFormularioCredenciais(): void {
    this.suprimentoSelecionado = null;
    this.matricula = '';
    this.senha = '';
  }
  filtrarCompras(): void {
    const termo = this.expression.toLowerCase().trim();
    const inicioStr = this.dataInicio;
    const fimStr = this.dataFim;

    this.suprimentosFiltradas = this.suprimentos.filter(p => {
      const contemTexto = Object.values(p).some(value =>
        String(value).toLowerCase().includes(termo)
      );
      const dataNotaValida = p.dataPedido ? new Date(p.dataPedido).toISOString().slice(0, 10) : '';
      const dentroDoPeriodo =
        (!inicioStr || dataNotaValida >= inicioStr) &&
        (!fimStr || dataNotaValida <= fimStr);
      return contemTexto && dentroDoPeriodo;
    });
    this.p = 1;
    setTimeout(() => {
      this.initializePopovers();
    }, 1550);
  }

  initializePopovers() {
    const existingPopovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    existingPopovers.forEach((el: any) => {
      const popoverInstance = bootstrap.Popover.getInstance(el);
      if (popoverInstance) {
        popoverInstance.dispose();
      }
    });

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    console.log(`Encontrados ${popoverTriggerList.length} elementos para popover.`);
    popoverTriggerList.map(function (popoverTriggerEl: any) {
      return new bootstrap.Popover(popoverTriggerEl, {
        html: true,
        trigger: 'hover',
        placement: 'right'
      });
    });
    console.log('✅ Popovers inicializados ou re-inicializados!');
  }
  limparPesquisa() {
    this.expression = '';
    this.filtrarCompras();
  }
  getColor(index: number): string {
    return index % 2 === 0 ? '#8bc546' : '#ffffff';
  }


  ngOnInit(): void {
    const lojas = ['JC1', 'VA', 'JC2', 'CL'];

    this.httpClient.get(environment.financa + "/suprimentos")
      .subscribe({
        next: (comprasData) => {
          this.suprimentos = (comprasData as any[]).sort((a, b) => {
            // calcula se 'a' está totalmente entregue
            const aEntregue = lojas.every(loja => {
              const campoData = (loja === 'JC2') ? 'dataEntrega_JC2' : (loja === 'CL') ? 'dataEntrega_CL' : 'dataEntrega';
              // checa flags possíveis de "ativa"
              const ativoUpper = a[loja] === 1 || a[loja] === true || a[loja] === '1';
              const ativoLower = a[loja.toLowerCase?.()] === 1 || a[loja.toLowerCase?.()] === true;
              const ativoJC1 = (loja === 'JC1') && (a['jC1'] === 1 || a['jC1'] === true);
              const quantidade = a[`quantidade${loja}`];
              const ativo = !!(ativoUpper || ativoLower || ativoJC1 || (typeof quantidade === 'number' && quantidade > 0));
              if (!ativo) return true; // loja inativa → não conta (retorna true para every)
              return !!a[campoData];   // loja ativa → precisa ter data
            });

            // calcula se 'b' está totalmente entregue
            const bEntregue = lojas.every(loja => {
              const campoData = (loja === 'JC2') ? 'dataEntrega_JC2' : (loja === 'CL') ? 'dataEntrega_CL' : 'dataEntrega';
              const ativoUpper = b[loja] === 1 || b[loja] === true || b[loja] === '1';
              const ativoLower = b[loja.toLowerCase?.()] === 1 || b[loja.toLowerCase?.()] === true;
              const ativoJC1 = (loja === 'JC1') && (b['jC1'] === 1 || b['jC1'] === true);
              const quantidade = b[`quantidade${loja}`];
              const ativo = !!(ativoUpper || ativoLower || ativoJC1 || (typeof quantidade === 'number' && quantidade > 0));
              if (!ativo) return true;
              return !!b[campoData];
            });

            // pendentes (não entregues) primeiro
            if (!aEntregue && bEntregue) return -1;
            if (aEntregue && !bEntregue) return 1;

            // empate → ordenar pela data do pedido
            const ad = a.dataPedido ? new Date(a.dataPedido).getTime() : 0;
            const bd = b.dataPedido ? new Date(b.dataPedido).getTime() : 0;
            return ad - bd;
          });

          this.suprimentosFiltradas = [...this.suprimentos];
          console.log('📦 Compras carregadas e ordenadas:', this.suprimentos);
          this.suprimentosCarregados = true;
        },
        error: (e) => {
          console.log("Erro ao carregar compras:", e.error);
        }
      });
  }



  onLojaCheckboxChange(produto: any, loja: string, event: any): void {
    const marcado = event.target.checked;

    const payload = {
      id: produto.id,
      lojaNome: loja,
      marcado: marcado
    };

    this.httpClient.put(`${environment.apiUrl}/produtoFalta/lojas`, payload)
      .subscribe({
        next: (res) => {
          console.log('Loja atualizada com sucesso!', res);
          produto[loja] = marcado;
        },
        error: (err) => {
          console.error('Erro ao atualizar loja', err);
          event.target.checked = !marcado;
        }
      });
  }

  formatarQuantidade(valor: any): string {
    const numero = Number(valor ?? 0);
    return numero.toString().padStart(0, '0');
  }
  abrirModalQuantidade(produto: any, loja: string, event: Event) {
    event.preventDefault(); // impede seleção dupla
    event.stopPropagation();

    // Verifica se já foi marcada → impede edição
    if (this.produtoPossuiLojaIndividual(produto, loja)) return;

    this.produtoSelecionado = { ...produto }; // clona
    this.lojaSelecionada = loja;

    this.formSuprimentos.patchValue({ quantidade: '' });

    const modal = new bootstrap.Modal(document.getElementById('modalQuantidade')!);
    modal.show();
  }

  confirmarCadastroLoja(): void {
    const quantidade = this.formSuprimentos.get('quantidade')?.value;
    if (quantidade === null || quantidade === undefined || isNaN(quantidade)) {
      alert('Informe uma quantidade válida');
      return;
    }

    const lojaKey = this.lojaSelecionada; // ex: 'jC1', 'va', etc.
    const produto = this.produtoSelecionado;
    const rawObs = this.formSuprimentos.get('observacao')?.value?.trim();



    const observacao = rawObs || null;

    const payload: any = {
      id: produto.id,
      nome: produto.nome,
      observacao: observacao,
      dataPedido: produto.dataPedido,


      quantidadeJC1: produto.quantidadeJC1 ?? 0,
      quantidadeVA: produto.quantidadeVA ?? 0,
      quantidadeJC2: produto.quantidadeJC2 ?? 0,
      quantidadeCL: produto.quantidadeCL ?? 0,

      jC1: produto.jC1 ?? false,
      va: produto.va ?? false,
      jC2: produto.jC2 ?? false,
      cl: produto.cl ?? false
    };

    switch (lojaKey) {
      case 'jC1':
        payload.quantidadeJC1 = +quantidade;
        payload.jC1 = true;
        break;
      case 'va':
        payload.quantidadeVA = +quantidade;
        payload.va = true;
        break;
      case 'jC2':
        payload.quantidadeJC2 = +quantidade;
        payload.jC2 = true;
        break;
      case 'cl':
        payload.quantidadeCL = +quantidade;
        payload.cl = true;
        break;
    }

    this.httpClient.put(`${environment.financa}/suprimentos/lojas`, payload).subscribe({
      next: () => {
        // Fecha o modal
        const modalElement = document.getElementById('modalQuantidade');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        }

        // Agora faz um GET só do item atualizado
        this.httpClient.get(`${environment.financa}/suprimentos/${this.produtoSelecionado.id}`).subscribe({
          next: (itemAtualizado: any) => {
            const index = this.suprimentosFiltradas.findIndex(s => s.id === itemAtualizado.id);
            if (index !== -1) {
              this.suprimentosFiltradas.splice(index, 1, itemAtualizado);
              this.suprimentosFiltradas = [...this.suprimentosFiltradas];
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Erro ao buscar item atualizado:', err);
          }
        });
      }
    })

  }

  produtoPossuiLojaIndividual(produto: any, loja: string): boolean {
    return produto?.[loja] === true;
  }

  cadastrar() {
    if (this.formSuprimentos.invalid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const form = this.formSuprimentos.value;

    // 🔍 LOG 1 — Valor completo do formulário
    console.log('📦 Formulário completo:', form);

    if (!form.loja) {
      console.warn('⚠️ Nenhuma loja selecionada');
      alert('Selecione uma loja.');
      return;
    }

    const quantidade = +form.quantidade;
    if (!quantidade || quantidade <= 0) {
      console.warn('⚠️ Quantidade inválida:', quantidade);
      alert('Informe uma quantidade válida.');
      return;
    }

    const payload = {
      nome: form.nome,
      observacao: form.observacao,


      quantidadeJC1: 0,
      quantidadeVA: 0,
      quantidadeJC2: 0,
      quantidadeCL: 0,

      jC1: false,
      va: false,
      jC2: false,
      cl: false
    };

    // Preenche a loja e quantidade correta
    switch (form.loja) {
      case 'jC1':
        payload.jC1 = true;
        payload.quantidadeJC1 = quantidade;
        break;
      case 'va':
        payload.va = true;
        payload.quantidadeVA = quantidade;
        break;
      case 'jC2':
        payload.jC2 = true;
        payload.quantidadeJC2 = quantidade;
        break;
      case 'cl':
        payload.cl = true;
        payload.quantidadeCL = quantidade;
        break;
    }

    // 🔍 LOG 2 — Payload que será enviado
    console.log('📤 Payload final enviado ao backend:', payload);

    this.spinner.show();

    this.httpClient.post(`${environment.financa}/suprimentos`, payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.mensagem = 'Suprimento cadastrado com sucesso!';
        this.formSuprimentos.reset();
        this.ngOnInit();
      },
      error: (err) => {
        this.spinner.hide();
        this.mensagemErro = err?.error || 'Erro ao cadastrar suprimento.';
        console.error('❌ Erro no cadastro:', err);
      }
    });
  }

  selecionarLoja(loja: string): void {
    const lojaAtual = this.formSuprimentos.get('loja')?.value;

    if (lojaAtual === loja) {
      this.formSuprimentos.patchValue({ loja: '' }); // desmarca se clicar de novo
    } else {
      this.formSuprimentos.patchValue({ loja }); // marca nova loja
    }
  }

  mostraObservacao(suprimentos: any): void {
    this.observacaoSelecionada = suprimentos;
    const modalElement = document.getElementById('modalObservacao');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }
  toggleNovaObservacao(): void {
    this.exibirCampoNovaObservacao = !this.exibirCampoNovaObservacao;

    if (this.exibirCampoNovaObservacao) {
      this.lojaSelecionada = '';
      this.novaObservacao = '';
    }
  }

  salvarObservacao() {
    if (!this.novaObservacao?.trim()) {
      alert('Digite uma observação antes de salvar.');
      return;
    }

    // Define loja fictícia se nenhuma foi selecionada
    if (!this.lojaSelecionada) {
      this.lojaSelecionada = 'ROBERTA';
    }

    const observacaoParaSalvar = {
      id: this.observacaoSelecionada.id,
      observacao: this.novaObservacao,
      JC1: this.lojaSelecionada === 'JC1',
      JC2: this.lojaSelecionada === 'JC2',
      VA: this.lojaSelecionada === 'VA',
      CL: this.lojaSelecionada === 'CL'
    };

    this.httpClient.put(`${environment.financa}/suprimentos/observacao`, observacaoParaSalvar).subscribe({
      next: () => {
        const data = new Date();
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const novaLinha = `[${dataFormatada} - ${this.lojaSelecionada}] ${this.novaObservacao}`;

        if (this.observacaoSelecionada.observacao) {
          this.observacaoSelecionada.observacao += `\n${novaLinha}`;
        } else {
          this.observacaoSelecionada.observacao = novaLinha;
        }

        this.novaObservacao = '';
        this.lojaSelecionada = '';
        this.exibirCampoNovaObservacao = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao salvar observação.');
      }
    });
  }

  confirmarEntrega(): void {
    if (!this.suprimentoSelecionado || !this.lojaSelecionada) {
      console.error('Nenhum suprimento ou loja selecionada para baixa');
      return;
    }

    const quantidade = this.formSuprimentos.get('quantidade')?.value;
    if (quantidade === null || quantidade === undefined || isNaN(quantidade)) {
      alert('Informe uma quantidade válida');
      return;
    }

    const suprimento = this.suprimentoSelecionado;
    const dataEntregaDate = new Date().toISOString().split('T')[0];

    // Monta o payload inicial
    const payload: any = {
      id: suprimento.id,
      nome: suprimento.nome,
      observacao: suprimento.observacao ?? null,
      dataPedido: suprimento.dataPedido,

      quantidadeJC1: suprimento.quantidadeJC1 ?? null,
      quantidadeVA: suprimento.quantidadeVA ?? null,
      quantidadeJC2: suprimento.quantidadeJC2 ?? null,
      quantidadeCL: suprimento.quantidadeCL ?? null,

      jC1: suprimento.jC1 ?? false,
      va: suprimento.va ?? false,
      jC2: suprimento.jC2 ?? false,
      cl: suprimento.cl ?? false,

      dataEntrega: suprimento.dataEntrega ?? null,
      dataEntrega_JC2: suprimento.dataEntrega_JC2 ?? null,
      dataEntrega_CL: suprimento.dataEntrega_CL ?? null,

      ativo: false
    };

    console.log('Antes do switch:', payload);

    // Atualiza apenas a loja selecionada
    switch (this.lojaSelecionada.toLowerCase()) {
      case 'jc1':
        payload.quantidadeJC1 = +quantidade;
        payload.jC1 = true;
        payload.dataEntrega = dataEntregaDate;
        break;
      case 'va':
        payload.quantidadeVA = +quantidade;
        payload.va = true;
        payload.dataEntrega = dataEntregaDate;
        break;
      case 'jc2':
        payload.quantidadeJC2 = +quantidade;
        payload.jC2 = true;
        payload.dataEntrega_JC2 = dataEntregaDate;
        break;
      case 'cl':
        payload.quantidadeCL = +quantidade;
        payload.cl = true;
        payload.dataEntrega_CL = dataEntregaDate;
        break;
      default:
        console.error('Loja selecionada inválida:', this.lojaSelecionada);
        return;
    }


    console.log('Payload após switch:', payload);

    if (this.matricula && this.senha) {
      const options = { params: { matricula: this.matricula, senha: this.senha } };

      console.log('Enviando para API...');
      this.httpClient.put(`${environment.financa}/suprimentos/baixa`, payload, options)
        .subscribe({
          next: (res: any) => {
            console.log('Resposta da API:', res);
            this.mensagem = res.message || 'Entrega confirmada com sucesso!';
            this.mensagemErro = null;
            this.fecharFormularioCredenciais();
            this.ngOnInit();
          },
          error: (err) => {
            console.error('Erro ao chamar API:', err);
            this.mensagemErro = err.error?.message || 'Erro ao confirmar entrega.';
            this.mensagem = null;
          }
        });
    } else {
      console.error('Matrícula ou senha não informadas');
    }
  }


  get produtosFaltaFiltrados() {
    return this.suprimentos;
  }





  onFiltroCheck(): void {
    // Garante que só um checkbox pode ser marcado por vez (opcional)
    if (this.filtroAtivo) this.filtroInativo = false;
    else if (this.filtroInativo) this.filtroAtivo = false;

    this.filtrarCobranca();

    // Se tinha filtro de ID de compra ativo via rota, limpa
    if (this.filtroIdCompraAtivo) {
      this.router.navigate([], {
        queryParams: { idCompra: null },
        queryParamsHandling: 'merge'
      }).then(() => {
        this.filtroIdCompraAtivo = null;
        this.mensagem = '';
      });
    }
  }

  filtrarCobranca(): void {
    const termo = this.expression?.toLowerCase().trim() || '';
    const inicioStr = this.dataInicio;
    const fimStr = this.dataFim;
    const lojas = ['JC1', 'VA', 'JC2', 'CL'];

    this.suprimentosFiltradas = this.suprimentos
      .filter(suprimento => {
        // Verifica se o termo aparece em algum campo
        const contemTexto = termo === '' || Object.values(suprimento).some(value => {
          if (value == null) return false;
          return value.toString().toLowerCase().includes(termo);
        });

        // Filtra pelo período
        const dataVenc = suprimento.dataPedido ? new Date(suprimento.dataPedido) : null;
        let dataFimFiltrada: Date | null = null;
        let dataInicioFiltrada: Date | null = null;

        if (inicioStr) dataInicioFiltrada = new Date(inicioStr);
        if (fimStr) {
          dataFimFiltrada = new Date(fimStr);
          dataFimFiltrada.setDate(dataFimFiltrada.getDate() + 1);
        }

        const dentroDoPeriodo =
          (!dataInicioFiltrada || (dataVenc && dataVenc >= dataInicioFiltrada)) &&
          (!dataFimFiltrada || (dataVenc && dataVenc < dataFimFiltrada));

        // Verifica se este cadastro está totalmente entregue (considerando só lojas ativas)
        const cadastroTotalmenteInativo = lojas.every(loja => {
          const campoData = (loja === 'JC2') ? 'dataEntrega_JC2' : (loja === 'CL') ? 'dataEntrega_CL' : 'dataEntrega';
          const ativoUpper = suprimento[loja] === 1 || suprimento[loja] === true || suprimento[loja] === '1';
          const ativoLower = suprimento[loja.toLowerCase?.()] === 1 || suprimento[loja.toLowerCase?.()] === true;
          const ativoJC1 = (loja === 'JC1') && (suprimento['jC1'] === 1 || suprimento['jC1'] === true);
          const quantidade = suprimento[`quantidade${loja}`];
          const ativo = !!(ativoUpper || ativoLower || ativoJC1 || (typeof quantidade === 'number' && quantidade > 0));
          if (!ativo) return true; // loja inativa não impede o every
          return !!suprimento[campoData];
        });

        const statusValido =
          (!this.filtroAtivo && !this.filtroInativo) ||                // nenhum filtro
          (this.filtroAtivo && !cadastroTotalmenteInativo) ||          // mostra pendentes (ativos sem entrega)
          (this.filtroInativo && cadastroTotalmenteInativo);           // mostra entregues

        return contemTexto && dentroDoPeriodo && statusValido;
      })
      // Garante que, mesmo no resultado filtrado, pendentes fiquem acima dos entregues
      .sort((a, b) => {
        const aEnt = lojas.every(loja => {
          const campoData = (loja === 'JC2') ? 'dataEntrega_JC2' : (loja === 'CL') ? 'dataEntrega_CL' : 'dataEntrega';
          const ativoUpper = a[loja] === 1 || a[loja] === true || a[loja] === '1';
          const ativoLower = a[loja.toLowerCase?.()] === 1 || a[loja.toLowerCase?.()] === true;
          const ativoJC1 = (loja === 'JC1') && (a['jC1'] === 1 || a['jC1'] === true);
          const quantidade = a[`quantidade${loja}`];
          const ativo = !!(ativoUpper || ativoLower || ativoJC1 || (typeof quantidade === 'number' && quantidade > 0));
          if (!ativo) return true;
          return !!a[campoData];
        });

        const bEnt = lojas.every(loja => {
          const campoData = (loja === 'JC2') ? 'dataEntrega_JC2' : (loja === 'CL') ? 'dataEntrega_CL' : 'dataEntrega';
          const ativoUpper = b[loja] === 1 || b[loja] === true || b[loja] === '1';
          const ativoLower = b[loja.toLowerCase?.()] === 1 || b[loja.toLowerCase?.()] === true;
          const ativoJC1 = (loja === 'JC1') && (b['jC1'] === 1 || b['jC1'] === true);
          const quantidade = b[`quantidade${loja}`];
          const ativo = !!(ativoUpper || ativoLower || ativoJC1 || (typeof quantidade === 'number' && quantidade > 0));
          if (!ativo) return true;
          return !!b[campoData];
        });

        if (!aEnt && bEnt) return -1;
        if (aEnt && !bEnt) return 1;
        const ad = a.dataPedido ? new Date(a.dataPedido).getTime() : 0;
        const bd = b.dataPedido ? new Date(b.dataPedido).getTime() : 0;
        return ad - bd;
      });

    this.p = 1;
  }




}

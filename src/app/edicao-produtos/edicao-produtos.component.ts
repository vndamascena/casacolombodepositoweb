import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-edicao-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edicao-produtos.component.html',
  styleUrls: ['./edicao-produtos.component.css']
})
export class EdicaoProdutosComponent implements OnInit {

 

  form: FormGroup = this.formBuilder.group({
    codigo: [''],
    nome: [''],
    marca: [''],
    quantidade: [''],
    pei: [''],
    descricao: [''],
    pecasCaixa: [''],
    metroQCaixa: [''],
    precoMetroQ: [''],
    precoCaixa: [''],
    categoriaId: [''],
    fornecedorId: [''],
    depositoId: [''],
    imagemUrl: [''],
    lote: this.formBuilder.array([]),
  });

  mensagem: string = '';
  depositos: any[] = []; 
  categorias: any[] = [];
  fornecedores: any[] = [];
  produto: any = {};
  produtoselecionado: any;
  matricula: string = ''; 
  senha: string = '';
 

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  get f() : any {
    return this.form.controls;
    
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      
      nome: ['', [
        //campo 'nome'
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-Üà-ü0-9\s]{4,100}$/)
      ]],
      marca: [''],
      pei: [''],
      quantidade: [''],
      descricao: ['',[
        Validators.required,
        Validators.maxLength(500),
        Validators.minLength(8)
      ]],
      pecasCaixa: [''],
      metroQCaixa: [''],
      precoMetroQ: [''],
      precoCaixa: [''],
      categoriaId: ['',[
        Validators.required
      ]],
      fornecedorId: ['',[
        Validators.required
      ]],
      depositoId: ['',[
        Validators.required
      ]],
      imagemUrl: [''],
      lote: this.formBuilder.array([]),

    });


    this.httpClient.get(`${environment.apiUrl}/produto/${productId}`)
    .subscribe({
      next: (data: any) => {
        this.produto = data;
        this.form.patchValue(data); // Preencher os outros campos do formulário

        // Verificar se 'lote' está presente nos dados recebidos
        if (data.lote && Array.isArray(data.lote)) {
          this.setLotes(data.lote); // Preencher o array 'lote' no formulário
        }
      },
      error: (error) => {
        console.error('Erro ao recuperar detalhes do produto:', error);
      }
    });


    
  }
  
  abrirFormularioCredenciais(produto: any): void {
    this.produtoselecionado= produto;
  }
  fecharFormularioCredenciais(): void {
    this.produtoselecionado = null;
    this.matricula = '';
    this.senha = '';
  }

  onSubmit(): void {
    const productId = this.route.snapshot.params['id'];
    const formDataWithId = { ...this.form.value, id: productId };

    if (this.matricula && this.senha) {
      // Configuração dos parâmetros da solicitação PUT
      const options = { params: { matricula: this.matricula, senha: this.senha } };

      this.httpClient.put(`${environment.apiUrl}/produto`, formDataWithId, options)
        .subscribe({
          next: (data: any) => {
            this.mensagem = data.message;
            //this.form.reset();
            this.router.navigate(['/consulta-produtos']);
            this.fecharFormularioCredenciais();
          },
          error: (error) => {
            console.error('Erro ao atualizar produto:', error);
            alert('Erro ao atualizar o produto. Verifique os campos e tente novamente.');
          }
        });
    } else {
      alert('Preencha os campos de matrícula e senha para confirmar a edição.');
    }
  }


 
  

  adicionarLote(): void {
    const novoLote = this.formBuilder.group({
      codigo: [''],
      numeroLote: [''],
      quantidadeLote: [''],
      ala:[''],

    });
    this.lotes.push(novoLote);
  }

  setLotes(lotes: any[]): void {
    console.log('Lotes:', lotes); // Verifique se os lotes estão sendo recebidos corretamente
    const loteFormArray = this.form.get('lote') as FormArray;
    lotes.forEach(lote => {
      loteFormArray.push(this.formBuilder.group({
        id: [lote.id], // Certifique-se de incluir a propriedade 'id'
        codigo:[lote.codigo],
        numeroLote: [lote.numeroLote],
        quantidadeLote: [lote.quantidadeLote],
        ala:[lote.ala],
      }));
    });
  }

  get lotes(): FormArray {
    return this.form.get('lote') as FormArray;
  }

  // Função para excluir um lote
  // No método que exclui o lote
excluirLote(produtoId: string, loteId: string): void {

  
    // Remover o último campo de lote localmente
    this.lotes.removeAt(this.lotes.length - 1);
    
  
  this.httpClient.delete(`${environment.apiUrl}/produto/${produtoId}/lotes/${loteId}`)
    .subscribe({
      next: () => {
        console.log('Lote excluído com sucesso!');
        // Atualizar a lista de lotes após a exclusão
        this.atualizarListaLotes(produtoId);
        // Recarregar a página
        window.location.reload();
      },
      error: (error) => {
        console.error('Erro ao excluir lote:', error);
      }
    });
}

  

  // Função para atualizar a lista de lotes após a exclusão
  atualizarListaLotes(produtoId: string): void {
    this.httpClient.get(`${environment.apiUrl}/produto/${produtoId}`)
      .subscribe({
        next: (data: any) => {
          console.log('Data recebida:', data);
          if (Array.isArray(data)) {
            console.log('Lista de lotes atualizada com sucesso!', data);
            // Atualizar a lista de lotes na interface do usuário
            this.setLotes(data);
          } else {
            console.error('Erro: a resposta não é um array de lotes.');
          }
        },
        error: (error) => {
          console.error('Erro ao recuperar a lista de lotes:', error);
        }
      });
  }
  atualizarPrecoCaixa(): void {
    const precoMetroQControl = this.form.get('precoMetroQ');
    const metroQCaixaControl = this.form.get('metroQCaixa');
    const precoCaixaControl = this.form.get('precoCaixa');

    if (precoMetroQControl && metroQCaixaControl && precoCaixaControl) {
      const precoMetroQValue = precoMetroQControl.value;
      const metroQCaixaValue = metroQCaixaControl.value;

      if (typeof precoMetroQValue === 'string' && typeof metroQCaixaValue === 'string') {
        // Substituir vírgulas por pontos
        const precoM2 = parseFloat(precoMetroQValue.replace(',', '.')) || 0;
        const m2CX = parseFloat(metroQCaixaValue.replace(',', '.')) || 0;

        if (!isNaN(precoM2) && !isNaN(m2CX)) {
          const precoCX = precoM2 * m2CX;
          precoCaixaControl.setValue(precoCX.toFixed(2).replace('.', ','));
        } else {
          precoCaixaControl.setValue('0,00');
        }
      } else {
        precoCaixaControl.setValue('0,00');
      }
    } else {
      console.error("Um dos controles é nulo.");
    }
  }
  
  
}
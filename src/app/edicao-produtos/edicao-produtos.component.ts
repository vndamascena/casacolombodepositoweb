import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
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
    categoriaId: [''],
    fornecedorId: [''],
    depositoId: [''],
    imagemUrl: [''],
    lote: this.formBuilder.array([]),
  });
  categorias: any[] = [];
  fornecedores: any[] = [];
  produto: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      codigo: [''],
      nome: [''],
      marca: [''],
      pei: [''],
      quantidade: [''],
      descricao: [''],
      categoriaId: [''],
      fornecedorId: [''],
      depositoId: [''],
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


    this.httpClient.get(`${environment.apiUrl}/categoria`)
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });

    this.httpClient.get(`${environment.apiUrl}/fornecedor`)
      .subscribe({
        next: (data) => {
          this.fornecedores = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }

  onSubmit(): void {
    const productId = this.route.snapshot.params['id'];
    const formDataWithId = { ...this.form.value, id: productId };

    this.httpClient.put(`${environment.apiUrl}/produto/${productId}`, formDataWithId)
      .subscribe({
        next: (data) => {
          console.log('Produto atualizado com sucesso!', data);
          this.router.navigate(['/consulta-produtos']);
        },
        error: (error) => {
          console.error('Erro ao atualizar produto:', error);
        }
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imagePath: string = reader.result as string;
        this.form.get('imagemUrl')?.setValue(imagePath);
      };
    }
  }

  adicionarLote(): void {
    const novoLote = this.formBuilder.group({
      numeroLote: [''],
      quantidadeLote: [''],
    });
    this.lotes.push(novoLote);
  }

  setLotes(lote: any[]): void {
    const loteFormArray = this.form.get('lote') as FormArray;
    lote.forEach(lote => {
      loteFormArray.push(this.formBuilder.group({
        numeroLote: [lote.numeroLote],
        quantidadeLote: [lote.quantidadeLote],
      }));
    });
  }

  get lotes(): FormArray {
    return this.form.get('lote') as FormArray;
  }
}
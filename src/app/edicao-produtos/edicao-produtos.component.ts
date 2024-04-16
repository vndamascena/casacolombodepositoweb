  import { CommonModule } from '@angular/common';
  import { HttpClient } from '@angular/common/http';
  import { Component, OnInit } from '@angular/core';
  import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule} from '@angular/forms'; 
  import { ActivatedRoute, RouterModule, Router} from '@angular/router';
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
      lote: [''],
      descricao: [''],
      categoriaId: [''],
      fornecedorId: [''],
      depositoId: [''],
      imagemUrl: ['']
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
        quantidade: [''],
        lote: [''],
        descricao: [''],
        categoriaId: [''],
        fornecedorId: [''],
        depositoId: [''],
        imagemUrl: ['']
      });

     

      this.httpClient.get(`http://localhost:5096/api/produto/${productId}`)
        .subscribe({
          next: (data) => {
            this.produto = data;
            this.form.patchValue(data); // Preenche os campos do formulário com os dados do produto
          },
          error: (error) => {
            console.error('Erro ao recuperar detalhes do produto:', error);
          }
        });

      this.httpClient.get(environment.apiUrl + "/categoria")
        .subscribe({
          next: (data) => {
            this.categorias = data as any[];
          },
          error: (e) => {
            console.log(e.error);
          }
        });

      this.httpClient.get(environment.apiUrl + "/fornecedor")
        .subscribe({
          next: (data) => {
            this.fornecedores = data as any[];
          },
          error: (e) => {
            console.log(e.error);
          }
        });
    }

    ngSubmit(): void {
      const productId = this.route.snapshot.params['id'];
      // Adiciona o id do produto ao objeto do formulário antes de enviar a requisição PUT
      const formDataWithId = { ...this.form.value, id: productId };
    
      this.httpClient.put(`http://localhost:5096/api/produto/`, formDataWithId)
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
  }
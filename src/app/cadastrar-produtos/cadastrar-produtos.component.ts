import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produtos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './cadastrar-produtos.component.html',
  styleUrl: './cadastrar-produtos.component.css'
})
export class CadastrarProdutosComponent implements OnInit {

  // atributos
  categorias: any[] = [];
  fornecedores: any[] = [];
  produto: any = {}; // objeto para armazenar os dados do produto

  // construtor
  constructor(
    private httpClient: HttpClient
  ) { }

  //criando a estrutura do formulário
  form = new FormGroup({
    codigo: new FormControl(''),
    nome: new FormControl(''),
    marca: new FormControl(''),
    quantidade: new FormControl(''),
    lote: new FormControl(''),
    descricao: new FormControl(''),
    categoriaId: new FormControl(''),
    fornecedorId: new FormControl(''),
    depositoId: new FormControl(''),
    imagemUrl: new FormControl(''),


  });


  // função executada no momento em que o componente é carregado
  ngOnInit(): void {
    // executando o endpoint de consulta de categorias na API
    this.httpClient.get(environment.apiUrl + "/categoria")
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    // executando o endpoint de consulta de fornecedores na API
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

  // método para realizar o cadastro
  onSubmit(): void {
    //enviando uma requisição POST para a API
    this.httpClient.post(environment.apiUrl + "/produto",
      this.form.value)
      .subscribe({
        next: (data: any) => {
          alert(data.message); //exibir mensagem de sucesso
          this.form.reset(); //limpar os campos do formulário
        },
        error: (e) => {
          console.log(e.error);
          alert('Falha ao cadastrar o produto.');
        }
      });
  }
  // Função para lidar com a seleção de arquivo no frontend
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Obtém o caminho do arquivo após a leitura
        const imagePath: string = reader.result as string;
        // Define o valor do campo imagemUrl no formulário como o caminho do arquivo
        this.form.get('imagemUrl')?.setValue(imagePath);
      };
    }
  }

}

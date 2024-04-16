import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, RouterModule, Router} from '@angular/router';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-edicao-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edicao-produtos.component.html',
  styleUrls: ['./edicao-produtos.component.css']
})
export class EdicaoProdutosComponent implements OnInit {

   //atributos
   categorias: any[] = [];
   fornecedores: any[] = [];
   produto: any = {}; // Objeto para armazenar os detalhes do produto

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    // Recuperar o ID do produto da URL
    const productId = this.route.snapshot.params['id'];
    
    // Fazer requisição para obter os detalhes do produto da API
    this.httpClient.get(`http://localhost:5096/api/produto/${productId}`)
      .subscribe({
        next: (data) => {
          this.produto = data; // Atribuir os detalhes do produto ao objeto 'produto'
        },
        error: (error) => {
          console.error('Erro ao recuperar detalhes do produto:', error);
        }
      });

    //executando o endpoint de consulta de categorias na API
    this.httpClient.get(environment.apiUrl + "/categoria")
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    //executando o endpoint de consulta de fornecedores na API
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

  // Método para atualizar os detalhes do produto na API
  atualizarProduto(): void {
    const productId = this.route.snapshot.params['id']; // Recuperar o ID do produto da URL
    this.httpClient.put(`http://localhost:5096/api/produto/${productId}`, this.produto)
      .subscribe({
        next: (data) => {
          console.log('Produto atualizado com sucesso!', data);
          // Redirecionar o usuário para outra página após a atualização bem-sucedida
          this.router.navigate(['/consulta-produtos']);
        },
        error: (error) => {
          console.error('Erro ao atualizar produto:', error);
        }
      });
  }
}

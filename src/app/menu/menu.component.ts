import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute,Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink, CommonModule, FormsModule, RouterModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  loteSelecionado: any;
  matricula: string = ''; // Propriedade para armazenar a matrícula do usuário
  senha: string = ''; // Propriedade para armazenar a senha do usuário
  produtos: any[] = []; // Array de objetos para armazenar produtos
  expression: string = ''; // String para armazenar a expressão de pesquisa
  imagemAmpliadaUrl: string | null = null; // URL da imagem ampliada
  produtosFiltrados: any[] = []; // Array para armazenar produtos filtrados
  termoPesquisa: string = ''; // String para armazenar o termo de pesquisa
  mensagem: string = '';

  produto: any = {}; // Objeto para armazenar os detalhes do produto atual
  lotes: any[] = []; // Array para armazenar os lotes do produto atual
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }


  ngOnInit(): void {
    // Recupera o ID do produto da URL
    const productId = this.route.snapshot.queryParams['id'];

    // Verifica se o ID do produto está presente na URL
    
  }

  filtrarProdutos(): void {
    if (this.expression.trim() === '') {
      // Se a expressão de pesquisa estiver vazia, recarrega todos os produtos
      this.ngOnInit();
    } else {
      // Filtra os produtos com base na expressão de pesquisa
      this.produtos = this.produtos.filter(p =>
        Object.values(p).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(this.expression.toLowerCase())
        )
      );
    }
  } 

}


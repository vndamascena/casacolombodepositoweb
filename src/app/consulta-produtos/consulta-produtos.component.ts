import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, RouterModule, Router} from '@angular/router';



@Component({
  selector: 'app-consulta-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consulta-produtos.component.html',
  styleUrl: './consulta-produtos.component.css'
})
export class ConsultaProdutosComponent implements OnInit {

  produtos: any[] = []; //array de objetos
  expression: string = '';
  imagemAmpliadaUrl: string | null = null;
  
  produto: any = {}; // Objeto para armazenar os detalhes do produto
  //construtor para inicializar os atributos da classe
  constructor(
    private route: ActivatedRoute, 
    private httpClient: HttpClient, 
    private router: Router) { }

 ngOnInit(): void {
    // Recuperar o ID do produto da URL
    const productId = this.route.snapshot.queryParams['id'];

    // Verificar se o ID do produto está presente na URL
    if (productId) {
      this.httpClient.get(`http://localhost:5096/api/produto/${productId}`)
        .subscribe({
          next: (data) => {
            this.produtos = [data];
          },
          error: (e) => {
            console.log(e);
          }
        });
    } else {
      // Se não houver ID do produto na URL, exibir todos os produtos
      this.httpClient.get('http://localhost:5096/api/produto')
        .subscribe({
          next: (data) => {
            this.produtos = data as any[];
          },
          error: (e) => {
            console.log(e);
          }
        });
    }
  }

  // Método para redirecionar para a página de edição com o ID do produto
  editarProduto(id: string): void {
    this.router.navigate(['/edicao-produtos', id]);
  }

  // Método para expandir a imagem na mesma página
  expandirImagem(imagemUrl: string): void {
    console.log('Imagem clicada:', imagemUrl);
    this.imagemAmpliadaUrl = imagemUrl;
    // Adiciona uma classe para mostrar a imagem ampliada
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
}


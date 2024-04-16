import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'  
})
export class InicioComponent {

  produtos: any[] = []; // array de objetos
  expression: string = '';

  // construtor para inicializar os atributos da classe
  constructor(
    private httpClient: HttpClient,
    private router: Router // Injetar serviço Router
  ) { }

  // Método para buscar um produto por ID
  buscarProdutoPorId(id: string): void {
    this.router.navigate(['/consulta-produtos'], { queryParams: { id } });
  }

  // Método para buscar um produto por ID ao clicar no link
  buscarProdutoClicado(id: string): void {
    // Chama a função para buscar o produto por ID
    this.buscarProdutoPorId(id);
  }

  

}

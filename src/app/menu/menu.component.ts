import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-menu',
    imports: [
        CommonModule, FormsModule, RouterModule
    ],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  autent: boolean = false; // Variável para controlar a exibição do menu
  matricula: string = "";
  senha: string = "";
  nome:string =""
  menuTipo: string = '';
   constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }
ngOnInit(): void {
  const data = sessionStorage.getItem('auth_usuario');

  if (data != null) {
    this.autent = true;
    const usuario = JSON.parse(data);
    this.nome = usuario.nome;

    // Normaliza o nome (remove espaços e coloca minúsculo)
    const nomeLower = this.nome.trim().toLowerCase();

    // Verifica cada tipo de usuário
    if (nomeLower === 'admin') {
      this.menuTipo = 'admin';
    } 
    else if (nomeLower === 'venda') {
      this.menuTipo = 'venda';
    } 
    else if (['ricardo', 'roberta', 'jose vinicius'].includes(nomeLower)) {
      this.menuTipo = 'drp';
    }

    console.log('Usuário logado:', this.nome, '→ menuTipo:', this.menuTipo);
  }
}

  //função para fazer o logout do usuário
  //logout(): void {
    //if (window.confirm('Deseja realmente sair do sistema?')) {
      //apagar os dados da local storage
      //sessionStorage.removeItem('auth_usuario');
      //redirecionar para a página de login do sistema
      //window.location.href = '/login-usuarios';
    //}
  //}
  logout(): void {
  sessionStorage.removeItem('auth_usuario');
  this.autent = false;
  this.nome = '';
  this.router.navigate(['/autenticar']);
}
  

}

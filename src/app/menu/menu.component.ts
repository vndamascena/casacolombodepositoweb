import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
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
export class MenuComponent implements OnInit {

  autent: boolean = false; // Variável para controlar a exibição do menu
  matricula: string = "";
  senha: string = "";

  ngOnInit(): void {
    //ler o conteudo da local storage
    const data = sessionStorage.getItem('auth_usuario');
    //verificando se existe um usuário autenticado
    if (data != null) {
      this.autent = true;
      //ler os dados do usuário
      //this.matricula = JSON.parse(data).nome;
      //this.senha = JSON.parse(data).matricula;
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
  

}

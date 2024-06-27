import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute,Router, RouterModule, NavigationEnd } from '@angular/router';
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

  showMenu: boolean = true; // Variável para controlar a exibição do menu

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Inscrever-se para detectar alterações na rota
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Verificar se a rota atual é a página de autenticação de usuário
        this.showMenu = !event.url.includes('autenticar-usuario');
      }
    });
  }


  

  

}


import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';
import { HistoricoVendasComponent } from './historico-vendas/historico-vendas.component';
@Component({
selector: 'app-root',
standalone: true,
imports: [

  RouterOutlet,
  MenuComponent, ConsultaProdutosComponent, InicioComponent, CadastrarProdutosComponent, HistoricoVendasComponent 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
  })
  export class AppComponent {
  title = 'casacolombodeposito';
  } 
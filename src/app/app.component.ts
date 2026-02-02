import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';
import { HistoricoVendasComponent } from './historico-vendas/historico-vendas.component';
import { OcorrenciaComponent } from './ocorrencias/ocorrencia/ocorrencia.component';
import { HistoricoBaixaOcorrenciaComponent } from './ocorrencias/historico-baixa-ocorrencia/historico-baixa-ocorrencia.component';
import { CadastraFornecedorComponent } from './fornecedores/cadastra-fornecedor/cadastra-fornecedor.component';
import { ConsultaFornecedorComponent } from './fornecedores/consulta-fornecedor/consulta-fornecedor.component';
import { CadastraEntregaComponent } from './entrega-titulo/cadastra-entrega/cadastra-entrega.component';
import { ConsultaEntregaComponent } from './entrega-titulo/consulta-entrega/consulta-entrega.component';
import { HistoricoEntregaComponent } from './entrega-titulo/historico-entrega/historico-entrega.component';
import { HistoricoVendaProdutoGeralComponent } from './produtoGeral/historico-venda-produto-geral/historico-venda-produto-geral.component';
import { CadastrarProdutoGeralComponent } from './produtoGeral/cadastrar-produto-geral/cadastrar-produto-geral.component';
import { ConsultarProdutoGeralComponent } from './produtoGeral/consultar-produto-geral/consultar-produto-geral.component';
import { EdicaoProdutoGeralComponent } from './produtoGeral/edicao-produto-geral/edicao-produto-geral.component';
import { HistoricoTituloComponent } from './entrega-titulo/historico-titulo/historico-titulo.component';
import { EditarTituloComponent } from './entrega-titulo/editar-titulo/editar-titulo.component';
import { CadastroTituloComponent } from './entrega-titulo/cadastro-titulo/cadastro-titulo.component';
import { ConsultarTituloComponent } from './entrega-titulo/consultar-titulo/consultar-titulo.component';
import { EditarEntregaComponent } from './entrega-titulo/editar-entrega/editar-entrega.component';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);


@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MenuComponent,
        //ConsultaProdutosComponent, InicioComponent, CadastrarProdutosComponent, HistoricoVendasComponent,
        //OcorrenciaComponent, HistoricoBaixaOcorrenciaComponent, CadastraFornecedorComponent, ConsultaFornecedorComponent,
        //CadastraEntregaComponent, ConsultaEntregaComponent, HistoricoEntregaComponent,HistoricoVendaProdutoGeralComponent,
        //CadastrarProdutoGeralComponent, ConsultarProdutoGeralComponent, EdicaoProdutoGeralComponent, HistoricoTituloComponent,
        //EditarTituloComponent, CadastroTituloComponent, ConsultarTituloComponent, EditarEntregaComponent
    ],

    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
       providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' } 
    ]
})
export class AppComponent implements OnInit{
  title = 'casacolombodeposito';
  

  showMenu: boolean = true; 

  constructor(private router: Router) { }

  ngOnInit(): void {
   
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
        this.showMenu = !event.url.includes('autenticar-usuario');
      }
    });
  }

} 
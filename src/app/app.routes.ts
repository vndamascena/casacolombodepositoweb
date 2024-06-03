import { Routes } from '@angular/router';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { EdicaoProdutosComponent } from './edicao-produtos/edicao-produtos.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';
import { HistoricoVendasComponent } from './historico-vendas/historico-vendas.component';

export const routes: Routes = [

    {
        path: 'consulta-produtos',
        component: ConsultaProdutosComponent
    },
    {path: 'inicio', 
        component: InicioComponent
    },
    {path: 'edicao-produtos/:id', 
        component: EdicaoProdutosComponent
    },
    {path: 'cadastrar-produtos',
        component: CadastrarProdutosComponent
    },
    {
        path: 'historico-vendas',
        component: HistoricoVendasComponent
    },
    {
        path: '', pathMatch: 'full', //url raiz
        redirectTo: 'consulta-produtos'
    }


];

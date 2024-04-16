import { Routes } from '@angular/router';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { EdicaoProdutosComponent } from './edicao-produtos/edicao-produtos.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';

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
        path: '', pathMatch: 'full', //url raiz
        redirectTo: 'inicio'
    }


];

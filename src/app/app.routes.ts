import { Routes } from '@angular/router';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { EdicaoProdutosComponent } from './edicao-produtos/edicao-produtos.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';
import { HistoricoVendasComponent } from './historico-vendas/historico-vendas.component';
import { HistoricoBaixaOcorrenciaComponent } from './ocorrencias/historico-baixa-ocorrencia/historico-baixa-ocorrencia.component';
import { OcorrenciaComponent } from './ocorrencias/ocorrencia/ocorrencia.component';

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
        path: 'historico-baixa-ocorrencia',
        component: HistoricoBaixaOcorrenciaComponent
    },
    {
        path: 'ocorrencia',
        component: OcorrenciaComponent
    },

    {
        path: '', pathMatch: 'full', //url raiz
        redirectTo: 'consulta-produtos'
    }


];

import { Routes } from '@angular/router';
import { ConsultaProdutosComponent } from './consulta-produtos/consulta-produtos.component';
import { InicioComponent } from './inicio/inicio.component';
import { EdicaoProdutosComponent } from './edicao-produtos/edicao-produtos.component';
import { CadastrarProdutosComponent } from './cadastrar-produtos/cadastrar-produtos.component';
import { HistoricoVendasComponent } from './historico-vendas/historico-vendas.component';
import { HistoricoBaixaOcorrenciaComponent } from './ocorrencias/historico-baixa-ocorrencia/historico-baixa-ocorrencia.component';
import { OcorrenciaComponent } from './ocorrencias/ocorrencia/ocorrencia.component';
import { CadastraOcorrenciaComponent } from './ocorrencias/cadastra-ocorrencia/cadastra-ocorrencia.component';
import { AutenticarUsuarioComponent } from './usuarios/autenticar-usuario/autenticar-usuario.component';
import { AuthenticationGuard } from './_guards/Authentication.guards';

export const routes: Routes = [


    
    {
        path: 'consulta-produtos',
        component: ConsultaProdutosComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'inicio',
        component: InicioComponent
    },
    {
        path: 'edicao-produtos/:id',
        component: EdicaoProdutosComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'cadastrar-produtos',
        component: CadastrarProdutosComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'historico-vendas',
        component: HistoricoVendasComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'historico-baixa-ocorrencia',
        component: HistoricoBaixaOcorrenciaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'ocorrencia',
        component: OcorrenciaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: "cadastra-ocorrencia",
        component: CadastraOcorrenciaComponent,
        canActivate: [AuthenticationGuard]

        
    },
    {
        path: 'autenticar-usuario',
        component: AutenticarUsuarioComponent
    },

    {
        path: '', pathMatch: 'full', //url raiz
        redirectTo: 'autenticar-usuario'
    }


];

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
import { CadastraFornecedorComponent } from './fornecedores/cadastra-fornecedor/cadastra-fornecedor.component';
import { ConsultaFornecedorComponent } from './fornecedores/consulta-fornecedor/consulta-fornecedor.component';
import { ConsultaEntregaComponent } from './entrega-titulo/consulta-entrega/consulta-entrega.component';
import { CadastraEntregaComponent } from './entrega-titulo/cadastra-entrega/cadastra-entrega.component';
import { HistoricoEntregaComponent } from './entrega-titulo/historico-entrega/historico-entrega.component';
import { CadastrarProdutoGeralComponent } from './produtoGeral/cadastrar-produto-geral/cadastrar-produto-geral.component';
import { ConsultarProdutoGeralComponent } from './produtoGeral/consultar-produto-geral/consultar-produto-geral.component';
import { EdicaoProdutoGeralComponent } from './produtoGeral/edicao-produto-geral/edicao-produto-geral.component';
import { HistoricoVendaProdutoGeralComponent } from './produtoGeral/historico-venda-produto-geral/historico-venda-produto-geral.component';
import { HistoricoTituloComponent } from './entrega-titulo/historico-titulo/historico-titulo.component';
import { CadastroTituloComponent } from './entrega-titulo/cadastro-titulo/cadastro-titulo.component';
import { EditarTituloComponent } from './entrega-titulo/editar-titulo/editar-titulo.component';
import { ConsultarTituloComponent } from './entrega-titulo/consultar-titulo/consultar-titulo.component';
import { EditarEntregaComponent } from './entrega-titulo/editar-entrega/editar-entrega.component';
import { Erro401Component } from './erro-401/erro-401.component';
import { HistoricoTitulofuncionarioComponent } from './entrega-titulo/titulo-funcionario/historico-titulofuncionario/historico-titulofuncionario.component';
import { EditarTitulofuncionarioComponent } from './entrega-titulo/titulo-funcionario/editar-titulofuncionario/editar-titulofuncionario.component';
import { ConsultarTitulofuncionarioComponent } from './entrega-titulo/titulo-funcionario/consultar-titulofuncionario/consultar-titulofuncionario.component';
import { CadastrarTitulofuncionarioComponent } from './entrega-titulo/titulo-funcionario/cadastrar-titulofuncionario/cadastrar-titulofuncionario.component';


export const routes: Routes = [



    {
        path: 'consulta-produtos',
        component: ConsultaProdutosComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'inicio',
        component: InicioComponent,
        canActivate: [AuthenticationGuard]
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
        path: 'cadastra-fornecedor',
        component: CadastraFornecedorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'consulta-fornecedor',
        component: ConsultaFornecedorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'cadastra-entrega',
        component: CadastraEntregaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'editar-entrega/:id',
        component: EditarEntregaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'consulta-entrega',
        component: ConsultaEntregaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'autenticar-usuario',
        component: AutenticarUsuarioComponent
    },
    {
        path: 'historico-entrega',
        component: HistoricoEntregaComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'cadastrar-produtoGeral',
        component: CadastrarProdutoGeralComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'consultar-produtoGeral',
        component: ConsultarProdutoGeralComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'edicao-produtoGeral/:id',
        component: EdicaoProdutoGeralComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'historico-venda-produtoGeral',
        component: HistoricoVendaProdutoGeralComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'historico-titulo',
        component: HistoricoTituloComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'cadastro-titulo',
        component: CadastroTituloComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'editar-titulo/:id',
        component: EditarTituloComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'consultar-titulo',
        component: ConsultarTituloComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'historico-titulofuncionario',
        component: HistoricoTitulofuncionarioComponent,
        canActivate: [AuthenticationGuard],
        data: { roles: ['Admin'] }
    },
    {
        path: 'cadastrar-titulofuncionario',
        component: CadastrarTitulofuncionarioComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'editar-titulofuncionario/:id',
        component: EditarTitulofuncionarioComponent,
        canActivate: [AuthenticationGuard],
        data: { roles: ['Admin'] }
    },
    {
        path: 'consultar-titulofuncionario',
        component: ConsultarTitulofuncionarioComponent,
        canActivate: [AuthenticationGuard],
        data: { roles: ['Admin'] }
    },
    {
        path: 'erro-401',
        component: Erro401Component  // Define a rota de erro 401
    },
    {
        path: '', pathMatch: 'full', //url raiz
        redirectTo: 'autenticar-usuario'
    }


];

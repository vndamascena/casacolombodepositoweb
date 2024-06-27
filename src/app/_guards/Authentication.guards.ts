import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuard {

    constructor(private router: Router) {}

    canActivate() {
        // Verificar se existe um usuário autenticado na local storage
        const auth = localStorage.getItem('auth_usuario');
        if (auth != null) {
            return true; // Permite a navegação
        } else {
            // Caso não haja usuário autenticado, redireciona para a página de autenticação
            this.router.navigate(['/autenticar-usuario']);
            return false; // Impede a navegação
        }
    }

    // Método para limpar Local Storage ao fechar a página
    clearLocalStorageOnUnload() {
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem('auth_usuario');
        });
    }
}

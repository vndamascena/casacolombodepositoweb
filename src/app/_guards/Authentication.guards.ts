import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard {

  constructor(private router: Router) {}

  canActivate(route: any): boolean {
    const auth = sessionStorage.getItem('auth_usuario');
  
    if (auth != null) {
      const user = JSON.parse(auth);
  
      if (route.data.roles) {
        const userRole = user.tipo?.toLowerCase(); // Converte para minúsculo
        const allowedRoles = route.data.roles.map((role: string) => role.toLowerCase());
  
        console.log('Tipo do usuário:', userRole); // Debug
        console.log('Roles permitidos:', allowedRoles); // Debug
  
        if (!allowedRoles.includes(userRole)) {
          this.router.navigate(['/erro-401']);
          return false;
        }
      }
      return true;
    } else {
      this.router.navigate(['/autenticar-usuario']);
      return false;
    }
  }
  
}

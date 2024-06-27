import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-autenticar-usuario',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule, NgxSpinnerModule],
  templateUrl: './autenticar-usuario.component.html',
  styleUrl: './autenticar-usuario.component.css'
})
export class AutenticarUsuarioComponent {
  [x: string]: any;

  userApiUrl: string = 'http://localhost:5233/api/usuarios';
  
  constructor(    
    private httpClient: HttpClient, 
    private router: Router,
    private spinner: NgxSpinnerService

   ) { }

  form = new FormGroup({
    matricula: new FormControl('', []),
    senha: new FormControl('', [])

  
  });

  get formi(): any {
    return this.form.controls;
    }

  onSubmit(): void {
   
    this.httpClient.post(this.userApiUrl +
      "/autenticaradmin", this.form.value)
      
      .subscribe({
        next: (data) => {
          console.log(data);
          localStorage.setItem('auth_usuario', JSON.stringify(data));
          
          this.router.navigate(['/consulta-produtos']);
         // this.spinner.hide();
          
          
          
        },
        
        error: (e) => {
          
          alert('Erro ao autenticar. Usuário e senha incorreto, tente novamente.');
          
                        
        }
      });
  }
}

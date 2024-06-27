import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autenticar-usuario',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule],
  templateUrl: './autenticar-usuario.component.html',
  styleUrl: './autenticar-usuario.component.css'
})
export class AutenticarUsuarioComponent {
  [x: string]: any;

  userApiUrl: string = 'http://localhost:5233/api/usuarios';
  spinner: any;
  constructor(    
    private httpClient: HttpClient, 
    private router: Router 

   ) { }

  form = new FormGroup({
    matricula: new FormControl('', []),
    senha: new FormControl('', [])

  
  });



  onSubmit(): void {
    this.httpClient.post(this.userApiUrl +
      "/autenticaradmin", this.form.value)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.router.navigate(['/consulta-produtos']);
        },
        error: (e) => {
          alert('Erro ao autenticar. Usuário e senha incorreto, tente novamente.');
                        this.spinner.hide();
        }
      });
  }
}

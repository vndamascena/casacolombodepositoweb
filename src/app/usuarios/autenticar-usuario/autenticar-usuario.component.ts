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
  styleUrls: ['./autenticar-usuario.component.css']
})
export class AutenticarUsuarioComponent {
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';

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

    this.spinner.show();

    this.httpClient.post(this.userApiUrl + "/autenticaradmin", this.form.value)
      .subscribe({
        next: (data) => {
          console.log(data);
          sessionStorage.setItem('auth_usuario', JSON.stringify(data));
          this.router.navigate(['/consulta-produtos']).then(() => {
            window.location.reload();
          });
          this.spinner.hide();
        },
        error: (e) => {
          alert('Erro ao autenticar. Usuário e senha incorreto, tente novamente.');
          this.spinner.hide();
        }
      });
  }

}

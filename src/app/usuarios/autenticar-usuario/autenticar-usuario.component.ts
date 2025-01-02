import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-autenticar-usuario',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgxSpinnerModule],
  templateUrl: './autenticar-usuario.component.html',
  styleUrls: ['./autenticar-usuario.component.css']
})
export class AutenticarUsuarioComponent {
  userApiUrl: string = 'https://colombo01-001-site2.gtempurl.com/api/usuarios';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  form = new FormGroup({
    matricula: new FormControl('', []),
    senha: new FormControl('', [])
  });

  get formi(): any {
    return this.form.controls;
  }

  onSubmit(): void {
    this.spinner.show();

    const matricula = this.form.value.matricula;
    let endpoint: string;

    // Verifica se a matrícula é para venda ou admin
    if (matricula === 'venda') {
      endpoint = '/autenticarvenda';  // Endpoint para autenticar usuário de venda
    } else if (matricula === 'Admin') {
      endpoint = '/autenticaradmin';  // Endpoint para autenticar usuário admin
    } else {
      // Caso a matrícula seja inválida
      alert('Matrícula inválida');
      this.spinner.hide();
      return;
    }

    // Faz a requisição para o endpoint determinado
    this.httpClient.post(this.userApiUrl + endpoint, this.form.value)
      .subscribe({
        next: (data) => {
          console.log('Usuário autenticado:', data); 
          console.log('Resposta da API:', data);
          if (matricula === 'venda') {
            (data as any).tipo = 'venda';
          } else if (matricula === 'Admin') {
            (data as any).tipo = 'Admin';
          }
          // Salva as informações do usuário no sessionStorage
          sessionStorage.setItem('auth_usuario', JSON.stringify(data));
          this.router.navigate(['/inicio']).then(() => {
            window.location.reload();
          });
          this.spinner.hide();
        },
        error: (e) => {
          alert('Erro ao autenticar. Usuário e senha incorretos, tente novamente.');
          this.spinner.hide();
        }
      });
  }
}

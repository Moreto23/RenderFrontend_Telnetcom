import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginRequest } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

  usuario = '';
  password = '';
  errorLogin = '';
  mostrarPassword = false;
  cargando = false;
  modoOscuro = false;
  toastTitulo = '';
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';
  private toastTimer?: number;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.inicializarTema();
  }

  login() {
    this.errorLogin = '';

    const data: LoginRequest = {
      username: this.usuario.trim(),
      password: this.password
    };

    if (!data.username || !data.password) {
      this.errorLogin = 'Ingrese usuario y contrasena.';
      this.mostrarToast('Acceso denegado', 'Complete usuario y contrasena.', 'error');
      return;
    }

    this.cargando = true;

    this.authService.login(data).subscribe({
      next: (response) => {
        this.cargando = false;

        if (response.mensaje === 'Login correcto') {
          globalThis.localStorage?.setItem('token', response.token);
          globalThis.localStorage?.setItem('rol', response.rol);
          globalThis.localStorage?.setItem('username', response.username);
          this.mostrarToast('Acceso validado', 'Bienvenido al sistema TELNETCOM.', 'success');

          window.setTimeout(() => {
            if (response.rol === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (response.rol === 'TECNICO') {
              this.router.navigate(['/tecnico']);
            } else if (response.rol === 'USUARIO') {
              this.router.navigate(['/usuario']);
            }
          }, 850);

          return;
        }

        this.errorLogin = 'Credenciales incorrectas.';
        this.mostrarToast('Acceso denegado', 'Usuario o contrasena incorrectos.', 'error');
      },
      error: (error) => {
        this.cargando = false;
        console.error(error);
        this.errorLogin = 'Error al conectar con el servidor.';
        this.mostrarToast('Acceso denegado', 'No se pudo conectar con el servidor.', 'error');
      }
    });
  }

  alternarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  alternarTema() {
    this.modoOscuro = !this.modoOscuro;
    this.aplicarTema();
  }

  private inicializarTema() {
    this.modoOscuro = globalThis.localStorage?.getItem('tema') === 'oscuro';
    this.aplicarTema();
  }

  private aplicarTema() {
    document.body.classList.toggle('dark-theme', this.modoOscuro);
    globalThis.localStorage?.setItem('tema', this.modoOscuro ? 'oscuro' : 'claro');
  }

  private mostrarToast(
    titulo: string,
    mensaje: string,
    tipo: 'success' | 'error'
  ) {
    this.toastTitulo = titulo;
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toastTimer = window.setTimeout(() => {
      this.toastMensaje = '';
    }, 2800);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  Usuario
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'https://backend-telnetcom-1.onrender.com/usuarios';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  listarTecnicos() {
    return this.http.get<Usuario[]>(`${this.apiUrl}/tecnicos`);
  }

  crear(usuario: CrearUsuarioRequest) {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizar(id: number, usuario: ActualizarUsuarioRequest) {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

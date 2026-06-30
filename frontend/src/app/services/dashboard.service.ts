import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  AdminDashboard,
  TecnicoDashboard,
  UsuarioDashboard
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  obtenerAdmin() {
    return this.http.get<AdminDashboard>(`${this.apiUrl}/admin`);
  }

  obtenerTecnico(username: string) {
    return this.http.get<TecnicoDashboard>(`${this.apiUrl}/tecnico/${username}`);
  }

  obtenerUsuario(username: string) {
    return this.http.get<UsuarioDashboard>(`${this.apiUrl}/usuario/${username}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CrearIncidenciaRequest,
  Incidencia,
  SeguimientoIncidencia
} from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private apiUrl = 'http://localhost:8080/incidencias';

  constructor(
    private http: HttpClient
  ) {}

  listar() {
    return this.http.get<Incidencia[]>(this.apiUrl);
  }

  listarPorUsuario(
    username: string
  ) {

    return this.http.get<Incidencia[]>(
      `${this.apiUrl}/usuario/${username}`
    );

  }

  listarPorTecnico(
    username: string
  ) {

    return this.http.get<Incidencia[]>(
      `${this.apiUrl}/tecnico/${username}`
    );

  }

  crear(incidencia: CrearIncidenciaRequest) {

    return this.http.post<Incidencia>(
      this.apiUrl,
      incidencia
    );

  }

  eliminar(id: number) {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );

  }

  asignarTecnico(
    id: number,
    tecnico: string
  ) {

    return this.http.put<Incidencia>(
      `${this.apiUrl}/${id}/asignar?tecnico=${tecnico}`,
      {}
    );

  }

  cambiarEstado(
    id: number,
    estado: string,
    observacion?: string,
    tipo?: string,
    adjuntoUrl?: string
  ) {

    let url =
      `${this.apiUrl}/${id}/estado?estado=${estado}`;

    if(observacion){

      url +=
        `&observacion=${encodeURIComponent(observacion)}`;

    }

    if (tipo) {
      url += `&tipo=${encodeURIComponent(tipo)}`;
    }

    if (adjuntoUrl) {
      url += `&adjuntoUrl=${encodeURIComponent(adjuntoUrl)}`;
    }

    return this.http.put<Incidencia>(
      url,
      {}
    );

  }

  listarSeguimientos(id: number) {
    return this.http.get<SeguimientoIncidencia[]>(
      `${this.apiUrl}/${id}/seguimientos`
    );
  }

  confirmarSolucion(id: number, usuario: string, observacion?: string) {
    let url = `${this.apiUrl}/${id}/confirmar?usuario=${encodeURIComponent(usuario)}`;

    if (observacion) {
      url += `&observacion=${encodeURIComponent(observacion)}`;
    }

    return this.http.put<Incidencia>(url, {});
  }

  reabrir(id: number, usuario: string, observacion?: string) {
    let url = `${this.apiUrl}/${id}/reabrir?usuario=${encodeURIComponent(usuario)}`;

    if (observacion) {
      url += `&observacion=${encodeURIComponent(observacion)}`;
    }

    return this.http.put<Incidencia>(url, {});
  }

  agregarSeguimiento(
    id: number,
    tipo: string,
    observacion: string,
    registradoPor: string,
    adjuntoUrl?: string
  ) {
    let url =
      `${this.apiUrl}/${id}/seguimientos?tipo=${encodeURIComponent(tipo)}` +
      `&observacion=${encodeURIComponent(observacion)}` +
      `&registradoPor=${encodeURIComponent(registradoPor)}`;

    if (adjuntoUrl) {
      url += `&adjuntoUrl=${encodeURIComponent(adjuntoUrl)}`;
    }

    return this.http.post<SeguimientoIncidencia>(url, {});
  }

}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ReporteFiltros, ReporteIncidencias } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = 'http://localhost:8080/reportes';

  constructor(private http: HttpClient) {}

  obtenerIncidencias(filtros: ReporteFiltros) {
    return this.http.get<ReporteIncidencias>(
      `${this.apiUrl}/incidencias`,
      {
        params: this.crearParams(filtros)
      }
    );
  }

  descargarCsv(filtros: ReporteFiltros) {
    return this.http.get(
      `${this.apiUrl}/incidencias/csv`,
      {
        params: this.crearParams(filtros),
        responseType: 'blob'
      }
    );
  }

  private crearParams(filtros: ReporteFiltros) {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return params;
  }
}

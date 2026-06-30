import { Incidencia } from './incidencia.model';

export interface ReporteFiltros {
  estado?: string;
  prioridad?: string;
  tecnico?: string;
  usuario?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteIncidencias {
  total: number;
  pendientes: number;
  asignadas: number;
  resueltas: number;
  prioridadBaja: number;
  prioridadMedia: number;
  prioridadAlta: number;
  prioridadCritica: number;
  incidencias: Incidencia[];
}

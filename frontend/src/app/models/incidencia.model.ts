export type EstadoIncidencia =
  | 'PENDIENTE'
  | 'ASIGNADA'
  | 'EN_PROGRESO'
  | 'RESUELTA'
  | 'RESUELTA_POR_TECNICO'
  | 'CONFIRMADA'
  | 'REABIERTA';

export type PrioridadIncidencia = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Incidencia {
  id?: number;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
  estado?: EstadoIncidencia;
  usuarioReporta?: string;
  tecnicoAsignado?: string | null;
  observacionTecnico?: string | null;
  fechaCreacion?: string;
}

export interface CrearIncidenciaRequest {
  titulo: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
  usuarioReporta?: string;
}

export interface SeguimientoIncidencia {
  id: number;
  incidenciaId: number;
  estado: EstadoIncidencia;
  tipo: string;
  observacion: string;
  adjuntoUrl?: string | null;
  registradoPor: string;
  fechaRegistro: string;
}

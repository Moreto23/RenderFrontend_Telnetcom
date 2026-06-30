export interface AdminDashboard {
  totalIncidencias: number;
  pendientes: number;
  asignadas: number;
  resueltas: number;
  sinAsignar: number;
  totalUsuarios: number;
  totalTecnicos: number;
  prioridadBaja: number;
  prioridadMedia: number;
  prioridadAlta: number;
  prioridadCritica: number;
}

export interface TecnicoDashboard {
  asignadas: number;
  pendientes: number;
  resueltas: number;
  prioridadAlta: number;
  prioridadCritica: number;
}

export interface UsuarioDashboard {
  generadas: number;
  pendientes: number;
  asignadas: number;
  resueltas: number;
}

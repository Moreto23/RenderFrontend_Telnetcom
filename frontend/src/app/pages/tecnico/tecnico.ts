import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  EstadoIncidencia,
  Incidencia,
  SeguimientoIncidencia
} from '../../models/incidencia.model';
import { TecnicoDashboard } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { IncidenciaService } from '../../services/incidencia.service';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tecnico.html',
  styleUrl: './tecnico.css'
})
export class TecnicoComponent implements OnInit {

  seccionActual = 'dashboard';
  sidebarColapsado = false;
  busquedaIncidencias = '';
  incidenciaSeleccionada?: Incidencia;
  estadoActualizacion: EstadoIncidencia = 'ASIGNADA';
  observacionActualizacion = '';
  tipoObservacion = 'ACCION_REALIZADA';
  adjuntoUrl = '';
  seguimientosSeleccionados: SeguimientoIncidencia[] = [];

  incidencias: Incidencia[] = [];
  dashboardTecnico?: TecnicoDashboard;

  username = '';
  mensajeGeneral = '';
  errorGeneral = '';
  modoOscuro = false;

  constructor(
    private incidenciaService: IncidenciaService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarTema();
    this.username = globalThis.localStorage?.getItem('username') || '';
    this.cargarDashboard();
    this.cargarIncidencias();
  }

  cambiarSeccion(seccion: string) {
    this.seccionActual = seccion;
    this.mensajeGeneral = '';
    this.errorGeneral = '';
  }

  alternarSidebar() {
    this.sidebarColapsado = !this.sidebarColapsado;
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

  cargarIncidencias() {
    this.incidenciaService.listarPorTecnico(this.username).subscribe({
      next: (data) => {
        this.incidencias = data;
        if (!this.incidenciaSeleccionada && data.length > 0) {
          this.seleccionarIncidencia(data[0]);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarDashboard() {
    this.dashboardService.obtenerTecnico(this.username).subscribe({
      next: (data) => {
        this.dashboardTecnico = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  get incidenciasResueltas(): Incidencia[] {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'RESUELTA' ||
        incidencia.estado === 'RESUELTA_POR_TECNICO' ||
        incidencia.estado === 'CONFIRMADA'
    );
  }

  get incidenciasPendientes(): Incidencia[] {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado !== 'RESUELTA' &&
        incidencia.estado !== 'RESUELTA_POR_TECNICO' &&
        incidencia.estado !== 'CONFIRMADA'
    );
  }

  get incidenciasFiltradas(): Incidencia[] {
    const termino = this.busquedaIncidencias.trim().toLowerCase();

    if (!termino) {
      return this.incidencias;
    }

    return this.incidencias.filter(incidencia =>
      `${incidencia.id} ${incidencia.titulo} ${incidencia.descripcion} ${incidencia.prioridad} ${incidencia.estado} ${incidencia.usuarioReporta}`
        .toLowerCase()
        .includes(termino)
    );
  }

  get totalEnProgreso(): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'ASIGNADA' ||
        incidencia.estado === 'EN_PROGRESO' ||
        incidencia.estado === 'REABIERTA'
    ).length;
  }

  get resueltasHoy(): number {
    return this.incidenciasResueltas.length;
  }

  seleccionarIncidencia(incidencia: Incidencia) {
    this.incidenciaSeleccionada = incidencia;
    this.estadoActualizacion =
      incidencia.estado === 'RESUELTA_POR_TECNICO' ||
      incidencia.estado === 'RESUELTA' ||
      incidencia.estado === 'CONFIRMADA'
        ? 'RESUELTA_POR_TECNICO'
        : 'EN_PROGRESO';
    this.observacionActualizacion = incidencia.observacionTecnico || '';
    this.tipoObservacion = 'ACCION_REALIZADA';
    this.adjuntoUrl = '';
    this.cargarSeguimientos(incidencia.id);
  }

  guardarActualizacion() {
    if (!this.incidenciaSeleccionada?.id) {
      return;
    }

    this.mensajeGeneral = '';
    this.errorGeneral = '';

    this.incidenciaService
      .cambiarEstado(
        this.incidenciaSeleccionada.id,
        this.estadoActualizacion,
        this.observacionActualizacion.trim(),
        this.tipoObservacion,
        this.adjuntoUrl.trim()
      )
      .subscribe({
        next: (incidencia) => {
          this.mensajeGeneral = 'Actualizacion guardada correctamente.';
          this.incidenciaSeleccionada = incidencia;
          this.observacionActualizacion = '';
          this.adjuntoUrl = '';
          this.cargarSeguimientos(incidencia.id);
          this.cargarDashboard();
          this.cargarIncidencias();
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al guardar la actualizacion.';
        }
      });
  }

  cargarSeguimientos(id?: number) {
    if (!id) {
      this.seguimientosSeleccionados = [];
      return;
    }

    this.incidenciaService.listarSeguimientos(id).subscribe({
      next: (data) => {
        this.seguimientosSeleccionados = data;
      },
      error: (error) => {
        console.error(error);
        this.seguimientosSeleccionados = [];
      }
    });
  }

  estadoTexto(estado?: string): string {
    if (estado === 'PENDIENTE') {
      return 'Abierta';
    }

    if (estado === 'ASIGNADA') {
      return 'Asignada';
    }

    if (estado === 'EN_PROGRESO') {
      return 'En Progreso';
    }

    if (estado === 'RESUELTA' || estado === 'RESUELTA_POR_TECNICO') {
      return 'Resuelta por Tecnico';
    }

    if (estado === 'CONFIRMADA') {
      return 'Confirmada por Usuario';
    }

    if (estado === 'REABIERTA') {
      return 'Reabierta';
    }

    return estado || '-';
  }

  idIncidencia(incidencia: Incidencia): string {
    const id = incidencia.id || 0;
    return `INC-${String(id).padStart(4, '0')}`;
  }

  resolver(id: number) {
    this.mensajeGeneral = '';
    this.errorGeneral = '';

    this.incidenciaService
      .cambiarEstado(id, 'RESUELTA')
      .subscribe({
        next: () => {
          this.mensajeGeneral = 'Incidencia marcada como resuelta.';
          this.cargarDashboard();
          this.cargarIncidencias();
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al resolver incidencia.';
        }
      });
  }

  cerrarSesion() {
    const tema = globalThis.localStorage?.getItem('tema');
    globalThis.localStorage?.clear();
    if (tema) {
      globalThis.localStorage?.setItem('tema', tema);
    }
    this.router.navigate(['/login']);
  }

}

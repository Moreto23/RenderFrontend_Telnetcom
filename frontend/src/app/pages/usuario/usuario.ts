import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuarioDashboard } from '../../models/dashboard.model';
import {
  Incidencia,
  PrioridadIncidencia,
  SeguimientoIncidencia
} from '../../models/incidencia.model';
import { DashboardService } from '../../services/dashboard.service';
import { IncidenciaService } from '../../services/incidencia.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class UsuarioComponent implements OnInit {

  seccionActual = 'inicio';
  sidebarColapsado = false;
  busquedaIncidencias = '';
  mostrarFormulario = false;

  username = '';

  incidencias: Incidencia[] = [];
  incidenciaSeleccionada?: Incidencia;
  seguimientosSeleccionados: SeguimientoIncidencia[] = [];
  observacionUsuario = '';
  tipoObservacionUsuario = 'OBSERVACION_USUARIO';
  adjuntoUsuarioUrl = '';
  dashboardUsuario?: UsuarioDashboard;

  titulo = '';

  descripcion = '';

  prioridad: PrioridadIncidencia = 'MEDIA';

  errorFormulario = '';
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
    this.mostrarFormulario = seccion === 'crear';
    this.errorFormulario = '';
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
    this.incidenciaService
      .listarPorUsuario(this.username)
      .subscribe({
        next: (data) => {
          this.incidencias = data;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  cargarDashboard() {
    this.dashboardService.obtenerUsuario(this.username).subscribe({
      next: (data) => {
        this.dashboardUsuario = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  get ticketsPendientes(): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'PENDIENTE' ||
        incidencia.estado === 'ASIGNADA' ||
        incidencia.estado === 'EN_PROGRESO' ||
        incidencia.estado === 'REABIERTA'
    ).length;
  }

  get ticketsAbiertos(): number {
    return this.incidencias.filter(
      incidencia => incidencia.estado === 'PENDIENTE'
    ).length;
  }

  get ticketsEnProgreso(): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'ASIGNADA' ||
        incidencia.estado === 'EN_PROGRESO' ||
        incidencia.estado === 'REABIERTA'
    ).length;
  }

  get incidenciasResueltas(): Incidencia[] {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'RESUELTA' ||
        incidencia.estado === 'RESUELTA_POR_TECNICO' ||
        incidencia.estado === 'CONFIRMADA'
    );
  }

  get ticketsResueltos(): number {
    return this.incidenciasResueltas.length;
  }

  get incidenciasFiltradas(): Incidencia[] {
    const termino = this.busquedaIncidencias.trim().toLowerCase();

    if (!termino) {
      return this.incidencias;
    }

    return this.incidencias.filter(incidencia =>
      `${incidencia.id} ${incidencia.titulo} ${incidencia.descripcion} ${incidencia.estado} ${incidencia.prioridad} ${incidencia.tecnicoAsignado}`
        .toLowerCase()
        .includes(termino)
    );
  }

  seleccionarIncidencia(incidencia: Incidencia) {
    this.incidenciaSeleccionada = incidencia;
    this.observacionUsuario = '';
    this.adjuntoUsuarioUrl = '';
    this.cargarSeguimientos(incidencia.id);
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

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.seccionActual = 'crear';
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.seccionActual = 'incidencias';
    this.errorFormulario = '';
    this.titulo = '';
    this.descripcion = '';
    this.prioridad = 'MEDIA';
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

  crearTicket() {
    this.errorFormulario = '';
    this.mensajeGeneral = '';
    this.errorGeneral = '';

    const titulo = this.titulo.trim();
    const descripcion = this.descripcion.trim();

    if (!titulo) {
      this.errorFormulario = 'Ingrese el titulo de la incidencia.';
      return;
    }

    if (titulo.length < 5) {
      this.errorFormulario = 'El titulo debe tener al menos 5 caracteres.';
      return;
    }

    if (!descripcion) {
      this.errorFormulario = 'Ingrese la descripcion del problema.';
      return;
    }

    if (descripcion.length < 10) {
      this.errorFormulario = 'La descripcion debe tener al menos 10 caracteres.';
      return;
    }

    const ticket = {
      titulo,
      descripcion,
      prioridad: this.prioridad,
      usuarioReporta: this.username
    };

    this.incidenciaService
      .crear(ticket)
      .subscribe({
        next: () => {
          this.mensajeGeneral = 'Ticket registrado correctamente.';

          this.titulo = '';
          this.descripcion = '';
          this.prioridad = 'MEDIA';

          this.cargarIncidencias();
          this.cargarDashboard();
          this.seccionActual = 'incidencias';
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al registrar ticket.';
        }
      });
  }

  confirmarSolucion() {
    if (!this.incidenciaSeleccionada?.id) {
      return;
    }

    this.incidenciaService
      .confirmarSolucion(
        this.incidenciaSeleccionada.id,
        this.username,
        this.observacionUsuario.trim()
      )
      .subscribe({
        next: (incidencia) => {
          this.mensajeGeneral = 'Solucion confirmada correctamente.';
          this.incidenciaSeleccionada = incidencia;
          this.observacionUsuario = '';
          this.cargarIncidencias();
          this.cargarDashboard();
          this.cargarSeguimientos(incidencia.id);
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al confirmar solucion.';
        }
      });
  }

  reabrirIncidencia() {
    if (!this.incidenciaSeleccionada?.id) {
      return;
    }

    if (!this.observacionUsuario.trim()) {
      this.errorGeneral = 'Ingrese el motivo para reabrir la incidencia.';
      return;
    }

    this.incidenciaService
      .reabrir(
        this.incidenciaSeleccionada.id,
        this.username,
        this.observacionUsuario.trim()
      )
      .subscribe({
        next: (incidencia) => {
          this.mensajeGeneral = 'Incidencia reabierta correctamente.';
          this.incidenciaSeleccionada = incidencia;
          this.observacionUsuario = '';
          this.cargarIncidencias();
          this.cargarDashboard();
          this.cargarSeguimientos(incidencia.id);
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al reabrir incidencia.';
        }
      });
  }

  agregarObservacionUsuario() {
    if (!this.incidenciaSeleccionada?.id) {
      return;
    }

    if (!this.observacionUsuario.trim()) {
      this.errorGeneral = 'Ingrese una observacion.';
      return;
    }

    this.incidenciaService
      .agregarSeguimiento(
        this.incidenciaSeleccionada.id,
        this.tipoObservacionUsuario,
        this.observacionUsuario.trim(),
        this.username,
        this.adjuntoUsuarioUrl.trim()
      )
      .subscribe({
        next: () => {
          this.mensajeGeneral = 'Observacion agregada correctamente.';
          this.observacionUsuario = '';
          this.adjuntoUsuarioUrl = '';
          this.cargarSeguimientos(this.incidenciaSeleccionada?.id);
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al agregar observacion.';
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

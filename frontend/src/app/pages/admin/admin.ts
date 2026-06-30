import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Incidencia,
  SeguimientoIncidencia
} from '../../models/incidencia.model';
import { AdminDashboard } from '../../models/dashboard.model';
import { ReporteFiltros, ReporteIncidencias } from '../../models/reporte.model';
import { RolUsuario, Usuario } from '../../models/usuario.model';
import { DashboardService } from '../../services/dashboard.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { ReporteService } from '../../services/reporte.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {

  seccionActual = 'dashboard';
  sidebarColapsado = false;
  busquedaIncidencias = '';
  busquedaUsuarios = '';
  incidenciaSeleccionada?: Incidencia;
  seguimientosSeleccionados: SeguimientoIncidencia[] = [];

  incidencias: Incidencia[] = [];
  usuarios: Usuario[] = [];
  tecnicos: Usuario[] = [];
  dashboardAdmin?: AdminDashboard;
  reporteIncidencias?: ReporteIncidencias;

  filtrosReporte: ReporteFiltros = {
    estado: '',
    prioridad: '',
    tecnico: '',
    usuario: '',
    fechaInicio: '',
    fechaFin: ''
  };

  nuevoUsername = '';
  nuevoPassword = '';
  nuevoRol: RolUsuario = 'USUARIO';
  mensajeUsuarios = '';
  errorUsuarios = '';
  mensajeGeneral = '';
  errorGeneral = '';
  modoOscuro = false;

  constructor(
    private incidenciaService: IncidenciaService,
    private usuarioService: UsuarioService,
    private dashboardService: DashboardService,
    private reporteService: ReporteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarTema();
    this.cargarDashboard();
    this.cargarIncidencias();
    this.cargarUsuarios();
    this.cargarReporte();
  }

  cambiarSeccion(seccion: string) {
    this.seccionActual = seccion;
    this.mensajeUsuarios = '';
    this.errorUsuarios = '';
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
    this.incidenciaService.listar().subscribe({
      next: (data) => {
        this.incidencias = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarDashboard() {
    this.dashboardService.obtenerAdmin().subscribe({
      next: (data) => {
        this.dashboardAdmin = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarReporte() {
    this.reporteService.obtenerIncidencias(this.filtrosReporte).subscribe({
      next: (data) => {
        this.reporteIncidencias = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  limpiarFiltrosReporte() {
    this.filtrosReporte = {
      estado: '',
      prioridad: '',
      tecnico: '',
      usuario: '',
      fechaInicio: '',
      fechaFin: ''
    };

    this.cargarReporte();
  }

  descargarReporteCsv() {
    this.reporteService.descargarCsv(this.filtrosReporte).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'incidencias.csv';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = 'No se pudieron cargar los usuarios.';
      }
    });

    this.usuarioService.listarTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  get totalIncidencias(): number {
    return this.incidencias.length;
  }

  get totalPendientes(): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'PENDIENTE' ||
        incidencia.estado === 'ASIGNADA' ||
        incidencia.estado === 'EN_PROGRESO' ||
        incidencia.estado === 'REABIERTA'
    ).length;
  }

  get totalAbiertas(): number {
    return this.incidencias.filter(
      incidencia => incidencia.estado === 'PENDIENTE'
    ).length;
  }

  get totalEnProgreso(): number {
    return this.incidencias.filter(
      incidencia => incidencia.estado === 'ASIGNADA'
        || incidencia.estado === 'EN_PROGRESO'
        || incidencia.estado === 'REABIERTA'
    ).length;
  }

  get totalResueltas(): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.estado === 'RESUELTA' ||
        incidencia.estado === 'RESUELTA_POR_TECNICO' ||
        incidencia.estado === 'CONFIRMADA'
    ).length;
  }

  get totalSinAsignar(): number {
    return this.incidencias.filter(
      incidencia => !incidencia.tecnicoAsignado
    ).length;
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalTecnicos(): number {
    return this.tecnicos.length;
  }

  get totalAdmins(): number {
    return this.usuarios.filter(usuario => usuario.rol === 'ADMIN').length;
  }

  get totalUsuariosRol(): number {
    return this.usuarios.filter(usuario => usuario.rol === 'USUARIO').length;
  }

  get incidenciasFiltradas(): Incidencia[] {
    const termino = this.busquedaIncidencias.trim().toLowerCase();

    if (!termino) {
      return this.incidencias;
    }

    return this.incidencias.filter(incidencia =>
      `${incidencia.id} ${incidencia.titulo} ${incidencia.descripcion} ${incidencia.estado} ${incidencia.prioridad} ${incidencia.usuarioReporta} ${incidencia.tecnicoAsignado}`
        .toLowerCase()
        .includes(termino)
    );
  }

  get incidenciasRecientes(): Incidencia[] {
    return this.incidenciasFiltradas.slice(0, 6);
  }

  get incidenciasUrgentes(): Incidencia[] {
    return this.incidencias
      .filter(incidencia =>
        incidencia.prioridad === 'CRITICA' ||
        incidencia.estado === 'PENDIENTE' ||
        incidencia.estado === 'REABIERTA'
      )
      .slice(0, 5);
  }

  get porcentajeResueltas(): number {
    if (!this.totalIncidencias) {
      return 0;
    }

    return Math.round((this.totalResueltas / this.totalIncidencias) * 100);
  }

  get porcentajePendientes(): number {
    if (!this.totalIncidencias) {
      return 0;
    }

    return Math.round((this.totalPendientes / this.totalIncidencias) * 100);
  }

  get porcentajeSinAsignar(): number {
    if (!this.totalIncidencias) {
      return 0;
    }

    return Math.round((this.totalSinAsignar / this.totalIncidencias) * 100);
  }

  get donutEstados(): string {
    if (!this.totalIncidencias) {
      return 'conic-gradient(#e5e7eb 0 100%)';
    }

    const abiertas = (this.totalAbiertas / this.totalIncidencias) * 100;
    const proceso = (this.totalEnProgreso / this.totalIncidencias) * 100;
    const resueltas = (this.totalResueltas / this.totalIncidencias) * 100;
    const tramoProceso = abiertas + proceso;
    const tramoResueltas = tramoProceso + resueltas;

    return `conic-gradient(#f97316 0 ${abiertas}%, #2563eb ${abiertas}% ${tramoProceso}%, #10b981 ${tramoProceso}% ${tramoResueltas}%, #e5e7eb ${tramoResueltas}% 100%)`;
  }

  get maxAsignadasTecnico(): number {
    return Math.max(
      1,
      ...this.tecnicos.map(tecnico => this.totalAsignadasTecnico(tecnico.username))
    );
  }

  get tecnicosDestacados(): Usuario[] {
    return [...this.tecnicos]
      .sort((a, b) =>
        this.totalAsignadasTecnico(b.username) - this.totalAsignadasTecnico(a.username)
      )
      .slice(0, 5);
  }

  get usuariosFiltrados(): Usuario[] {
    const termino = this.busquedaUsuarios.trim().toLowerCase();

    if (!termino) {
      return this.usuarios;
    }

    return this.usuarios.filter(usuario =>
      `${usuario.id} ${usuario.username} ${usuario.rol}`
        .toLowerCase()
        .includes(termino)
    );
  }

  get totalPrioridadBaja(): number {
    return this.incidencias.filter(incidencia => incidencia.prioridad === 'BAJA').length;
  }

  get totalPrioridadMedia(): number {
    return this.incidencias.filter(incidencia => incidencia.prioridad === 'MEDIA').length;
  }

  get totalPrioridadAlta(): number {
    return this.incidencias.filter(incidencia => incidencia.prioridad === 'ALTA').length;
  }

  get totalPrioridadCritica(): number {
    return this.incidencias.filter(incidencia => incidencia.prioridad === 'CRITICA').length;
  }

  get maxPrioridad(): number {
    return Math.max(
      1,
      this.totalPrioridadBaja,
      this.totalPrioridadMedia,
      this.totalPrioridadAlta,
      this.totalPrioridadCritica
    );
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
      return 'Confirmada';
    }

    if (estado === 'REABIERTA') {
      return 'Reabierta';
    }

    return estado || '-';
  }

  prioridadTexto(prioridad?: string): string {
    if (prioridad === 'CRITICA') {
      return 'Critica';
    }

    return prioridad || '-';
  }

  idIncidencia(incidencia: Incidencia): string {
    const id = incidencia.id || 0;
    return `INC-${String(id).padStart(4, '0')}`;
  }

  totalAsignadasTecnico(username: string): number {
    return this.incidencias.filter(
      incidencia => incidencia.tecnicoAsignado === username
    ).length;
  }

  totalResueltasTecnico(username: string): number {
    return this.incidencias.filter(
      incidencia =>
        incidencia.tecnicoAsignado === username &&
        (
          incidencia.estado === 'RESUELTA' ||
          incidencia.estado === 'RESUELTA_POR_TECNICO' ||
          incidencia.estado === 'CONFIRMADA'
        )
    ).length;
  }

  seleccionarIncidencia(incidencia: Incidencia) {
    this.incidenciaSeleccionada = incidencia;
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

  crearUsuario() {
    this.mensajeUsuarios = '';
    this.errorUsuarios = '';

    const username = this.nuevoUsername.trim();
    const password = this.nuevoPassword.trim();

    if (username.length < 3) {
      this.errorUsuarios = 'Ingrese un username de al menos 3 caracteres.';
      return;
    }

    if (password.length < 4) {
      this.errorUsuarios = 'Ingrese una password de al menos 4 caracteres.';
      return;
    }

    this.usuarioService.crear({
      username,
      password,
      rol: this.nuevoRol
    }).subscribe({
      next: () => {
        this.mensajeUsuarios = 'Usuario creado correctamente.';
        this.nuevoUsername = '';
        this.nuevoPassword = '';
        this.nuevoRol = 'USUARIO';
        this.cargarUsuarios();
        this.cargarDashboard();
        this.cargarReporte();
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = error.error?.mensaje || 'Error al crear usuario.';
      }
    });
  }

  actualizarRol(usuario: Usuario, rol: RolUsuario) {
    if (!usuario.id) {
      return;
    }

    this.usuarioService.actualizar(usuario.id, { rol }).subscribe({
      next: () => {
        this.mensajeUsuarios = 'Rol actualizado correctamente.';
        this.cargarUsuarios();
        this.cargarDashboard();
        this.cargarReporte();
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = 'Error al actualizar rol.';
      }
    });
  }

  actualizarUsername(usuario: Usuario, username: string) {
    this.mensajeUsuarios = '';
    this.errorUsuarios = '';

    if (!usuario.id) {
      return;
    }

    const nuevoUsername = username.trim();

    if (nuevoUsername.length < 3) {
      this.errorUsuarios = 'Ingrese un username de al menos 3 caracteres.';
      return;
    }

    this.usuarioService.actualizar(usuario.id, {
      username: nuevoUsername
    }).subscribe({
      next: () => {
        this.mensajeUsuarios = 'Username actualizado correctamente.';
        this.cargarUsuarios();
        this.cargarDashboard();
        this.cargarReporte();
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = error.error?.mensaje || 'Error al actualizar username.';
      }
    });
  }

  resetearPassword(usuario: Usuario) {
    if (!usuario.id) {
      return;
    }

    const password = prompt(`Nueva password para ${usuario.username}`);

    if (!password) {
      return;
    }

    if (password.trim().length < 4) {
      this.errorUsuarios = 'La password debe tener al menos 4 caracteres.';
      return;
    }

    this.usuarioService.actualizar(usuario.id, {
      password: password.trim()
    }).subscribe({
      next: () => {
        this.mensajeUsuarios = 'Password actualizada correctamente.';
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = 'Error al actualizar password.';
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (!usuario.id) {
      return;
    }

    if (!confirm(`Desea eliminar el usuario ${usuario.username}?`)) {
      return;
    }

    this.usuarioService.eliminar(usuario.id).subscribe({
      next: () => {
        this.mensajeUsuarios = 'Usuario eliminado correctamente.';
        this.cargarUsuarios();
        this.cargarDashboard();
        this.cargarReporte();
      },
      error: (error) => {
        console.error(error);
        this.errorUsuarios = 'Error al eliminar usuario.';
      }
    });
  }

  asignarTecnico(id: number, tecnico: string) {
    this.mensajeGeneral = '';
    this.errorGeneral = '';

    if (!tecnico) {
      this.errorGeneral = 'Seleccione un tecnico para asignar la incidencia.';
      return;
    }

    this.incidenciaService
      .asignarTecnico(id, tecnico)
      .subscribe({
        next: () => {
          this.mensajeGeneral = 'Tecnico asignado correctamente.';
          this.cargarIncidencias();
          this.cargarDashboard();
          this.cargarReporte();
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al asignar tecnico.';
        }
      });
  }

  eliminar(id: number) {
    this.mensajeGeneral = '';
    this.errorGeneral = '';

    if (confirm('Desea eliminar la incidencia?')) {
      this.incidenciaService.eliminar(id).subscribe({
        next: () => {
          this.mensajeGeneral = 'Incidencia eliminada correctamente.';
          this.cargarIncidencias();
          this.cargarDashboard();
          this.cargarReporte();
        },
        error: (error) => {
          console.error(error);
          this.errorGeneral = 'Error al eliminar incidencia.';
        }
      });
    }
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

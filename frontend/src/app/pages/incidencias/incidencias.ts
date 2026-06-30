import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Incidencia, PrioridadIncidencia } from '../../models/incidencia.model';
import { IncidenciaService } from '../../services/incidencia.service';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.css',
})
export class IncidenciasComponent implements OnInit {

  incidencias: Incidencia[] = [];

  titulo = '';
  descripcion = '';
  prioridad: PrioridadIncidencia = 'MEDIA';
  errorFormulario = '';

  constructor(
    private incidenciaService: IncidenciaService
  ) {}

  ngOnInit(): void {
    this.listarIncidencias();
  }

  listarIncidencias() {
    this.incidenciaService.listar().subscribe({
      next: (data) => {
        this.incidencias = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  crearIncidencia() {
    this.errorFormulario = '';

    const titulo = this.titulo.trim();
    const descripcion = this.descripcion.trim();
    const usuarioReporta = globalThis.localStorage?.getItem('username') || undefined;

    if (!titulo || titulo.length < 5) {
      this.errorFormulario = 'Ingrese un titulo de al menos 5 caracteres.';
      return;
    }

    if (!descripcion || descripcion.length < 10) {
      this.errorFormulario = 'Ingrese una descripcion de al menos 10 caracteres.';
      return;
    }

    const incidencia = {
      titulo,
      descripcion,
      prioridad: this.prioridad,
      usuarioReporta
    };

    this.incidenciaService.crear(incidencia).subscribe({
      next: () => {
        alert('Incidencia creada correctamente');

        this.titulo = '';
        this.descripcion = '';
        this.prioridad = 'MEDIA';

        this.listarIncidencias();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  eliminarIncidencia(id: number) {
    if (!confirm('Desea eliminar esta incidencia?')) {
      return;
    }

    this.incidenciaService.eliminar(id).subscribe({
      next: () => {
        this.listarIncidencias();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}

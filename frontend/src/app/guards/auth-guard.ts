import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RolUsuario } from '../models/usuario.model';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = globalThis.localStorage?.getItem('token');
  const rol = globalThis.localStorage?.getItem('rol') as RolUsuario | null;
  const rolesPermitidos = route.data?.['roles'] as RolUsuario[] | undefined;

  if (!token || tokenExpirado(token)) {
    cerrarSesion(router);
    return false;
  }

  if (rolesPermitidos?.length && (!rol || !rolesPermitidos.includes(rol))) {
    router.navigate([rutaPorRol(rol)]);
    return false;
  }

  return true;
};

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiracionMs = payload.exp * 1000;
    return Date.now() >= expiracionMs;
  } catch {
    return true;
  }
}

function cerrarSesion(router: Router) {
  globalThis.localStorage?.clear();
  router.navigate(['/login']);
}

function rutaPorRol(rol: RolUsuario | null): string {
  if (rol === 'ADMIN') {
    return '/admin';
  }

  if (rol === 'TECNICO') {
    return '/tecnico';
  }

  if (rol === 'USUARIO') {
    return '/usuario';
  }

  return '/login';
}

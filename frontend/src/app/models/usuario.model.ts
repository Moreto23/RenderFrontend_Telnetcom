export type RolUsuario = 'ADMIN' | 'TECNICO' | 'USUARIO';

export interface Usuario {
  id?: number;
  username: string;
  password?: string;
  rol: RolUsuario;
}

export interface CrearUsuarioRequest {
  username: string;
  password: string;
  rol: RolUsuario;
}

export interface ActualizarUsuarioRequest {
  username?: string;
  password?: string;
  rol?: RolUsuario;
}

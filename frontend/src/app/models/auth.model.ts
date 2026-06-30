export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  rol: 'ADMIN' | 'TECNICO' | 'USUARIO' | '';
  mensaje: string;
  token: string;
}

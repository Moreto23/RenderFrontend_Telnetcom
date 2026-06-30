import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { TecnicoComponent } from './pages/tecnico/tecnico';
import { UsuarioComponent } from './pages/usuario/usuario';
import { IncidenciasComponent } from './pages/incidencias/incidencias';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginComponent
    },

    // ADMIN
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard],
        data: {
            roles: ['ADMIN']
        }
    },

    // TECNICO
    {
        path: 'tecnico',
        component: TecnicoComponent,
        canActivate: [authGuard],
        data: {
            roles: ['TECNICO']
        }
    },

    // USUARIO
    {
        path: 'usuario',
        component: UsuarioComponent,
        canActivate: [authGuard],
        data: {
            roles: ['USUARIO']
        }
    },

    // INCIDENCIAS
    {
        path: 'incidencias',
        component: IncidenciasComponent,
        canActivate: [authGuard],
        data: {
            roles: ['ADMIN']
        }
    }

];

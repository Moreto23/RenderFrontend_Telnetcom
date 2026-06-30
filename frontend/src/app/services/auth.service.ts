import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
    })

    export class AuthService {

    private apiUrl = 'http://localhost:8080/auth';

    constructor(private http: HttpClient) { }

    login(data: LoginRequest): Observable<LoginResponse>{

        return this.http.post<LoginResponse>(
        `${this.apiUrl}/login`,
        data
        );

    }

}

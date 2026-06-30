import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  // OBTENER TOKEN
  const token = globalThis.localStorage?.getItem('token');

  // SI EXISTE TOKEN
  if(token){

    // CLONAR REQUEST
    const clonedRequest = req.clone({

      setHeaders: {

        Authorization: `Bearer ${token}`

      }

    });

    return next(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          globalThis.localStorage?.clear();
        }

        return throwError(() => error);
      })
    );

  }

  // SI NO EXISTE
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        globalThis.localStorage?.clear();
      }

      return throwError(() => error);
    })
  );

};

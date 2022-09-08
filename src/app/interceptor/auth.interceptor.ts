import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService:AuthenticationService) {}

  intercept(httpRequest: HttpRequest<unknown>, httpHandler: HttpHandler): Observable<HttpEvent<unknown>> {
    if(httpRequest.url.includes(`${this.authenticationService.host}/user/login`))
    {
      return httpHandler.handle(httpRequest);
    }
    if(httpRequest.url.includes(`${this.authenticationService.host}/user/register`))
    {
      return httpHandler.handle(httpRequest);
    }
    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    //you cannot modify the original request you can just clone it
    const interceptedRequested = httpRequest.clone({ setHeaders : {Authorization: `Bearer ${token}`} });
    return httpHandler.handle(interceptedRequested);
  }
}

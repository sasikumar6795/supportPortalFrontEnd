import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../model/User';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token : string;
  private loggedInUserName : string;
  private jwtHelper =  new JwtHelperService();

  constructor(private http: HttpClient) { }

  public login(user: User) : Observable<HttpResponse<User>>{
    return this.http.post<User>
    // by default it just gives the body , we are expecting the whole response thats why {observer:'response}
    (`${this.host}/user/login`, user,{observe :'response'});
  }

  public registerUser(user: User) : Observable<User> {
    return this.http.post<User>
    (`${this.host}/user/register`, user);
  }

  public logOut() : void {
    this.token = null;
    this.loggedInUserName = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string) : void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserTolocalCache(user: User) : void {
    // as the local storage accepts string datatype, saving the object form is not appropriate so we are converting into a string
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache() : User {
    return JSON.parse(localStorage.getItem('user'));
  }

  public loadToken() : void {
    this.token = localStorage.getItem('token');
  }

  public getToken() : string {
    return this.token;
  }

  public isLoggedIn() : boolean {
    this.loadToken();
    if(this.token===null || this.token === '' )
    {
      this.logOut();
      return false;
    }

    if(this.jwtHelper.decodeToken(this.token).sub !=null || '')
    {
      if(!this.jwtHelper.isTokenExpired(this.token))
      {
        this.loggedInUserName=this.jwtHelper.decodeToken(this.token).sub;
        return true;
      }
    }
  }

}

import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomHttpResponse } from '../model/custom-http-response';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {  

  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getUsers() : Observable<User[] | HttpErrorResponse> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData:FormData): Observable<User | HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/add`,formData);
  }

  public updateUser(formData:FormData) : Observable<User | HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/update`,formData);
  }

  public resetPassword(email:string) : Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.get<CustomHttpResponse>(`${this.host}/user/resetPassword/${email}`);
  }

  // to see the progress of uploading the image as it takes some time
  // so return type is a http event
  public updateProfileImage(formData:FormData) : Observable<HttpEvent<User> | HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`,formData,
    {
      reportProgress:true,
      observe:'events'
    }
    );
  }

  public deleteUser(userId:number) : Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${userId}`);
  }

  public addUsersToLocalCache(users: User[]) :void {
    localStorage.setItem('users',JSON.stringify(users));
  }

  public getUsersFromLocalCache() : User[] {
    return localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : null;
  }

  public createUserFormData(loggedInUserName: string, user:User, profileImage:File) : FormData {
    const formData =  new FormData();
    formData.append('currentUserName' , loggedInUserName);
    formData.append('firstName' , user.firstName);
    formData.append('lastName' , user.lastName);
    formData.append('email' , user.email);
    formData.append('role' , user.role);
    formData.append('profileImage' , profileImage);
    formData.append('isActive' , JSON.stringify(user.active));
    formData.append('isNonLocked' , JSON.stringify(user.notLocked));
    return formData;
  }


}

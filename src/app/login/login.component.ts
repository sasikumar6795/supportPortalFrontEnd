import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Headers } from '../enum/headers.enum';
import { NotificationType } from '../enum/notification-type.enum';
import { User } from '../model/User';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, 
              private authenticationService:AuthenticationService,
              private notifier: NotificationService) { }
  

  ngOnInit(): void {
    if(!this.authenticationService.isLoggedIn()){
      this.router.navigateByUrl('/login');
    } else {
      this.router.navigateByUrl('/users/management');
    }
  }

  public onLogin(user: User): void {
    this.showLoading =true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response:HttpResponse<User>) => {
          const token = response.headers.get(Headers.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserTolocalCache(response.body);
          this.router.navigateByUrl('/users/management');
          this.showLoading=false;

        },
        (errorResponse:HttpErrorResponse) => {
          console.log(errorResponse);
          this.sendNotificationError(NotificationType.ERROR, errorResponse.message);
        }
      )
    )
    
  }
  private sendNotificationError(type: NotificationType, message: string) {
    if(message) {
      this.notifier.showNotification(type,message);
    }else {
      this.notifier.showNotification(type, 'Error Occurred while logging in the user');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

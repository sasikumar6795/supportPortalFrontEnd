import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NotificationType } from '../enum/notification-type.enum';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor ( private authenticationService : AuthenticationService, private router: Router, private notificationService: NotificationService ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
     return this.isUserLoggedIn();
  }


  private isUserLoggedIn() : boolean {
    if(this.authenticationService.isLoggedIn()) {
      this.notificationService.showNotification(NotificationType.SUCCESS, 'User logged in successfully');
      return true;
    }

    this.router.navigate(['/login']);
    //send notification
    this.notificationService.showNotification(NotificationType.ERROR, `You need to login into the application`.toUpperCase());
    return false;
  }
  
}

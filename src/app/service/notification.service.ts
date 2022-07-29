import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { NotificationType } from '../enum/notification-type.enum';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly notifier: NotifierService;

  constructor(notifierService: NotifierService) { 
    this.notifier = notifierService;
  }

  public showNotification(type: NotificationType, message: string) {
    this.notifier.notify(type,message);
  }
}

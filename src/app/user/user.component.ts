import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { User } from '../model/User';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  titleSubject =  new BehaviorSubject<string>('users');
  //listener for the behviour subject
  titleAction$ =  this.titleSubject.asObservable();
  users: User[];
  refreshing : boolean;
  private subscriptions: Subscription[] =[];
  selectedUser : User;
  isAdmin : boolean = true;
  profileImage: File;
  fileName: String;

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getUsers(false);
  }


  changeTitle(title: string ) : void {
    this.titleSubject.next(title);
  }

  getUsers(showNotification: boolean) : void {
    this.refreshing=true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users=response;
          this.refreshing=false;
          if(showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} users are loaded successfully`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing=false;
        }
      )
    )
  }

  private sendNotification(type: NotificationType, message: string) {
    if(message) {
      this.notificationService.showNotification(type,message);
    }else {
      this.notificationService.showNotification(type, 'Error Occurred while logging in the user');
    }
  }

  private onSelectUser(selectedUser: User) : void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  public onProfileImageChange(fileName: String, file:File) : void {
    this.fileName = fileName;
    this.profileImage = file;
  } 

  public saveNewUser() {
    //hidden button clicking
    this.clickButton('new-user-save');
  }

  public onAddNewUser(newUserForm : NgForm) : void {

    const formData = this.userService.createUserFormData(null,newUserForm.value,this.profileImage);
    this.userService.addUser(formData).subscribe(
      (response: User) => {
        this.clickButton('new-user-close');
        this.getUsers(false);
        this.fileName=null;
        this.profileImage=null;
        newUserForm.reset();
        this.sendNotification(NotificationType.SUCCESS, 
          `${response.firstName} ${response.lastName} user added successfully`);

      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing=false;
      }
    )

  }

  private clickButton(buttonId: string) :void {
    document.getElementById(buttonId).click();
  }

  public searchUsers(searchTerm: any) {
    let results : User[] = [];
    for(let user of this.users) {
      if(user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1 ||
      user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1 ||
      user.userName.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1 ||
      user.email.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1 ||
      user.userId.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1) {
          results.push(user);
      }
    }
    this.users = results;
    if(results.length===0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  

}

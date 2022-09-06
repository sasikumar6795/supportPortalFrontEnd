import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { CustomHttpResponse } from '../model/custom-http-response';
import { User } from '../model/User';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  titleSubject =  new BehaviorSubject<string>('users');
  //listener for the behviour subject
  titleAction$ =  this.titleSubject.asObservable();
  users: User[];
  user: User;
  refreshing : boolean;
  private subscriptions: Subscription[] =[];
  selectedUser : User;
  isAdmin : boolean = true;
  profileImage: File;
  fileName: String;
  editUser = new User();
  currentUserName: string;

  constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
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
        this.profileImage=null;
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

  public onEditUser(editUser: User) : void {
    this.editUser = editUser;
    // in order to remember the current username
    this.currentUserName = editUser.userName;
    this.clickButton('openUserEdit');
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUserName,this.editUser,this.profileImage);
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.clickButton('closeEditUserModalButton');
        this.getUsers(false);
        this.fileName=null;
        this.profileImage=null;
        this.sendNotification(NotificationType.SUCCESS, 
          `${response.firstName} ${response.lastName} user updated successfully`);

      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage=null;
      }
    )
  }

  public onUpdateCurrentUser(user: User): void {
    this.currentUserName=this.authenticationService.getUserFromLocalCache().userName;
    const formData = this.userService.createUserFormData(this.currentUserName,user,this.profileImage);
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.authenticationService.addUserTolocalCache(response);
        this.fileName=null;
        this.profileImage=null;
        this.sendNotification(NotificationType.SUCCESS, 
          `${response.firstName} ${response.lastName} user updated successfully`);

      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage=null;
      }
    )
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You have been logged out successfully`);
  }

  public onDeleteUser(userId: number) :void {

    this.subscriptions.push(
      this.userService.deleteUser(userId).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, 
            response.message);

            this.getUsers(false);
        }, 
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    )

  }

  public onResetPassword(emailForm: NgForm): void {
    const emailAddress = emailForm.value['reset-password-email'];
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        }, 
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

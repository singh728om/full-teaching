import { Component, OnInit, EventEmitter }  from '@angular/core';
import { Subscription }                     from 'rxjs/Subscription';

import { LessonDetailsComponent } from '../lesson-details/lesson-details.component';

import { Lesson }         from '../../classes/lesson';
import { LessonDetails }  from '../../classes/lesson-details';

import { LessonService }            from '../../services/lesson.service';
import { AuthenticationService }    from '../../services/authentication.service';
import { ForumModalDataService }  from '../../services/forum-modal-data.service';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  providers: [ForumModalDataService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  lessons: Lesson[];
  lessonDetails: LessonDetails;

  lessonDetailsActive: number = -1;

  //Forum modal data
  forumModalMode: number; // 0: New entry | 1: New comment on an entry | 2: New replay to existing comment
  forumModalHeader: string;
  forumModalCommentReplay: string;

  //Collapsible components HTML info
  collapsibleTrigger: string = 'collapsibleTrigger_';
  collapsibleElement: string = 'collapsibleElement_';
  iconTrigger: string = 'iconTrigger_';

  actions = new EventEmitter<string>();

  subscription: Subscription;

  constructor(
    private lessonService: LessonService,
    private authenticationService: AuthenticationService,
    private forumModalHeaderService: ForumModalDataService,
  ) {
    this.subscription = forumModalHeaderService.modeAnnounced$.subscribe(
      objs => {
        //Objs is an array containing forumModalMode, forumModalHeader and forumModalCommentReplay, in that order
        this.forumModalMode = objs[0];
        if (objs[1]) this.forumModalHeader = objs[1]; //Only if the string is not empty
        if (objs[2]) this.forumModalCommentReplay = objs[2]; //Only if the string is not empty
      });
  }

  ngOnInit(): void {
    this.authenticationService.checkCredentials();
    this.getLessons();
  }

  logout() {
    this.authenticationService.logout();
  }

  getLessons(): void {
    this.lessonService.getLessons().subscribe(
      lessons => {
        console.log(lessons);
        lessons.sort((l1, l2) => { //Sort lessons by date
          if (l1.date > l2.date) {
            return 1;
          }
          if (l1.date < l2.date) {
            return -1;
          }
          return 0;
        });
        this.lessons = lessons;
      },
      error => console.log(error));
  }

  getLessonDetails(id: string): void {
    this.lessonService.getLessonDetails(id).subscribe(
      lessonDetails => {
        console.log(lessonDetails);
        this.lessonDetails = lessonDetails;
        $('#' + this.iconTrigger + id).removeClass('loading-details'); //Petition animation deactivated
        this.fireClickOnCollapsible(id); //Click event on collapsible to activate it
      },
      error => console.log(error));
  }



  triggerLessonDetails(id: string) {

    // If there's no lesson-detail active or if a different one is going to be activated
    if (this.lessonDetailsActive == -1 || this.lessonDetailsActive != +id) {
      $('#' + this.iconTrigger + id).addClass('loading-details'); //Petition animation activated
      this.getLessonDetails(id);      //Petition for specific lesson-details
    }

    // If an active lesson-detail is going to be closed
    else {
      $('#' + this.collapsibleElement + this.lessonDetailsActive).removeClass('active'); //Removed active class from the collapsible
      $('#' + this.collapsibleTrigger + id).prop("checked", false); //The input is unchecked
      this.lessonDetailsActive = -1;   //No lesson-details view active
    }
  }

  fireClickOnCollapsible(id) {
    $('#' + this.collapsibleTrigger + id).prop("checked", true); //The input is checked
    $('#' + this.collapsibleElement + id).addClass('active'); // Its container is activated
    $('#' + this.collapsibleElement + this.lessonDetailsActive).removeClass('active'); //Previous collapsible is not activated
    this.lessonDetailsActive = +id; //New lesson-details view active
  }

  onSubmitForum(entryTitle: string, comment: string){
    //Send new entry/comment
  }

}

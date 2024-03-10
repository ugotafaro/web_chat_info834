import { CommonModule, NgClass, NgFor } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { Message } from '../../message';
import {FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChatService as ChatSocketService } from '../chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { User } from '../../user';
import { Conversation } from '../../conversation';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, PickerModule, NgFor],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
  isAuth: Observable<boolean> = this.authService.isAuthenticated$();
  user: Observable<User | null> = this.authService.getUser$();


  @ViewChild('chatSection') chatSection!: ElementRef;
  listMessages!: Message[];
  listConversations : Conversation[]= [];
  messageForm = new FormGroup({
    message : new FormControl('')
  });
  showEmojiPicker = false;
  set = 'apple';


  constructor(private chatService: ChatSocketService, private authService: AuthService, private router: Router) {
    chatService.messages.subscribe(msg => {
      this.listMessages.unshift(msg);
    });


  }

  ngOnInit() {
  
    this.listMessages = [];
    this.getUserConversations();
    console.log("Liste de conversations : ",this.listConversations);
    console.log("Last message : ",this.getLastMessage())
  }

  addMessage(message: string) {
    let msgObject = new Message(this.listMessages.length + 1, message, new Date().toISOString(), true, 1);
    this.chatService.messages.next(msgObject);

  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event : any) {
    const  message  = this.messageForm.get('message')!.value;
    const text = `${message}${event.emoji.native}`;
    this.messageForm.get('message')!.setValue(text);
    // this.showEmojiPicker = false;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }

  onBlur() {
    console.log('onblur');
  }


  onSubmit() {
    const message = this.messageForm.get('message')!.value || null;
    this.addMessage(message!);
    this.messageForm.reset();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatSection.nativeElement.scrollTop = this.chatSection.nativeElement.scrollHeight;
    } catch(err) { }
  }

  getUserConversations() {
    this.authService.get_conservations().pipe(
      map(data => {
          data = data.data;
          if (Array.isArray(data)) {
              return data.map(conversationData => new Conversation(
                  conversationData._id,
                  conversationData.name,
                  conversationData.content,
                  conversationData.users,
                  conversationData.messages
              ));
          } else {
              throw new Error("Les données reçues ne sont pas un tableau.");
          }
      })
  ).subscribe(
      conversations => {
          this.listConversations.unshift(...conversations);
          console.log("Liste de conversations mise à jour :", this.listConversations);
      },
      error => {
          console.error("Erreur lors de la récupération des conversations :", error);
      }
  );
    
  }

  getLastMessage(){
    return this.listConversations[0].messages[this.listConversations[0].messages.length-1];
  }
  logout() {
    this.authService.attemptLogout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => console.error(error),
    });
  }
}

import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { Message } from '../../message';
import {FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChatService as ChatSocketService } from '../chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../user';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, PickerModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
  isAuth: Observable<boolean> = this.authService.isAuthenticated$();
  user: Observable<User | null> = this.authService.getUser$();

  @ViewChild('chatSection') chatSection!: ElementRef;
  listMessages!: Message[];
  messageForm = new FormGroup({
    message : new FormControl('')
  });
  showEmojiPicker = false;
  set = 'apple';

  constructor(private chatService: ChatSocketService, private authService: AuthService, private router: Router) {
    chatService.messages.subscribe(msg => {
      this.listMessages.push(msg);
    });
  }

  ngOnInit() {
    // this.listMessages = [
    //   new Message(1, 'Hello', new Date().getHours(), true, 1),
    //   new Message(2, 'Hi', new Date().getHours(), false, 2),
    //   new Message(3, 'How are you?', new Date().getHours(), true, 1),
    //   new Message(4, 'I am fine', new Date().getHours(), false, 2),
    // ];
    this.listMessages = [];
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

  logout() {
    this.authService.attemptLogout().subscribe({
      next: () => {
        this.chatService.close();
        this.router.navigate(['/login']);
      },
      error: (error) => console.error(error),
    });
  }
}

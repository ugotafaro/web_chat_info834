import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Message } from '../../message';
import {FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, PickerModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  listMessages!: Message[];
  messageForm = new FormGroup({
    message : new FormControl('')
  });
  showEmojiPicker = false;
  set = 'apple';
  constructor() { }

  ngOnInit() {
    this.listMessages = [
      new Message(1, 'Hello', new Date().getHours(), true, 1),
      new Message(2, 'Hi', new Date().getHours(), false, 2),
      new Message(3, 'How are you?', new Date().getHours(), true, 1),
      new Message(4, 'I am fine', new Date().getHours(), false, 2),
    ];
  }

  addMessage(message: string) {
    this.listMessages.push(new Message(this.listMessages.length + 1, message, new Date().getHours(), true, 1));
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
    console.log('focus');
    this.showEmojiPicker = false;
  }
  onBlur() {
    console.log('onblur');
  }


  onSubmit() {
    const message = this.messageForm.get('message')!.value || null;
    console.log(message);
    this.addMessage(message!);
    this.messageForm.reset();
  }
}

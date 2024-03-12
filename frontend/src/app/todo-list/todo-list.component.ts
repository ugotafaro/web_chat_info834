import { Component, Input } from '@angular/core';
import { Task } from '../../task';
import { NgFor, CommonModule } from '@angular/common';
import { CategoriesToolbarComponent } from '../categories-toolbar/categories-toolbar.component';
import { Message } from '../../message';
import { ChatService as ChatSocketService } from '../chat.service';


@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})

export class TodoListComponent {

  tasks: Task[] = [];
  messages: Message[] = [];
  @Input() category: string = "";

  hideCreateButton = true;


  constructor(private chatService: ChatSocketService) {
    chatService.messages.subscribe(msg => {
      this.messages.push(msg);
    });
  }

  sendMsg() {
    this.chatService.messages.next(new Message(0, "Hello from the frontend", new Date(), true, 0));
  }
}
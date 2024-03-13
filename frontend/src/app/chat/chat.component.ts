import { CommonModule, NgFor } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { Message } from '../../message';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChatService as ChatSocketService } from '../chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../user';
import { Conversation } from '../../conversation';
import { initFlowbite } from 'flowbite';
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
  selectedConversation!: Conversation;
  conversations: Observable<Conversation[]> = this.chatService.getConversations$();
  messageForm = new FormGroup({
    message : new FormControl('')
  });

  // Used for the new conversation form
  suggestedUsers: Observable<User[]> = new Observable<User[]>();
  selectedUsers: User[] = [];
  newConversationForm = this.formBuilder.group({
    name: ['', Validators.required],
    user: [''],
  })

  showEmojiPicker = false;
  set = 'apple';

  constructor(private chatService: ChatSocketService, private authService: AuthService, private router: Router, private formBuilder: FormBuilder) {
    // Call searchUsers$ whenever the user input changes
    this.newConversationForm.get('user')!.valueChanges.pipe().subscribe({
      next: (user) => {
        if (user && user.length >= 3) {
          this.suggestedUsers = this.authService.searchUsers$(user);
        } else {
          this.suggestedUsers = new Observable<User[]>();
        }
      },
      error: (error) => {
        this.suggestedUsers = new Observable<User[]>();
        console.error(error);
      },
    });

    this.conversations.subscribe({
      next: (conversations) => {
        if(this.selectedConversation === undefined && conversations.length > 0) {
          this.selectedConversation = conversations[0];
        }
        console.log("Conversations", conversations);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  ngOnInit() {
    this.chatService.connect(this.authService.getUser()!);
    initFlowbite();
  }

  onSelectUser(event: any): void {
    // Récupérer l'ID de l'utilisateur sélectionné
    const selectedId = event.target.value;

    this.suggestedUsers.subscribe(users => {
      // Trouver l'utilisateur sélectionné
      const selectedUser = users.find(user => user.id === selectedId);
      if(!selectedUser) return;

      // Vérifier si l'utilisateur est déjà sélectionnés
      const alreadySelected = this.selectedUsers.find(user => user.id === selectedId);
      if (alreadySelected) return;

      // Ajouter l'utilisateur sélectionné à la liste des utilisateurs sélectionnés
      this.selectedUsers.push(selectedUser);
    });
  }

  isUserMessage(message: Message) {
    return message.userIdSender.toString() === this.authService.getUser()!.id;
  }
  newConversation() {
    const name = this.newConversationForm.get('name')!.value??'';
    const users = this.selectedUsers.concat([this.authService.getUser()!]);
    this.chatService.createConversation(name, users);
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
    let text = this.messageForm.get('message')!.value || null;
    if (!text) return;
    let msgObject = new Message(0, text, new Date(), 1);
    msgObject.conversation = this.selectedConversation.id;
    this.chatService.sendMessage(msgObject);
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

  getLastMessage(conversation: Conversation) : Message | null{
    return conversation.messages[conversation.messages.length-1];
  }

  changeConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  getUserById(id: string) {
    this.authService.getUserById(id)!.subscribe(
      data => {
        return data.data;
      }
    )
  }

  getUserName(id: any) {
    // Get the username from the current conversation using the id
    id = id.toString();
    let user = this.selectedConversation.users.find(user => user.id === id);
    return user?.firstname + " " + user?.lastname || user?.username || "Unknown";
  }

  logout() {
    this.authService.attemptLogout$().subscribe({
      error: (error) => console.error(error),
    });
    this.router.navigate(['/login'])
  }
}

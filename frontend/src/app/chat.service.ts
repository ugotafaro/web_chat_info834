import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { WebsocketService } from "./socket.service";
import { Message } from "../message";
import { User } from "../user";
import { Conversation } from "../conversation";

const CHAT_URL = "ws://localhost:3030";

@Injectable()
export class ChatService {
  public conversations: BehaviorSubject<Conversation[]>;
  private wsService: WebsocketService;
  private ws: Subject<any>;

  constructor(wsService: WebsocketService) {
    this.wsService = wsService;
    this.conversations = new BehaviorSubject<Conversation[]>([]);
    this.ws = new Subject<MessageEvent>();
  }

  close() {
    this.conversations.complete();
    this.wsService.close();
  }

  getConversations$(): Observable<Conversation[]> {
    return this.conversations.asObservable();
  }

  connect(user: User) {
    // Launch a new ws object
    this.wsService = new WebsocketService();

    // Connect to the server
    this.ws = this.wsService.connect(CHAT_URL, user.id);

    // Handle reception
    this.ws.subscribe((event: MessageEvent) => {
      const res = JSON.parse(event.data);
      console.log("[WS] Received ", res);
      switch(res.action) {
        case "new-message":
          let new_message = new Message(res.data.id, res.data.content, new Date(res.data.createdAt), res.data.sender);
          new_message.conversation = res.data.conversation;

          // Update the conversation with the new message
          this.conversations.next(this.conversations.getValue().map((conversation) => {
            if (conversation.id === res.data.conversation) {
              conversation.messages = [new_message, ...conversation.messages];
              conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }
            return conversation;
          }));
          break;

        case "new-conversation":
          let new_conversation = new Conversation(res.data._id, res.data.name, this.mapUsers(res.data.users), []);
          // Add the conversation to the list of conversations
          let currentConversations = this.conversations.getValue();
          let updatedConversations = [...currentConversations, new_conversation];
          this.conversations.next(updatedConversations);
          break;

        case "get-conversations":
          let conversations = res.data.map((conversation: any) => {
            return new Conversation(conversation._id, conversation.name, this.mapUsers(conversation.users), this.mapMessages(conversation.messages));
          });
          this.conversations.next(conversations);
          break;
        case "new-special-message":
          break;
        default:
          console.log("Unknown action", res.action);
      }
    });
  }

  sendMessage(message: Message) {
    const newMessageData = {
      action: 'new-message',
      data: {
        content: message.content,
        conversation: message.conversation,
      }
    };

    this.ws.next(newMessageData);
  }

  createConversation(name: string, users: User[]) {
    const newMessageData = {
      action: 'new-conversation',
      data: {
        name: name,
        users: users.map(user => user.id).join(','),
      }
    };
    this.ws.next(newMessageData);
  }

  private mapUsers(data: any): User[] {
    // Assuming users are returned in the 'data' field of the response
    const usersData = data || [];

    // Map each user in the 'data' array to the User model
    return usersData.map((user: any) => {
      return {
        id: user._id || 0,
        username: user.username || '',
        email: user.email || '',
        token: '',
        firstname: user.firstname || '',
        lastname: user.lastname || '',
      };
    });
  }

  private mapMessages(data: any): Message[] {
    const messages = data || [];

    return messages.map((message: any) => {
      return new Message(message._id, message.content, new Date(message.createdAt), message.sender);
    });
  }
}
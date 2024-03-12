import { Injectable } from "@angular/core";
import { Observable, Subject, map } from "rxjs";
import { WebsocketService } from "./socket.service";
import { Message } from "../message";
import { User } from "../user";

const CHAT_URL = "ws://localhost:3030";

@Injectable()
export class ChatService {
  public messages: Subject<Message>;
  private wsService: WebsocketService;
  private ws: Subject<any>;

  constructor(wsService: WebsocketService) {
    this.wsService = wsService;
    this.messages = new Subject<Message>();
    this.ws = new Subject<MessageEvent>();
  }

  close() {
    this.messages.complete();
    this.wsService.close();
  }

  connect(user: User) {
    // Reopen the connection
    this.wsService = new WebsocketService();

    // Connect to the server
    this.ws = this.wsService.connect(CHAT_URL, user.id);

    // Create a new observable that will be used to send messages to the server
    this.messages = new Subject<Message>();

    // Handle reception
    this.ws.subscribe((event: MessageEvent) => {
      const res = JSON.parse(event.data);
      console.log("[WS] Received ", res);
      switch(res.action) {
        case "new-message":
          let new_message = new Message(res.data.id, res.data.content, new Date(res.data.createdAt), res.data.sender == user.id, res.data.sender);
          new_message.conversation = res.data.conversation;
          this.messages.next(new_message);
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
}
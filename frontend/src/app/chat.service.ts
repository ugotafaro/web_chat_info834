import { Injectable } from "@angular/core";
import { Subject, map } from "rxjs";
import { WebsocketService } from "./socket.service";
import { Message } from "../message";

const CHAT_URL = "ws://localhost:3030";

@Injectable()
export class ChatService {
  public messages: Subject<Message>;
  private ws : Subject<any>;

  constructor(wsService: WebsocketService) {
    // Create a new observable that will be used to send messages to the server
    this.messages = new Subject<Message>();
    this.ws = wsService.connect(CHAT_URL);

    // Connect to the server
    this.ws.pipe(
      // Map the response to a Message
      map((response: MessageEvent): Message => {
        let data = JSON.parse(response.data);
        return new Message(data.id, data.content, data.timestamp, false, data.userIdSender);
      })

    // Subscribe to the messages
    ).subscribe((message: Message) => {
      // console.log(`Receiving ${message.content}`);
      this.messages.next(message);
    });

    // Subscribe to the messages subject to send messages
    this.messages.subscribe((message: Message) => {
      // console.log(`Sending "${message.content}"`);
      this.ws.next(message);
    });
  }

  close() {
    this.ws.complete();
  }
}
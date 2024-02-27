import { Injectable } from "@angular/core";
import { Subject, map } from "rxjs";
import { WebsocketService } from "./socket.service";
import { Message } from "../message";

const CHAT_URL = "ws://localhost:3030";

@Injectable()
export class ChatService {
  public messages: Subject<Message>;
  private wsService: WebsocketService;

  constructor(wsService: WebsocketService) {
    this.wsService = wsService;
    // Create a new observable that will be used to send messages to the server
    this.messages = new Subject<Message>();
    // Connect to the server
    let ws: Subject<any> = wsService.connect(CHAT_URL);

    // Handle message reception
    ws.pipe(
      // Map the response to a Message
      map((response: MessageEvent): Message => {
        let data = JSON.parse(response.data);
        return new Message(data.id, data.content, data.timestamp, false, data.userIdSender);
      })
      // Emit the message to the observable
      ).subscribe((message: Message) => {
        this.messages.next(message);
    });

    // Handle message emission
    this.messages.subscribe((message: Message) => {
      ws.next(message);
    });
  }

  close() {
    this.messages.complete();
    this.wsService.close();
  }
}
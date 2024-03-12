import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { User } from '../user';

@Injectable()
export class WebsocketService {
  constructor() {}

  private subject!: Subject<MessageEvent>;
  private ws!: WebSocket;

  public connect(url: string | URL, user: string): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url, user);
    }
    return this.subject;
  }

  private create(url: string | URL, user: string): Subject<MessageEvent> {
    this.ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      this.ws.onopen = () => {
        console.log("[WS] Connected to " + url);
        this.ws.send(JSON.stringify({ action: "set-user", data: { user: user }}));
      };

      return this.ws.close.bind(this.ws);
    });

    let observer = {
      next: (data: any) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          console.log("[WS] Sending ", data);
          if(data.action === "new-message") data.data.sender = user;
          this.ws.send(JSON.stringify(data));
        } else {
          console.log("[WS] Can't send", data);
        }
      }
    };
    return Subject.create(observer, observable);
  }

  public close() {
    if (this.subject) {
      this.subject.complete();
      console.log("[WS] Disconnected");
    }
  }
}
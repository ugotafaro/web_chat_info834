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
      console.log("[WS] Connected to " + url);
    }
    return this.subject;
  }

  private create(url: string | URL, user: string): Subject<MessageEvent> {
    this.ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      return this.ws.close.bind(this.ws);
    });

    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({...data, user}));
        } else {
          console.log("[WS] Not connected to " + url);
        }
      }
    };
    return Subject.create(observer, observable);
  }

  public close() {
    if (this.subject) {
      this.ws.close();
      this.subject.complete();
      console.log("[WS] Disconnected");
    }
  }
}
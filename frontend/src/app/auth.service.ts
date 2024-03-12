import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../user';
import { ChatService } from './chat.service';
import { Conversation } from '../conversation';
import { Message } from '../message';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private user: BehaviorSubject<User | null>;

  constructor(private http: HttpClient, private chatService: ChatService) {
    this.user = new BehaviorSubject<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  }

  attemptLogin(loginInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginInfo).pipe(
      map(response => {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.user.next(response.user);
      })
    );
  }

  attemptLogout$(): Observable<any>  {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token;

    if (!token) return new Observable();

    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token,
    });

    // We remove items from localStorage BEFORE waiting for the request
    // because it is better for user experience
    localStorage.removeItem('user');
    this.user.next(null);

    // We close the chatService before sending the request
    this.chatService.close();

    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers });
  }

  attemptSignup(signupInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, signupInfo).pipe(
      map(response => {
        localStorage.setItem('user', response.user);
        this.user.next(response.user);
      })
    );
  }

  getUser$(): Observable<User | null> {
    return this.user.asObservable();
  }

  isAuthenticated$(): Observable<boolean> {
    return this.user.pipe(map(user => user !== null));
  }

  isAuthenticated(): boolean {
    return this.user.getValue() !== null;
  }

  getUser(): User | null {
    return this.user.getValue();
  }

  get_conservations(): Observable<Conversation[]> {
    if (!this.isAuthenticated()) return new Observable();
    return this.http.get<any>(`${this.apiUrl}/get-conversations?user=${this.getUser()!.id}`).pipe(
      map(response => this.mapConversations(response))
    );
  }

  searchUsers$(query: string): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/search-users?search=${query}`).pipe(
      map(response => this.mapUsers(response.data))
    );
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

  private mapConversations(res: any): Conversation[] {
    const conversations = res.data || [];
    return conversations.map(
      (item: any) => new Conversation(item._id, item.name, this.mapUsers(item.users), this.mapMessages(item.messages))
    )
  }

  private mapMessages(data: any): Message[] {
    const messages = data || [];
    console.log(messages);

    return messages.map((message: any) => {
      return new Message(message._id, message.content, new Date(message.createdAt), message.sender === this.getUser()!.id, message.sender);
    });
  }

  createConversation(name: string, users: User[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/new-conversation`,
      {
        "users": users.map(user => user.id).join(','),
        "name": name,
      }
    ).pipe(
      map(response => {
        return { id: response.data._id, name: response.data.name, users: response.data.users };
      })
    );
  }
}

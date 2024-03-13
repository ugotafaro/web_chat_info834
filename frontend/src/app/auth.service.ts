import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../user';
import { ChatService } from './chat.service';
import ObjectID from 'bson-objectid';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private user: BehaviorSubject<User | null>;

  constructor(private http: HttpClient, private chatService: ChatService) {
    const storedUser = localStorage.getItem('user');
    // Vérifie si storedUser n'est pas null ou undefined
    if (storedUser) {
        try {
            // Convertit la chaîne JSON en objet JavaScript
            const parsedUser = JSON.parse(storedUser);
            this.user = new BehaviorSubject<User | null>(parsedUser);
        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'utilisateur stocké :', error);
            this.user = new BehaviorSubject<User | null>(null);
        }
    } else {
        this.user = new BehaviorSubject<User | null>(null);
    }
  }

  attemptLogin(loginInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginInfo).pipe(
      map(response => {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.user.next(response.user);
        this.chatService.connect(response.user);
      })
    );
  }

  attemptLogout(): Observable<any>  {
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

  get_conservations(): Observable<any> {
    if (!this.isAuthenticated()) return new Observable();
    // const options = {

    //   params: new HttpParams().set('user', this.getUser()!.id)
    // };
    return this.http.get<any>(`${this.apiUrl}/get-conversations?user=${this.getUser()!.id}`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user?id=${id}`);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../user';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private user: BehaviorSubject<User | null>;

  constructor(private http: HttpClient) {
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
}

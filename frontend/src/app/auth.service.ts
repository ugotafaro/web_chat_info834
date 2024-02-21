import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../user'; // Import the 'User' type from the appropriate module

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private user: BehaviorSubject<String | null>;
  private token: BehaviorSubject<String | null>;

  constructor(private http: HttpClient) {
    this.user = new BehaviorSubject<String | null>(localStorage.getItem('user'));
    this.token = new BehaviorSubject<String | null>(localStorage.getItem('token'));
  }

  attemptLogin(loginInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginInfo).pipe(
      map(response => {
        localStorage.setItem('user', response.user);
        this.user.next(response.user);
        localStorage.setItem('token', response.token);
        this.user.next(response.token);
      })
    );
  }

  attemptLogout(): Observable<any>  {
    const token = localStorage.getItem('token');

    console.log(token);

    if (!token) return new Observable();


    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token,
    });

    // We remove items from localStorage BEFORE waiting for the request
    // because it is better for user experience
    localStorage.removeItem('user');
    this.user.next(null);
    localStorage.removeItem('token');
    this.token.next(null);

    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers });
  }

  attemptSignup(signupInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, signupInfo).pipe(
      map(response => {
        localStorage.setItem('user', response.user);
        this.user.next(response.user);
        localStorage.setItem('token', response.token);
        this.token.next(response.token);
      })
    );
  }

  getUser(): Observable<String | null> {
    return this.user.asObservable();
  }

  getToken(): Observable<String | null> {
    return this.token.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.getToken().pipe( map(token => !!token) );
  }
}

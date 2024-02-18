import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private authTokenSubject: BehaviorSubject<string | null>;
  private userId: BehaviorSubject<string | null>;

  constructor(private http: HttpClient) {
    this.authTokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('authToken'));
    this.userId = new BehaviorSubject<string | null>(localStorage.getItem('userId'));
  }

  attemptLogin(loginInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginInfo).pipe(
      map(response => {
        const authToken = response.token;
        const userId = response.user;

        if (authToken) {
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('userId', userId);
          this.authTokenSubject.next(authToken);
          this.userId.next(userId);
        }
      })
    );
  }

  attemptLogout(): Observable<any>  {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) return new Observable();

    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `${authToken}`
    });

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.authTokenSubject.next(null);
    this.userId.next(null);

    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers });
  }

  attemptSignup(signupInfo: Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, signupInfo).pipe(
      map(response => {
        const authToken = response.token;
        const userId = response.user;

        if (authToken) {
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('userId', userId);
          this.authTokenSubject.next(authToken);
          this.userId.next(userId);
        }
      })
    );;
  }

  getAuthToken(): Observable<string | null> {
    return this.authTokenSubject;
  }

  getUserId(): Observable<string | null> {
    return this.userId.asObservable();
  }
}

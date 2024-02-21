import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Task } from '../task';
import { concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../user';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTask(id: string): Observable<Task> {
    return this.http.get<{ data: {} }>(`${this.apiUrl}/task/${id}`).pipe(
      map((res) => { return this.handleTask(res.data) }),
      catchError(this.handleError)
    );
  }

  getTasks(filter: any = {}): Observable<Task[]> {
    return this.http.post<{ data: {}[] }>(`${this.apiUrl}/tasks`, filter).pipe(
      map(
        (res) => { return res.data.map(this.handleTask) },
        catchError(this.handleError)
      ),
    );
  }

  getUserTasks(filter: any = {}): Observable<Task[]> {
    this.authService.getUser().subscribe((user: String | null) => {
      filter.user = user;
    });

    return this.getTasks(filter);
  }

  getUserCategories(filter: any = {}): Observable<string[]> {
    this.authService.getUser().subscribe((user: String | null) => {
      filter.user = user;
    });

    return this.getCategories(filter);
  }

  private getCategories(filter: any = {}): Observable<string[]> {
    return this.http.post<{ data: string[] }>(`${this.apiUrl}/categories`, filter).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  private addTask(task: any, filter: any) {
    filter.task = task;
    return this.http.post<any>(`${this.apiUrl}/add-task/`, filter).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  addUserTask(task: any, filter: any = {}): Observable<any> {
    this.authService.getUser().subscribe((user: String | null) => {
      filter.user = user;
    });

    return this.addTask(task, filter);
  }

  toggleStatusTask(id: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/toggle-task/${id}`, {}).pipe(
        map((res) => res),
        catchError(this.handleError)
    );
  }


  deleteCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete-category`, { category }).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  deleteTasks(taskIds: string[]): Observable<any> {
    // Créez un tableau d'observables pour chaque requête de suppression
    const deleteRequests: Observable<any>[] = taskIds.map(id =>
      this.http.post<any>(`${this.apiUrl}/delete-task`, { id }).pipe(
        map((res) => res.data),
        catchError(this.handleError)
      )
    );

    // Utilisez reduce pour concaténer les observables séquentiellement
    return deleteRequests.reduce((acc, current) => acc.pipe(concatMap(() => current)), of(null));
  }

  private handleTask(data: any): Task {
    return new Task(data._id, data.title, data.content, data.done);
  }

  private handleError(error: HttpErrorResponse) {
    let error_message: string | undefined;
    switch(error.status) {
      case 0: {
        error_message = 'Une erreur client ou réseau s\'est produite (pensez à lancer le script backend)';
        break;
      }
      default: {
        error_message = `Le backend à renvoyer le code ${error.status} "${error.message}"`;
      }
    }
    return throwError(error_message);
  }
}

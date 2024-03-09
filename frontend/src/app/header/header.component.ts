import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isAuth: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  }

  logout() {
    this.authService.attemptLogout$().subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => console.error(error),
    });
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  })
  isSubmitted: boolean = false;
  customErrorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { };

  attemptLogin(): void {
    this.isSubmitted = true;
    this.customErrorMessage = '';
    if(!this.loginForm.valid) return;

    this.authService.attemptLogin(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.customErrorMessage = "Identifiant ou mot de passe incorrect",
    });
  }

  isValid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control?.invalid && this.isSubmitted;
  }
}

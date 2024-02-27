import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('passwordConfirm');

    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  };
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})

export class SignUpComponent {
  signupForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]*$/)]],
    passwordConfirm: ['', Validators.required],
    firstname: ['', [Validators.minLength(4), Validators.pattern(/^[\p{L}-]+$/u)]],
    lastname: ['', [Validators.minLength(4), Validators.pattern(/^[\p{L}-]+$/u)]],
  }, { validators: passwordMatchValidator() })
  isSubmitted: boolean = false;
  customErrorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) { };

  attemptSignup(): void {
    this.isSubmitted = true;
    this.customErrorMessage = '';
    if(this.signupForm.invalid) return;

    this.authService.attemptSignup(this.signupForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => {
        switch(error.status) {
          case 409: this.customErrorMessage = "Ce compte existe déjà"; break;
          case 401: this.customErrorMessage = "Le nom d'utilisateur et le mot de passe sont nécessaires"; break;
        }
      },
    });
  }
}

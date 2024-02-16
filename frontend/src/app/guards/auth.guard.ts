import { Injectable, booleanAttribute } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.auth.getAuthToken();
    if(!token) this.router.navigate(['/']);
    if (token) {
      return true;
    } else {
      this.router.navigate(['/'])
      return false;
    }
  }
}
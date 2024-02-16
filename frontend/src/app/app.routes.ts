import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CategoriesToolbarComponent } from './categories-toolbar/categories-toolbar.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
    { path: '', component: CategoriesToolbarComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent },
    { path: '**', component: PageNotFoundComponent },
];

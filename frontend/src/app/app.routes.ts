import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CategoriesToolbarComponent } from './categories-toolbar/categories-toolbar.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
    { path: '', component: ChatComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent },
    { path: '**', component: PageNotFoundComponent },
];

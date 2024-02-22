import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CategoriesToolbarComponent } from './categories-toolbar/categories-toolbar.component';
import { ChatService } from './chat.service';
import { WebsocketService } from './socket.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withFetch()), provideClientHydration(), CategoriesToolbarComponent, ChatService, WebsocketService]
};

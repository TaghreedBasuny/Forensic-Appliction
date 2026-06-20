import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';
import { register } from 'swiper/element/bundle';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

register();

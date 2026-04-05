import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  person,
  personOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  cardOutline,
  schoolOutline,
  callOutline,
  peopleOutline,
  locationOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Register icons
addIcons({
  person,
  'card-outline': cardOutline,
  'school-outline': schoolOutline,
  'call-outline': callOutline,
  'people-outline': peopleOutline,
  'location-outline': locationOutline,
  'checkmark-circle-outline': checkmarkCircleOutline
});

addIcons({
  'person-outline': personOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'card-outline': cardOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient()
  ]
});
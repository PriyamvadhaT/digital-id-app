import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  constructor() {

    // 🌐 When internet returns
    window.addEventListener('online', () => {
      console.log('🌐 Online - syncing app');

      // trigger global refresh
      window.dispatchEvent(new Event('dataUpdated'));
    });

    // 📡 When offline
    window.addEventListener('offline', () => {
      console.log('📴 Offline mode active');
    });

  }

}g

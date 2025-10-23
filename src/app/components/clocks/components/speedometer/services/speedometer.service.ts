import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpeedometerService {
  public isSoundOn = signal(false);
}

import { CommonModule } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'blinker',
  imports: [CommonModule],
  templateUrl: './blink.component.html',
  styleUrl: './blink.component.scss',
})
export class BlinkComponent {
  public valueRef = input();

  public isBlinking = signal(true);

  constructor() {
    effect(() => {
      this.valueRef();
      this.triggerBlink();
    });
  }

  private triggerBlink() {
    this.isBlinking.set(false);
    setTimeout(this.isBlinking.set, 100, true);
  }
}

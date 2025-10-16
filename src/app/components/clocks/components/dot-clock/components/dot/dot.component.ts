import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'dot',
  imports: [],
  templateUrl: './dot.component.html',
  styleUrl: './dot.component.scss',
})
export class DotComponent {
  public flipRate = signal(0.3 + Math.random() * 0.7);
  public config = input(undefined, {
    transform: (v: number) => (!!v ? 'white' : 'black'),
  });
}

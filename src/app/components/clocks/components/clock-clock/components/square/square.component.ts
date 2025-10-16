import { Component, computed, input } from '@angular/core';
import { digitsMap } from '../../config/digits.config';

@Component({
  selector: 'square',
  imports: [],
  templateUrl: './square.component.html',
  styleUrl: './square.component.scss',
})
export class SquareComponent {
  public config = input<string>(' ');
  public angles = computed(() => digitsMap[this.config()]);
}

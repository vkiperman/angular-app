import { Component, computed, input } from '@angular/core';
import { digitsConfig } from '../../config/digits.config';
import { SquareComponent } from '../square/square.component';

@Component({
  selector: 'digit',
  imports: [SquareComponent],
  templateUrl: './digit.component.html',
  styleUrl: './digit.component.scss',
})
export class DigitComponent {
  public value = input(0);
  public squares = computed(() => digitsConfig[this.value()]);
}

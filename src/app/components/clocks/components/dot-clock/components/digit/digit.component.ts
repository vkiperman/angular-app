import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { digitsConfig } from '../../config/digits.config';
import { DotComponent } from '../dot/dot.component';

@Component({
  selector: 'digit',
  imports: [DotComponent, CommonModule],
  templateUrl: './digit.component.html',
  styleUrl: './digit.component.scss',
})
export class DigitComponent {
  public value = input(0);
  public dots = computed(() => digitsConfig[this.value()]);
}

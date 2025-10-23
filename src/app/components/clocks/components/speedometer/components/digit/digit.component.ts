import {
  Component,
  computed,
  input,
  numberAttribute,
  signal,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'digit',
  imports: [],
  templateUrl: './digit.component.html',
  styleUrl: './digit.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DigitComponent {
  public hasTransition = signal(true);
  public max = input(10);
  public value = input(0, {
    transform: (v) => {
      const n = numberAttribute(v, 0) || this.max();
      this.fx = n === this.max();

      return n;
    },
  });
  public rate = input('0.4s');
  private resetRate = computed(() => {
    const match = this.rate().match(/^(\d+(?:\.\d+)?)(ms|s)$/);
    const [, raw, mult] = match || [];
    return +raw * (mult === 'ms' ? 1 : 1000);
  });

  private fx = false;

  public computedValue = computed(() => {
    const n = this.value();

    if (this.hasTransition()) return n;

    if (!this.fx) setTimeout(() => this.hasTransition.set(true));
    return 0;
  });

  public numbers = computed(() =>
    [...Array(this.max())].map((_, i) => i).concat(0),
  );

  public transitionEndHandler(e: TransitionEvent) {
    this.value() === this.max()
      ? setTimeout(() => this.hasTransition.set(false), this.resetRate())
      : this.hasTransition.set(true);
  }
}

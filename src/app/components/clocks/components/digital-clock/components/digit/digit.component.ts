import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'digit',
  imports: [CommonModule],
  templateUrl: './digit.component.html',
  styleUrl: './digit.component.scss',
})
export class DigitComponent {
  public count = 0;
  public value = input(0);
  public panels = computed(() =>
    [
      [],
      [2, 3, 5, 6, 7, 8, 9, 0],
      [],
      [4, 5, 6, 8, 9, 0],
      [],
      [1, 2, 3, 4, 7, 8, 9, 0],
      [],
      [2, 3, 4, 5, 6, 8, 9],
      [],
      [2, 6, 8, 0],
      [],
      [1, 3, 4, 5, 6, 7, 8, 9, 0],
      [],
      [2, 3, 5, 6, 8, 9, 0],
      [],
    ]
      .map((p) => (p.includes(this.value()) ? 'on' : 'off'))
      .reduce(
        (acc, cur, i) =>
          i % 3 < 1 ? [...acc, [cur]] : (acc.at(-1)?.push(cur), acc),
        [] as string[][],
      ),
  );

  public panelCoords = [
    ['corner', 'top', 'corner'],
    ['left', 'corner', 'right'],
    ['corner', 'middle', 'corner'],
    ['left', 'corner', 'right'],
    ['corner', 'bottom', 'corner'],
  ];

  // public panelsx = computed(() =>
  //   [
  //     [[], [2, 3, 5, 6, 7, 8, 9, 0], []],
  //     [[4, 5, 6, 8, 9, 0], [], [1, 2, 3, 4, 7, 8, 9, 0]],
  //     [[], [2, 3, 4, 5, 6, 8, 9], []],
  //     [[2, 6, 8, 0], [], [1, 3, 4, 5, 6, 7, 8, 9, 0]],
  //     [[], [2, 3, 5, 6, 8, 9, 0], []],
  //   ].map((p) => p.map((n) => (n.includes(this.value()) ? 'on' : 'off'))),
  // );
}

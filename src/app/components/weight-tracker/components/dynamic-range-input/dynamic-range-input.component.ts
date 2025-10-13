import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  numberAttribute,
  OnInit,
} from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'dynamic-range-input',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dynamic-range-input.component.html',
  styleUrl: './dynamic-range-input.component.scss',
})
export class DynamicRangeInputComponent implements OnInit {
  private controlContainer = inject(ControlContainer);
  public max = input();
  public min = input(0, { transform: numberAttribute });
  public label = input('');
  public rangevalues: number[] = [];

  public formGroup!: FormGroup;

  public ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;

    this.rangevalues = [...Array(this.max())]
      .map((_, i) => i)
      .slice(this.min())
      .filter((v) => v % 5 === 0);
  }
}

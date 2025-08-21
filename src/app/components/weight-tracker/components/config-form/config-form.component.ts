import { Component, inject, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { WeightTrackerConfigStore } from '../../store/weight-tracker-config.store';

@Component({
  selector: 'config-form',
  imports: [ReactiveFormsModule],
  templateUrl: './config-form.component.html',
  styleUrl: './config-form.component.scss',
})
export class ConfigFormComponent implements OnInit {
  private store = inject(WeightTrackerConfigStore);
  public saved = output();

  public unitsMeta = [
    { label: 'Pounds', value: 0 },
    { label: 'KG', value: 1 },
  ];

  public form = new FormGroup({
    units: new FormControl(0),
  });

  public ngOnInit(): void {
    this.store
      .getState()
      .pipe(take(1))
      .subscribe((state) => this.form.setValue(state));
  }

  saveConfig() {
    this.form.get('units')?.setValue(+this.form.get('units')?.value!);
    this.store.setState(this.form.getRawValue());
    this.saved.emit();
  }
}

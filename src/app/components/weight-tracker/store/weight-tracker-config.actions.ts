import { createActionGroup, props } from '@ngrx/store';
import { WeightTrackerConfigState } from './weight-tracker-config.reducer';

export const weightTrackerConfigActions = createActionGroup({
  source: 'Weight Tracker Config',
  events: {
    'Set Units': props<{ units: number }>(),
    'Update State': props<WeightTrackerConfigState>(),
  },
});

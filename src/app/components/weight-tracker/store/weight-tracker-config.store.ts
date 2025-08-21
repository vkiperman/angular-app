import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { weightTrackerConfigActions } from './weight-tracker-config.actions';
import { WeightTrackerConfigState } from './weight-tracker-config.reducer';

@Injectable({
  providedIn: 'root',
})
export class WeightTrackerConfigStore {
  private store = inject(Store);

  public setState(state: WeightTrackerConfigState) {
    this.store.dispatch(weightTrackerConfigActions.updateState(state));
  }

  public getState() {
    return this.store.select(({ weightTrackerConfig }) => weightTrackerConfig);
  }
}

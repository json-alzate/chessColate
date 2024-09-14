import { Injectable } from '@angular/core';

import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Observable, of, combineLatest } from 'rxjs';

import { CustomPlansState } from '@redux/states/custom-plans.state';

import { getCountAllCustomPlans } from '@redux/selectors/custom-plans.selectors';
import { getProfile } from '@redux/selectors/auth.selectors';

import { CustomPlansService } from '@services/custom-plans.service';


@Injectable({
  providedIn: 'root'
})
export class CustomPlansGuard {

  constructor(
    private customPlansService: CustomPlansService,
    private store: Store<CustomPlansState>
  ) { }


  canActivate(): Observable<boolean> {
    // Permitir la activación sin bloquear
    this.checkCustomPlansState();
    return of(true);
  }


  private checkCustomPlansState() {

    const countCustomPlansStates$ = this.store.pipe(
      select(getCountAllCustomPlans),
      take(1)
    );

    const profile$ = this.store.pipe(
      select(getProfile)
    );

    combineLatest([countCustomPlansStates$, profile$]).subscribe(data => {

      if (data[0] === 0 && data[1]) {
        this.customPlansService.requestGetCustomPlansAction(data[1].uid);
      }

    });

    return of(true);
  }


}

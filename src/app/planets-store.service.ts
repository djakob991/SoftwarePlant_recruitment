/**
 * Service that is responsible for updating, containing and distributing the 
 * current state. Current state can be obtained by subscribing to state$ subject.
 */


import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { PlanetsService } from './planets.service';
import { State } from './State';



@Injectable({
  providedIn: 'root'
})
export class PlanetsStoreService {
  
  private initialState = new State(this.planetsService);

  // Here new states will be emitted
  private state$ = new BehaviorSubject<State>(this.initialState);
  
  // Here requests for updating the state will be emitted.
  // Such request consists only of the observable of a new state.
  private updateListener$ = new Subject<Observable<State>>();


  /**
   * Constructor performs a search of an empty string - it is the default
   * selection. When search completes, the obtained state is distributed and
   * updating the state becomes available.
   */
  constructor(private planetsService: PlanetsService) {
    this.initialState.searchAction('').subscribe(state => {
      this.state$.next(state);
      this.initUpdateListenerSubscription();
    }); 
  }


  /**
   * Returns a read-only version of state$ subject - simply an observable.
   */
  getState() {
    return this.state$.asObservable();
  }


  /**
   * Subscribes to updateListener$, so that updating the state becomes available. 
   * When the 'update' method is called, observable of a new state is emitted in
   * updateListener$. Then, it is subscribed (by switchMap), and finally the actual
   * new state is obtained and distributed.
   * Thank to switchMap, there is only 1 active new state subscription at a time.
   */
  private initUpdateListenerSubscription() {
    this.updateListener$.pipe(
      switchMap(newState$ => newState$)
    )
    .subscribe(newState => {
      this.state$.next(newState);
    });
  }


  update(newState$: Observable<State>) {
    this.updateListener$.next(newState$);
  }
  
}

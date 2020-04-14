/**
 * This service takes care of managing the state. Components can get current
 * state by subscribing to 'state$' subject. Requests of changing the state
 * are made by calling service methods.
 */


import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, of, Observable, forkJoin, empty } from 'rxjs';
import { switchMap, map, tap, mergeMap, catchError } from 'rxjs/operators';

import { PlanetsService } from './planets.service';
import { PlanetsPortion } from './models/PlanetsPortion';
import { State } from './State';


/**
 * Contains the types of state-changing actions.
 */
enum Action {
  SEARCH = 'New search term',
  NEW_PAGE = 'View another page',
  CHANGE_PAGE_SIZE = 'Change page size'
}


/**
 * Describes an event - a request of state change. Consists of an action,
 * paylod (for example the term to be searched), and the current state.
 */
interface Event {
  action: Action;
  payload: any;
  state: State;
}


@Injectable({
  providedIn: 'root'
})
export class PlanetsStoreService {
  initialState = new State(25, null, null, null, false, true);
  
  // here will be emited the updated state
  private state$ = new BehaviorSubject<State>(this.initialState);
  
  // here events will be emited
  private eventListener$ = new Subject<Event>();


  /**
   * Constructor performs a search of an empty string - it is the default
   * selection. The input state is the initial state. When search completes,
   * the state is emitted, and requesting for state changing is made available
   * by initEventListenerSubscription().
   */
  constructor(private planetsService: PlanetsService) {
    this.__search(this.initialState.copyOf(), '').subscribe(state => {
     
      this.state$.next(state);
      this.initEventListenerSubscription();
    }); 
  }


  /**
   * Returns a read-only version of state$ subject - simply an observable.
   */
  getState() {
    return this.state$.asObservable();
  }


  /**
   * Returns an observable of a state with error field set to true.
   */
  errorStateObservable() {
    let errState = this.initialState.copyOf();
    errState.error = true;
    return of(errState);
  }


  /**
   * Subscribes to eventListener$, which makes requests for state change
   * available. When one of 'search', 'newPage', 'changePageSize' methods is
   * called, an event is emitted here. Depending on the action type, a suitable
   * method is called and an observable of updated state is returned. Thank to
   * switchMap, request is cancelled if a new one is emitted before the older
   * one completes. If the request completes, the obtained new state is emitted
   * in state$.
   */
  private initEventListenerSubscription() {
    this.eventListener$.pipe(
      
      switchMap(event => {
        let state: State = event.state.copyOf();
        
        switch(event.action) {
          
          case Action.SEARCH: {
            return this.__search(state, event.payload);
          }

          case Action.NEW_PAGE: {
            return this.__newPage(state, event.payload);
          }

          case Action.CHANGE_PAGE_SIZE: {
            return this.__changePageSize(state, event.payload);
          }
        }    
      }),
      
      tap(state => {
        this.state$.next(state);
      })
    )
    .subscribe();
  }


  /**
   * Returns an observable of a state that is an effect of searching a new term.
   */
  private __search(state: State, searchTerm: string) {
    state.error = false;
    state.initial = false;
    
    return this.planetsService.getPlanetsPortion(1, searchTerm).pipe(
      mergeMap(portion => {
        state.searchTerm = searchTerm;
        state.page = 1;
        state.count = portion.count;
        state.resetMemoizedPortions();
        
        if (state.count > 0) {
          state.memoizedPortions[1] = portion.results;
        }

        return this.makeNewStateObservable(state);
      }),

      catchError(err => {
        console.log('An error occured:');
        console.log(err);
        return this.errorStateObservable();
      })
    );
  }


  /**
   * Returns an observable of a state that is an effect of changing the page.
   */
  private __newPage(state: State, page: number) {
    if (state.error || state.initial) {
      return this.errorStateObservable();
    }
    
    if (page > state.pagesCount()) {
      page = 1;
    }
    state.page = page;

    return this.makeNewStateObservable(state);
  }


  /**
   * Returns an observable of a state that is an effect of changing the page size.
   */
  private __changePageSize(state: State, pageSize: number) {
    if (state.error || state.initial) {
      return this.errorStateObservable();
    }
    
    state.pageSize = pageSize;
    state.page = 1;

    return this.makeNewStateObservable(state);
  }


  /**
   * Takes as an argument a state which can have the memoizedPortions table
   * incomplete. Returns an observable of that state with updated memoizedPortions,
   * so that a list of planets to display can be made.
   */
  private makeNewStateObservable(baseState: State) {
    if (baseState.count == 0) return of(baseState);
    
    let portionIndexes: number[] = [];
    let portionObservables: Observable<PlanetsPortion>[] = [];

    let begPortionIndex = baseState.begPortionIndex();
    let endPortionIndex = baseState.endPortionIndex();
    
    // Have to make requests only for those portions that are not in memoizedPortions
    for (let i = begPortionIndex; i <= endPortionIndex; i++) {
      if (baseState.memoizedPortions[i] == undefined) {
        portionIndexes.push(i);
        
        portionObservables.push(
          this.planetsService.getPlanetsPortion(
            i, baseState.searchTerm
          )
        );
      }
    }

    // If all necessary portions are present, just return observable of the given state.
    if (portionIndexes.length == 0) {
      return of(baseState);
    }

    return forkJoin(portionObservables).pipe(
      map(portions => {  
        let i = 0;
        
        for (let portion of portions) {
          let index = portionIndexes[i];
          baseState.memoizedPortions[index] = portion.results;
          i++;
        }

        return baseState;
      }),

      catchError(err => {
        console.log('An error occured:');
        console.log(err);
        return this.errorStateObservable();
      }) 
    ); 
  }


  search(searchTerm: string, state: State) {
    let event: Event = {action: Action.SEARCH, payload: searchTerm, state: state};
    this.eventListener$.next(event);
  }

  newPage(page: number, state: State) {
    let event: Event = {action: Action.NEW_PAGE, payload: page, state: state};
    this.eventListener$.next(event);
  }

  changePageSize(pageSize: number, state: State) {
    let event: Event = {action: Action.CHANGE_PAGE_SIZE, payload: pageSize, state: state};
    this.eventListener$.next(event);
  }
}

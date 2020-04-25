/**
 * Class 'State' represents the state of current selection. It provides action
 * methods, that return observables of new states.
 */


import { Planet } from './models/Planet';
import { PlanetsService } from './planets.service';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { of, Observable, forkJoin } from 'rxjs';
import { PlanetsPortion } from './models/PlanetsPortion';



export class State {
  
  private _pageSize: number = 25;
  private _searchTerm: string = null;
  private _page: number = null;
  private _displayList: Planet[] = null;

  // Total number of planets that match _searchTerm
  private _count: number = null;
  
  // _error is true if an error occured while creating a new state
  private _error: boolean = false;
  
  // _initial is true at the beginning, before any actions were performed
  private _initial: boolean = true;
  

  get pageSize() {
    return this._pageSize;
  }

  get searchTerm() {
    return this._searchTerm;
  }

  get page() {
    return this._page;
  }

  get count() {
    return this._count;
  }

  get error() {
    return this._error;
  }

  get initial() {
    return this._initial;
  }

  get displayList() {
    return this._displayList;
  }
  

  constructor(private planetsService: PlanetsService) {}


  copyOf() {
    let state = new State(this.planetsService);
    
    state._pageSize = this._pageSize;
    state._searchTerm = this._searchTerm;
    state._page = this._page;
    state._count = this._count;
    state._error = this._error;
    state._initial = this._initial;
    state._displayList = this._displayList;

    return state;
  }


  private errorState() {
    let state = new State(this.planetsService);
    state._error = true;
    state._initial = false;

    return state;
  }


  /**
   * Returns number of client-side pages the results are divided into.
   */
  pagesCount() {
    return Math.ceil(this._count / this._pageSize);
  }


  /**
   * Returns number of server-side portions the results are divided into.
   */
  portionsCount() {
    return Math.ceil(this._count / 10);
  }


  /**
   * Index of the first planet to be displayed (counting from 0).
   */
  begIndex() {
    if (this._count == 0) throw 'state.count must be > 0';
    return this._pageSize * (this._page - 1);
  }


  /**
   * Index of the last planet to be displayed +1 (counting from 0).
   */
  endIndex() {
    if (this._count == 0) throw 'state.count must be > 0';
    return Math.min(this._pageSize * this._page, this._count);
  }


  /**
   * Index (counting from 1 - such as server-side pages) of the planets 
   * portion, in which the interval of planets to be displayed begins.
   */
  begPortionIndex() {
    if (this._count == 0) throw 'state.count must be > 0';
    return Math.floor(this.begIndex() / 10) + 1;
  }


  /**
   * Index (counting from 1 - such as server-side pages) of the planets 
   * portion, in which the interval of planets to be displayed ends.
   */
  endPortionIndex() {
    if (this._count == 0) throw 'state.count must be > 0';
    return Math.floor((this.endIndex() - 1) / 10) + 1;
  }


  /**
   * Returns an observable of a new state, which is the result of searching for
   * a new term.
   */
  searchAction(searchTerm: string) {
    let newState = this.copyOf();
    
    newState._error = false;
    newState._initial = false;
    newState._searchTerm = searchTerm;
    newState._page = 1;

    return this.planetsService.getPlanetsPortion(1, searchTerm).pipe(
      
      mergeMap(portion => {
        newState._count = portion.count;
        return newState.makeCompleteNewStateObservable();
      }),

      catchError(err => {
        return of(this.errorState());
      })
    );
  }


  /**
   * Returns an observable of a new state, which is the result of changing the
   * page.
   */
  newPageAction(page: number) {
    if (this.error || this.initial) {
      return of(this.errorState());
    }
    
    let newState = this.copyOf();
    
    if (page > this.pagesCount()) {
      page = 1;
    }
    newState._page = page;

    return newState.makeCompleteNewStateObservable();
  }


  /**
   * Returns an observable of a new state, which is the result of changing page
   * size.
   */
  changePageSizeAction(pageSize: number) {
    if (this.error || this.initial) {
      return of(this.errorState());
    }
    
    let newState = this.copyOf();
    
    newState._pageSize = pageSize;
    newState._page = 1;

    return newState.makeCompleteNewStateObservable();
  }


  /**
   * Private method that returns an observable of 'this' object. Object, when
   * emitted, will have appropriate _displayList set.
   */
  private makeCompleteNewStateObservable() {
    this._displayList = [];

    if (this._count == 0) return of(this);

    let portionObservables: Observable<PlanetsPortion>[] = [];
    let begPortionIndex = this.begPortionIndex();
    let endPortionIndex = this.endPortionIndex();

    for (let i = begPortionIndex; i <= endPortionIndex; i++) {
      portionObservables.push(
        this.planetsService.getPlanetsPortion(i, this._searchTerm)
      );
    }

    return forkJoin(portionObservables).pipe(
      map(portions => {
        for (let portion of portions) {
          this._displayList = this._displayList.concat(portion.results);
        }

        let shift = 10 * (this.begPortionIndex() - 1);
        
        this._displayList = this._displayList.slice(
          this.begIndex() - shift, this.endIndex() - shift
        );

        return this;
      }),

      catchError(err => {
        return of(this.errorState());
      })
    );
  
  }


}
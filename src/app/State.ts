/**
 * Class 'State' represents the state of current selection. The state
 * consists of:
 * > pageSize: max number of planets on page
 * > searchTerm: term that was searched
 * > page: number of page to be displayed
 * > count: total number of planets that match the searched term
 * > memoizedPortions: Here are stored planet portions that are known at the
 * moment - memoizedPortions[i] is definded if the i-th portion has been retrieved
 * from the server; memoizedPortions is cleared, when new term is searched - it
 * lives and is expanded as long as user is viewing results for one term.
 * When new term is searched, the process starts from the beginning.
 * 
 * 
 * There are also two boolean fields. If they are set to true, the state
 * is not valid. Components use these fields to verify it.
 * > error: true if an error occured while retrieving data from the
 * server.
 * > initial: true if the state is initial - such state has to be transformed
 * into a valid state by performing a 'search' action in PlanetsStoreService - 
 * it is a base.
 * 
 * Other properties of a state depend on these fields, so they can be calculated
 * using methods. For example, a list of planet to be displayed is returned
 * by planetList().
 */


import { Planet } from './models/Planet';

export class State {
  
  memoizedPortions: Planet[][];

  constructor(
    public pageSize: number,
    public searchTerm: string,
    public page: number,
    public count: number,
    public error: boolean,
    public initial: boolean
  ) {
    this.resetMemoizedPortions();
  }
  
  pagesCount() {
    return Math.ceil(this.count / this.pageSize);
  }

  portionsCount() {
    return Math.ceil(this.count / 10);
  }

  /**
   * Index of the first planet to be displayed (counting from 0).
   */
  begIndex() {
    if (this.count == 0) throw 'state.count must be > 0';
    return this.pageSize * (this.page - 1);
  }


  /**
   * Index of the last planet to be displayed +1 (counting from 0).
   */
  endIndex() {
    if (this.count == 0) throw 'state.count must be > 0';
    return Math.min(this.pageSize * this.page, this.count);
  }


  /**
   * Index (counting from 1 - such as pages on the server) of the planets 
   * portion, in which the interval of planets to be displayed begins.
   */
  begPortionIndex() {
    if (this.count == 0) throw 'state.count must be > 0';
    return Math.floor(this.begIndex() / 10) + 1;
  }


  /**
   * Index (counting from 1 - such as pages on the server) of the planets 
   * portion, in which the interval of planets to be displayed ends.
   */
  endPortionIndex() {
    if (this.count == 0) throw 'state.count must be > 0';
    return Math.floor((this.endIndex() - 1) / 10) + 1;
  }


  /**
   * Returns a list of planets to be displayed on screen.
   */
  planetList() {
    let planetList: Planet[] = [];
    if (this.count == 0) return planetList;

    for (let i = this.begPortionIndex(); i <= this.endPortionIndex(); i++) {
      if (this.memoizedPortions[i] === undefined) {
        throw `The state is not valid - memoizedPortions is incomplete 
               and list for state.page can't be made`;
      }
      
      planetList = planetList.concat(this.memoizedPortions[i]);
    }

    let shift = 10 * (this.begPortionIndex() - 1);
    return planetList.slice(this.begIndex() - shift, this.endIndex() - shift);
  }


  /**
   * Clears the memoized portions.
   */
  resetMemoizedPortions() {
    this.memoizedPortions = new Array<Planet[]>(this.portionsCount() + 1);
  }


  /**
   * Returns a copy of the object (the array of portions is also copied).
   */
  copyOf() {
    let newState = new State(
      this.pageSize,
      this.searchTerm,
      this.page,
      this.count,
      this.error,
      this.initial
    );

    newState.memoizedPortions = [...this.memoizedPortions];
    return newState;
  }
}
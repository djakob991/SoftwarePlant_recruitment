/**
 * Service that takes care of making http requests.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanetsPortion } from './models/PlanetsPortion';
import { Observable, empty } from 'rxjs';
import { Planet } from './models/Planet';
import { shareReplay, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PlanetsService {

  baseUrl = 'http://0.0.0.0:8080/api/planets/';

  /**
   * Here will be stored the observables of single planets.
   */
  planetsCache = {};

  constructor(private http: HttpClient) { }


  /**
   * Returns the observable of a particular server-side page of planets.
   * Such page contains max 10 planets, and I call it a 'portion'. It is not
   * cached - PlanetsStoreService takes care of memoizing once retrieved
   * portions.
   */
  getPlanetsPortion(page: number, search: string): Observable<PlanetsPortion> {
    let url = this.baseUrl + '?page=' + page + '&search=' + search;
    return this.http.get<PlanetsPortion>(url);
  }


  /**
   * Returns the observable of a particular planet. This time, it is cached
   * here - once created observable is stored in 'planetsCache'. Next time
   * when a call is made with the same id, an observable will be taken from
   * there. Thank to shareReplay, the value from the observable can be retrieved
   * many times.
   */
  getPlanet(id: string) {
    let url = this.baseUrl + id;
    
    if (this.planetsCache[id]) {
      return this.planetsCache[id];
    }
    
    this.planetsCache[id] = this.http.get<Planet>(url).pipe(
      shareReplay(1),
      catchError(err => {
        delete this.planetsCache[id];
        throw 'Request failed';
      })
    );

    return this.planetsCache[id];
  }
}



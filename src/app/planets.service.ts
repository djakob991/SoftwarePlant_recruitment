/**
 * Service that is responsible for making http requests and caching.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanetsPortion } from './models/PlanetsPortion';
import { Observable, empty } from 'rxjs';
import { Planet } from './models/Planet';
import { shareReplay, catchError, last } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PlanetsService {

  baseUrl = 'http://0.0.0.0:8080/api/planets/';

  lastSearched: string = '';

  //The observables of server-size portions of the planets will be stored here.
  planetsPortionsCache: { [page: number]: Observable<PlanetsPortion> } = {};

  //The observables of single planets will be stored here.
  planetsCache: { [id: string]: Observable<Planet> } = {};


  constructor(private http: HttpClient) { }


  /**
   * Returns an observable of a particular server-size page of planets. Doesn't
   * make a request, if the portion is already in cache.
   * Cache is cleared every time when a new term is searched.
   */
  getPlanetsPortion(page: number, search: string): Observable<PlanetsPortion> {
    if (search != this.lastSearched) {
      this.planetsPortionsCache = {};
      this.lastSearched = search;
    }

    let url = this.baseUrl + '?page=' + page + '&search=' + search;
    
    if (this.planetsPortionsCache[page]) {
      return this.planetsPortionsCache[page];
    }

    this.planetsPortionsCache[page] = this.http.get<PlanetsPortion>(url).pipe(
      shareReplay(1),
      catchError(err => {
        delete this.planetsPortionsCache[page];
        throw 'Request failed';
      })
    );

    return this.planetsPortionsCache[page];
  }


  /**
   * Returns an observable of a particular planet (also cached).
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



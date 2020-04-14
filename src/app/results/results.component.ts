/**
 * Component that lets user to search for planets, and displays an adequate list.
 */


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Planet } from '../models/Planet';
import { PlanetsStoreService } from '../planets-store.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { State } from '../State';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  componentState: string = 'initialLoading';
  state: State;
  planetList: Planet[];
  pagesCount: number;
  pagesInterval: number[];
  title: string;


  constructor(
    private planetsStoreService: PlanetsStoreService, 
    private router: Router
  ) { }


  ngOnInit(): void {
    this.subscription = this.planetsStoreService.getState().subscribe(state => {
      this.state = state;

      if (state.error) {
        this.componentState = 'error';
        return;
      }

      if (state.initial) {
        return;
      }

      this.componentState = 'ready';
      this.planetList = state.planetList();
      this.pagesCount = state.pagesCount();
      
      this.updateTitle();
      this.updatePagesInterval();
    });
  }


  /**
   * Sets the title, depending on state.
   */
  updateTitle() {
    if (this.state.searchTerm === '') {
      this.title = 'All results'
    
    } else if (this.state.count > 0) {
      this.title = 'Results for: ' + this.state.searchTerm;
    
    } else {
      this.title = 'No results for: ' + this.state.searchTerm;
    }
  }


  /**
   * Calculates the interval of pages to be accesible.
   */
  updatePagesInterval() {
    let pagesIntervalBeg = Math.max(this.state.page - 3, 1);
    let pagesIntervalEnd = Math.min(this.state.page + 3, this.pagesCount);
    let pagesIntervalSize = pagesIntervalEnd - pagesIntervalBeg + 1;

    this.pagesInterval = new Array(pagesIntervalSize);

    for (let i = 0; i < this.pagesInterval.length; i++) {
      this.pagesInterval[i] = i + pagesIntervalBeg;
    }
  }


  /** 
   * Initiates a search - calls a suitable method of planetsStoreService.
   */
  search(searchField: HTMLInputElement) {
    let value = searchField.value;
    searchField.value = '';
    this.planetsStoreService.search(value, this.state);
  }


  /**
   * Initiates a page change.
   */
  newPage(page: number) {
    this.planetsStoreService.newPage(page, this.state);
  }


  /**
   * Retrieves the planet's id from it's 'url' field.
   * Naviagates to details page.
   */
  goToDetailsPage(planet: Planet) {
    let cut = planet.url.substring(0, planet.url.length - 1);
    let index = cut.lastIndexOf("/");
    let id = cut.substring(index + 1);
    
    this.router.navigate(['detail/', id]);
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

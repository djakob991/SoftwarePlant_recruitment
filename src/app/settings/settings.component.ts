/**
 * Component that allows to change the settings. At this moment there is only 
 * one setting: page size.
 */


import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PlanetsStoreService } from '../planets-store.service';
import { Subscription } from 'rxjs';
import { State } from '../State';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  subsription: Subscription;
  state: State;
  availablePageSizes = [5, 10, 25, 100];

  @ViewChild('pageSizeSelect')
  pageSizeSelect: ElementRef;

  constructor(private planetsStoreService: PlanetsStoreService) { }


  /**
   * Gets the current state. It is neccessary to display current page size
   * in the select element.
   */
  ngOnInit(): void {
    this.subsription = this.planetsStoreService.getState().subscribe(state => {
      this.state = state;
    });
  }


  /**
   * Saves the changes.
   */
  save() {
    let newPageSize = this.pageSizeSelect.nativeElement.value;
    if (newPageSize != this.state.pageSize) {
      this.changePageSize(newPageSize);
    }
  }


  /**
   * Initiates the page size change - calls an adequate method of planetsStoreService.
   */
  changePageSize(pageSize: number) {
    this.planetsStoreService.changePageSize(pageSize, this.state);
  }


  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

}

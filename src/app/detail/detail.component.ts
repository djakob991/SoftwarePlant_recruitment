/**
 * Component to display details of a particular planet.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PlanetsService } from '../planets.service';
import { Planet } from '../models/Planet';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  componentState = 'loading';
  planet: Planet;

  constructor(
    private route: ActivatedRoute, 
    private planetsService: PlanetsService
  ) { }


  ngOnInit(): void {
    this.route.paramMap.pipe(
      
      switchMap((params: ParamMap) => {
        let id = params.get('id');
        return this.planetsService.getPlanet(id);
      })
    
    ).subscribe(
      (planet: Planet) => {
        this.planet = planet;
        this.componentState = 'ready';
      },

      err => {
        this.componentState = 'error';
      }
    );
  }

}

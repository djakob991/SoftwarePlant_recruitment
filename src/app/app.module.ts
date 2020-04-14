import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule }    from '@angular/common/http';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlanetsService } from './planets.service';
import { PlanetsStoreService } from './planets-store.service';
import { PlanetCardComponent } from './planet-card/planet-card.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    PlanetCardComponent,
    routingComponents,
    SettingsComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [PlanetsService, PlanetsStoreService],
  bootstrap: [AppComponent]
})
export class AppModule { }

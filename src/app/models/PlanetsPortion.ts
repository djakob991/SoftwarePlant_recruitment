/**
 * Model of a single planet's portion. It suits the format in which data from
 * the api are retrieved.
 */


import { Planet } from './Planet';


export interface PlanetsPortion {
  count: number;
  next: string;
  previous: string;
  results: Array<Planet>;
}
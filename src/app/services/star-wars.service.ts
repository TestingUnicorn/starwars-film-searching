import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import {
  SwapiResponse,
  SwapiFilm,
  SwapiPerson,
  SwapiStarship,
  SwapiVehicle,
} from '../models/swapi.model';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private readonly baseUrl = 'https://swapi.py4e.com/api';
  private readonly http = inject(HttpClient);

  getAllFilms(): Observable<SwapiResponse<SwapiFilm>> {
    return this.http.get<SwapiResponse<SwapiFilm>>(`${this.baseUrl}/films/`);
  }

  searchPeople(name: string): Observable<SwapiResponse<SwapiPerson>> {
    return this.http.get<SwapiResponse<SwapiPerson>>(
      `${this.baseUrl}/people/?search=${name}`
    );
  }

  searchStarships(name: string): Observable<SwapiResponse<SwapiStarship>> {
    return this.http.get<SwapiResponse<SwapiStarship>>(
      `${this.baseUrl}/starships/?search=${name}`
    );
  }

  searchVehicles(name: string): Observable<SwapiResponse<SwapiVehicle>> {
    return this.http.get<SwapiResponse<SwapiVehicle>>(
      `${this.baseUrl}/vehicles/?search=${name}`
    );
  }


  searchAll(name: string): Observable<[SwapiResponse<SwapiPerson>, SwapiResponse<SwapiStarship>, SwapiResponse<SwapiVehicle>]> {
  return forkJoin([
    this.searchPeople(name),
    this.searchStarships(name),
    this.searchVehicles(name)
  ]);
}

}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { SwapiResponse, SwapiFilm, SwapiEntity } from '../models/swapi.model';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private readonly baseUrl = 'https://swapi.py4e.com/api';
  private readonly http = inject(HttpClient);

  getAllFilms(): Observable<SwapiResponse<SwapiFilm>> {
    return this.http.get<SwapiResponse<SwapiFilm>>(`${this.baseUrl}/films/`);
  }

  searchPeople(name: string): Observable<SwapiResponse<SwapiEntity>> {
    return this.http.get<SwapiResponse<SwapiEntity>>(
      `${this.baseUrl}/people/?search=${name}`
    );
  }

  searchStarships(name: string): Observable<SwapiResponse<SwapiEntity>> {
    return this.http.get<SwapiResponse<SwapiEntity>>(
      `${this.baseUrl}/starships/?search=${name}`
    );
  }

  searchVehicles(name: string): Observable<SwapiResponse<SwapiEntity>> {
    return this.http.get<SwapiResponse<SwapiEntity>>(
      `${this.baseUrl}/vehicles/?search=${name}`
    );
  }

  searchAll(
    name: string
  ): Observable<
    [
      SwapiResponse<SwapiEntity>,
      SwapiResponse<SwapiEntity>,
      SwapiResponse<SwapiEntity>
    ]
  > {
    return forkJoin([
      this.searchPeople(name),
      this.searchStarships(name),
      this.searchVehicles(name),
    ]);
  }
}

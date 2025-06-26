import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwapiService } from 'src/app/services/star-wars.service';
import { SwapiFilm } from 'src/app/models/swapi.model';
import { SearchFormComponent } from '../../components/search-form/search-form.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, SearchFormComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  private readonly swapi = inject(SwapiService);
  private subscription: Subscription | undefined;

  films: SwapiFilm[] = [];
  people: string[] = [];
  starships: string[] = [];
  vehicles: string[] = [];
  highlightedFilmUrls: string[] = [];

  onHighlightFilms(urls: string[]) {
    this.highlightedFilmUrls = urls;
  }

  ngOnInit(): void {
    this.subscription = this.swapi.getAllFilms().subscribe((data) => {
      this.films = data.results;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

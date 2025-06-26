import {
  Component,
  ViewChild,
  AfterViewInit,
  inject,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SwapiService } from 'src/app/services/star-wars.service';
import { SwapiFilm } from 'src/app/models/swapi.model';
import { Observable, of, Subscription } from 'rxjs';

type SearchType = 'starship' | 'people' | 'vehicle';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, SearchInputComponent],
  templateUrl: './search-form.component.html',
})
export class SearchFormComponent implements AfterViewInit, OnDestroy {
  private readonly swapiService = inject(SwapiService);
  private viewReady = false;
  private searchSubscription: Subscription | null = null;

  @ViewChild('starshipInput') starshipInput!: SearchInputComponent;
  @ViewChild('peopleInput') peopleInput!: SearchInputComponent;
  @ViewChild('vehicleInput') vehicleInput!: SearchInputComponent;

  @Input() films: SwapiFilm[] = [];
  @Input() people: string[] = [];
  @Input() starships: string[] = [];
  @Input() vehicles: string[] = [];

  @Output() highlightFilmUrls = new EventEmitter<string[]>();

  isDisabled = true;
  activeRequiredField: SearchType | null = null;
  activeFieldValid = false;
  notExistMessage: string | null = null;

  ngAfterViewInit() {
    this.viewReady = true;
  }

  updateValidity(type: SearchType, valid: boolean) {
    if (!this.viewReady) return;

    if (!this.activeRequiredField) {
      this.setActiveRequiredField(type);
    }

    if (this.activeRequiredField === type) {
      this.activeFieldValid = valid;
      this.isDisabled = !valid;
    }
  }

  onInput(type: SearchType) {
    if (!this.viewReady) return;
    this.notExistMessage = null;

    if (this.activeRequiredField !== type) {
      this.setActiveRequiredField(type);
    }

    const activeInputComponent = this.getInputComponent(type);
    this.updateValidity(type, !!activeInputComponent?.isValid);
    this.highlightFilmUrls.emit([]);
  }

  onSearchClick() {
    if (!this.viewReady) return;
    this.notExistMessage = null;
    this.touchAllInputs();

    if (this.activeRequiredField && this.activeFieldValid) {
      const inputComponent = this.getInputComponent(this.activeRequiredField);
      const searchTerm = inputComponent?.value.trim();

      if (searchTerm) {
        this.performSearch(this.activeRequiredField, searchTerm);
      }
    }
  }

  private setActiveRequiredField(type: SearchType) {
    if (!this.viewReady) return;

    this.activeRequiredField = type;
    this.activeFieldValid = false;
    this.isDisabled = true;

    this.resetInput(this.starshipInput, type === 'starship');
    this.resetInput(this.peopleInput, type === 'people');
    this.resetInput(this.vehicleInput, type === 'vehicle');
  }

  private resetInput(input: SearchInputComponent, isRequired: boolean) {
    input.required = isRequired;

    if (!isRequired) {
      input.searchControl.reset('', { emitEvent: false });
      input.searchControl.setErrors(null);
    }

    input.applyValidators();
  }

  private touchAllInputs() {
    [this.starshipInput, this.peopleInput, this.vehicleInput].forEach((input) =>
      input?.touch()
    );
  }

  private getInputComponent(
    type: SearchType
  ): SearchInputComponent | undefined {
    const components = {
      starship: this.starshipInput,
      people: this.peopleInput,
      vehicle: this.vehicleInput,
    };
    return components[type];
  }

  private performSearch(type: SearchType, term: string) {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.notExistMessage = null;
    const filmPropertyMap: { [key in SearchType]: keyof SwapiFilm } = {
      starship: 'starships',
      people: 'characters',
      vehicle: 'vehicles',
    };

    const search$ = this.searchSwapiEntity$(type, term);

    this.searchSubscription = search$.subscribe({
      next: (response) => {
        const match = response.results.find(
          (item) => item.name.toLowerCase() === term.toLowerCase()
        );

        if (!match) {
          this.notExistMessage = `No films found containing this ${type} "${term}"`;
          this.highlightFilmUrls.emit([]);
          return;
        }

        const filmUrls = this.getMatchingFilmUrls(
          filmPropertyMap[type],
          match.url
        );
        this.highlightFilmUrls.emit(filmUrls);

        if (filmUrls.length === 0) {
          this.notExistMessage = `${type} "${term}" not found`;
        }
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.notExistMessage = 'Search failed. Please try again.';
      },
    });
  }

  private searchSwapiEntity$(
    type: SearchType,
    term: string
  ): Observable<{ results: Array<{ name: string; url: string }> }> {
    switch (type) {
      case 'starship':
        return this.swapiService.searchStarships(term);
      case 'people':
        return this.swapiService.searchPeople(term);
      case 'vehicle':
        return this.swapiService.searchVehicles(term);
    }
  }

  private getMatchingFilmUrls(
    property: keyof SwapiFilm,
    entityUrl: string
  ): string[] {
    return this.films
      .filter((film) => (film[property] as string[]).includes(entityUrl))
      .map((film) => film.url);
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}

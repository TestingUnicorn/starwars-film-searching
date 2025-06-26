import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = '';
  @Input() required = true;
  @Input() searchControl: FormControl = new FormControl('');

  @Output() statusChange = new EventEmitter<boolean>();
  @Output() input = new EventEmitter<void>();
  private statusSubscription?: Subscription;

  ngOnInit(): void {
    this.applyValidators();
    this.emitStatus();
    this.listenToStatusChanges();
  }

  public applyValidators(): void {
    const validators = [Validators.minLength(3)];
    if (this.required) validators.push(Validators.required);
    this.searchControl.setValidators(validators);
    this.searchControl.updateValueAndValidity();
  }

  private emitStatus(): void {
    this.statusChange.emit(this.searchControl.valid);
  }

  private listenToStatusChanges(): void {
    this.statusSubscription = this.searchControl.statusChanges.subscribe(() => {
      this.emitStatus();
    });
  }

  get value(): string {
    return this.searchControl.value;
  }

  get isValid(): boolean {
    return this.searchControl.valid;
  }

  touch(): void {
    this.searchControl.markAsTouched();
  }

  onInputChange(): void {
    this.input.emit();
  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
  }
}

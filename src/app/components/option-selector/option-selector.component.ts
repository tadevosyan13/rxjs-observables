import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { StateService } from '../../services/state.service';
import { Option } from '../../models/types';

@Component({
  selector: 'app-option-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'option-selector.component.html',
  styleUrl: 'option-selector.component.css'
})
export class OptionSelectorComponent implements OnInit, OnDestroy {
  public isVisible$!: Observable<boolean>;
  public options: Option[] = [];
  public activeBoxId: number | null = null;
  public selectedOptionId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.options = this.stateService.getOptions();
    this.isVisible$ = this.stateService.isOptionSelectorVisible$;
    this.stateService.activeBoxId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boxId => {
        this.activeBoxId = boxId;
      });

    this.stateService.getActiveBoxSelectedOption$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(optionId => {
        this.selectedOptionId = optionId;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOptionClick(option: Option): void {
    if (this.activeBoxId !== null) {
      this.stateService.emitOptionSelect(this.activeBoxId, option.id);
    }
  }
}

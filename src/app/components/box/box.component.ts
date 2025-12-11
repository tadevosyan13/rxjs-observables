import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from '../../services/state.service';
import { Option } from '../../models/types';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'box.component.html',
  styleUrl: 'box.component.css',
})
export class BoxComponent implements OnInit, OnDestroy {
  @Input({ required: true }) boxId!: number;

  public isActive$!: Observable<boolean>;
  public selectedOption: Option | null = null;
  private destroy$ = new Subject<void>();

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.isActive$ = this.stateService.isBoxActive$(this.boxId);
    this.stateService
      .getBoxSelection$(this.boxId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedOptionId) => {
        this.selectedOption = selectedOptionId
          ? this.stateService.getOptionById(selectedOptionId) || null
          : null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBoxClick(): void {
    this.stateService.emitBoxClick(this.boxId);
  }
}

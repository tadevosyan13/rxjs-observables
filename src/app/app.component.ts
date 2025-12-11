import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxComponent } from './components/box/box.component';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoxComponent, OptionSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css'
})
export class AppComponent implements OnInit {
  public boxIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public totalCalories$ = this.stateService.getTotalCalories$();

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.stateService.loadState();
  } 

  clearAllSelections(): void {
    this.stateService.clearAllSelections();
  }
} 
 
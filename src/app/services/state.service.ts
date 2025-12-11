import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Option } from '../models/types';
import { MOCK_OPTIONS } from '../data/mock-options';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly STORAGE_KEY = 'box-selections';

  private readonly options: Option[] = MOCK_OPTIONS;

  private selectionsSubject = new BehaviorSubject<Map<number, number | null>>(new Map());
  private activeBoxIdSubject = new BehaviorSubject<number | null>(null);
  private isOptionSelectorVisibleSubject = new BehaviorSubject<boolean>(false);

  private boxClickSubject = new Subject<number>();
  private optionSelectSubject = new Subject<{ boxId: number; optionId: number }>();
  private clearAllSubject = new Subject<void>();

  public selections$: Observable<Map<number, number | null>> = this.selectionsSubject.asObservable();
  public activeBoxId$: Observable<number | null> = this.activeBoxIdSubject.asObservable();
  public isOptionSelectorVisible$: Observable<boolean> = this.isOptionSelectorVisibleSubject.asObservable();

  public boxClick$: Observable<number> = this.boxClickSubject.asObservable();
  public optionSelect$: Observable<{ boxId: number; optionId: number }> = this.optionSelectSubject.asObservable();
  public clearAll$: Observable<void> = this.clearAllSubject.asObservable();

  constructor() {
    this.boxClick$.subscribe(boxId => this.handleBoxClick(boxId));
    this.optionSelect$.subscribe(({ boxId, optionId }) => this.handleOptionSelect(boxId, optionId));
    this.clearAll$.subscribe(() => this.handleClearAll());
  }

  getOptions(): Option[] {
    return this.options;
  }

  getOptionById(id: number): Option | undefined {
    return this.options.find(opt => opt.id === id);
  }

  getBoxSelection$(boxId: number): Observable<number | null> {
    return this.selections$.pipe(
      map(selections => selections.get(boxId) || null),
      distinctUntilChanged()
    );
  }

  isBoxActive$(boxId: number): Observable<boolean> {
    return this.activeBoxId$.pipe(
      map(activeId => activeId === boxId),
      distinctUntilChanged()
    );
  }

  getActiveBoxSelectedOption$(): Observable<number | null> {
    return this.activeBoxId$.pipe(
      map(activeBoxId => {
        if (activeBoxId === null) return null;
        return this.selectionsSubject.value.get(activeBoxId) || null;
      }),
      distinctUntilChanged()
    );
  }

    getTotalCalories$(): Observable<number> {
        return this.selections$.pipe(
            map(selections => {
                let total = 0;
                selections.forEach((optionId) => {
                    if (optionId !== null) {
                        const option = this.getOptionById(optionId);
                        if (option) {
                            total += option.calories;
                        }
                    }
                });
                return total;
            }),
            distinctUntilChanged()
        );
    }

  emitBoxClick(boxId: number): void {
    this.boxClickSubject.next(boxId);
  }

  emitOptionSelect(boxId: number, optionId: number): void {
    this.optionSelectSubject.next({ boxId, optionId });
  }

  clearAllSelections(): void {
    this.clearAllSubject.next();
  }

  private handleBoxClick(boxId: number): void {
    this.activeBoxIdSubject.next(boxId);
    this.isOptionSelectorVisibleSubject.next(true);
  }

  private handleOptionSelect(boxId: number, optionId: number): void {
    const currentSelections = new Map(this.selectionsSubject.value);
    currentSelections.set(boxId, optionId);
    this.selectionsSubject.next(currentSelections);
    this.saveState();
    this.advanceToNextBox(boxId);
  }

  private advanceToNextBox(currentBoxId: number): void {
    const nextBoxId = currentBoxId + 1;
    
    if (nextBoxId <= 10) {
      this.activeBoxIdSubject.next(nextBoxId);
    } else {
      this.isOptionSelectorVisibleSubject.next(false);
      this.activeBoxIdSubject.next(null);
    }
  }


  private handleClearAll(): void {
    this.selectionsSubject.next(new Map());
    this.activeBoxIdSubject.next(null);
    this.isOptionSelectorVisibleSubject.next(false);
    this.saveState();
  }

  private saveState(): void {
    const selections = this.selectionsSubject.value;
    const selectionsObject: { [key: string]: number | null } = {};
    
    selections.forEach((optionId, boxId) => {
      selectionsObject[boxId.toString()] = optionId;
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(selectionsObject));
  }

  loadState(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        const selectionsObject: { [key: string]: number | null } = JSON.parse(stored);
        const selections = new Map<number, number | null>();
        
        Object.keys(selectionsObject).forEach(key => {
          const boxId = parseInt(key, 10);
          selections.set(boxId, selectionsObject[key]);
        });
        
        this.selectionsSubject.next(selections);
      } catch (e) {
        console.error('Error loading state from localStorage:', e);
      }
    }
  }
}

export interface Option {
  id: number;
  name: string;
  value: string;
  imageUrl: string;
}

export interface BoxSelection {
  boxId: number;
  selectedOptionId: number | null;
}

export interface AppState {
  selections: Map<number, number | null>; 
  activeBoxId: number | null;
  isOptionSelectorVisible: boolean;
}

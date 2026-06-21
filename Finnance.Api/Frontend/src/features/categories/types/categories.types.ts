export interface Category {
  category: number;
  categoryType: number;
  name: string;
  color: string;
  icon: string;
  active: boolean;
  created: string;
  updated: string;
}

export interface CategoryType {
  categoryType: number;
  name: string;
  active: boolean;
}

export interface CreateCategoryInput {
  name: string;
  categoryType: number;
  color: string;
  icon: string;
}

export interface UpdateCategoryInput {
  category: number;
  name: string;
  categoryType: number;
  color: string;
  icon: string;
  active: boolean;
}

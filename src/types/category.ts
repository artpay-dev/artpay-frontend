export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: null | unknown;
  menu_order: number;
  count: number;
}

export interface CategoryGroup extends Category {
  children: Category[];
}

export type CategoryMap = {
  [name: string]: CategoryGroup;
};

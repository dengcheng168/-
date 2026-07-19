export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  visible: boolean;
  openInNewTab: boolean;
  parentId: number | null;
  children?: NavigationItem[];
}

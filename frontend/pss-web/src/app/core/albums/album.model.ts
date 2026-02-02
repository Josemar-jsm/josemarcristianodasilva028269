export type AlbumResponse = {
  id: number;
  title: string;
  coverUrl: string | null;
  artistIds: number[];
  createdAt: string;
  updatedAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

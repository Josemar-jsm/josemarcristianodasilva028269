export interface ArtistResponse {
  id: number;
  name: string;
  albumCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

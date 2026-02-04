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

export type ArtistCreateRequest = Pick<ArtistResponse, 'name'>;

export type ArtistUpdateRequest = ArtistCreateRequest;

export type ArtistSummary = Pick<ArtistResponse, 'id' | 'name'>;

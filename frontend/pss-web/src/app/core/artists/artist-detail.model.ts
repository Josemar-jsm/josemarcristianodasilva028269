export type ArtistAlbumItemResponse = {
  id: number;
  title: string;
  coverUrl: string | null;
  artistIds: number[];
  createdAt: string;
  updatedAt: string;
};

export type ArtistDetailResponse = {
  id: number;
  name: string;
  albumCount: number;
  albums: ArtistAlbumItemResponse[];
};

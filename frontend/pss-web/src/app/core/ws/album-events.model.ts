export type AlbumCreatedEvent = {
  type: 'album.created';
  id: number;
  title: string;
  coverUrl: string | null;
  artistIds: number[];
  createdAt: string;
};

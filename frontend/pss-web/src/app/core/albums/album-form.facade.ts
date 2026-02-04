import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize, forkJoin, of, Observable } from 'rxjs';
import { AlbumApi } from './album-api.service';
import { AlbumResponse, AlbumCreateRequest, AlbumUpdateRequest } from './album.model';
import { ArtistApiService } from '../artists/artist-api.service';
import { ArtistResponse } from '../artists/artist.model';

export type AlbumFormState = {
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  error: string | null;
  mode: 'create' | 'edit';
  id: number | null;
  album: AlbumResponse | null;
  artists: ArtistResponse[];
  title: string;
  artistIds: number[];
  coverPreviewUrl: string | null;
};

const initial: AlbumFormState = {
  loading: false,
  saving: false,
  uploading: false,
  error: null,
  mode: 'create',
  id: null,
  album: null,
  artists: [],
  title: '',
  artistIds: [],
  coverPreviewUrl: null,
};

@Injectable({ providedIn: 'root' })
export class AlbumFormFacade {
  private readonly albums = inject(AlbumApi);
  private readonly artistsApi = inject(ArtistApiService);

  private subject = new BehaviorSubject<AlbumFormState>({ ...initial });
  state$ = this.subject.asObservable();

  private updateState(partial: Partial<AlbumFormState>): void {
    this.subject.next({ ...this.subject.value, ...partial });
  }

  snapshot(): AlbumFormState {
    return this.subject.value;
  }

  initCreate(): void {
    this.subject.next({ ...initial, mode: 'create', loading: true });

    this.artistsApi.list('', 0, 200)
      .pipe(finalize(() => this.updateState({ loading: false })))
      .subscribe({
        next: (page) => this.updateState({ artists: page.content ?? [] }),
        error: (err: any) => this.updateState({ error: this.handleError(err, 'carregar artistas') })
      });
  }

  initEdit(id: number): void {
    this.subject.next({ ...initial, mode: 'edit', id, loading: true });

    forkJoin({
      album: this.albums.getById(id),
      artists: this.artistsApi.list('', 0, 200),
    })
      .pipe(finalize(() => this.updateState({ loading: false })))
      .subscribe({
        next: ({ album, artists }) => {
          this.updateState({
            album,
            artists: artists.content ?? [],
            title: album.title ?? '',
            artistIds: album.artistIds ?? [],
            coverPreviewUrl: album.coverUrl ?? null,
          });
        },
        error: (err: any) => this.updateState({ error: this.handleError(err, 'carregar álbum') })
      });
  }

  setTitle(title: string): void {
    this.updateState({ title });
  }

  setCoverPreview(file: File): void {
    const url = URL.createObjectURL(file);
    this.updateState({ coverPreviewUrl: url });
  }

  toggleArtist(id: number): void {
    const s = this.snapshot();
    const artistIds = s.artistIds.includes(id)
      ? s.artistIds.filter(aId => aId !== id)
      : [...s.artistIds, id];
    this.updateState({ artistIds });
  }

  save(onDone: (saved: AlbumResponse) => void): void {
    const s = this.snapshot();
    if (s.saving) return;

    const title = (s.title ?? '').trim();
    if (!title) return this.updateState({ error: 'Título é obrigatório.' });
    if (!s.artistIds?.length) return this.updateState({ error: 'Selecione ao menos 1 artista.' });

    this.updateState({ saving: true, error: null });

    const call$: Observable<AlbumResponse | null> = s.mode === 'create'
      ? this.albums.create({ title, artistIds: s.artistIds })
      : s.id ? this.albums.update(s.id, { title, artistIds: s.artistIds }) : of(null);

    call$.pipe(finalize(() => this.updateState({ saving: false })))
      .subscribe({
        next: (saved: AlbumResponse | null) => {
          if (saved) {
            this.updateState({ album: saved, coverPreviewUrl: saved.coverUrl ?? s.coverPreviewUrl });
            onDone(saved);
          }
        },
        error: (err: any) => this.updateState({ error: this.handleError(err, 'salvar álbum') })
      });
  }

    uploadCover(file: File, onDone?: (url: string) => void): void {
      const s = this.snapshot();
      const albumId = s.album?.id ?? s.id;

      if (!albumId) {
        this.updateState({ error: 'Salve o álbum antes de enviar a capa.' });
        return;
      }

      this.updateState({ uploading: true, error: null });

      this.albums.uploadCover(albumId, file)
        .pipe(finalize(() => this.updateState({ uploading: false })))
        .subscribe({
          next: (resp: any) => {
            this.updateState({ coverPreviewUrl: resp.url });
            onDone?.(resp.url);
          },
          error: (err: any) => this.updateState({ error: this.handleError(err, 'enviar capa') })
        });
    }

    removeCover(onDone?: () => void): void {
      const albumId = this.snapshot().album?.id ?? this.snapshot().id;
      if (!albumId) return;

      this.updateState({ uploading: true, error: null });

      this.albums.deleteCover(albumId)
        .pipe(finalize(() => this.updateState({ uploading: false })))
        .subscribe({
          next: () => {
            this.updateState({ coverPreviewUrl: null });
            onDone?.();
          },
          error: (err: any) => this.updateState({ error: this.handleError(err, 'remover capa') })
        });
    }

  private handleError(err: any, action: string): string {
    return err?.error?.detail ?? err?.message ?? `Erro ao ${action}`;
  }
}

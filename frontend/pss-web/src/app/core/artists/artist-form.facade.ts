import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize, of, Observable } from 'rxjs';
import { ArtistApiService } from './artist-api.service';
import { ArtistCreateRequest, ArtistResponse, ArtistUpdateRequest } from './artist.model';

export type ArtistFormState = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  mode: 'create' | 'edit';
  id: number | null;
  data: ArtistResponse | null;
};

const initial: ArtistFormState = {
  loading: false,
  saving: false,
  error: null,
  mode: 'create',
  id: null,
  data: null,
};

@Injectable({ providedIn: 'root' })
export class ArtistFormFacade {
  private readonly api = inject(ArtistApiService);
  private readonly subject = new BehaviorSubject<ArtistFormState>(initial);

  state$ = this.subject.asObservable();

  private updateState(partial: Partial<ArtistFormState>): void {
    this.subject.next({ ...this.subject.value, ...partial });
  }

  snapshot() { return this.subject.value; }

  initCreate() { this.subject.next(initial); }

  initEdit(id: number): void {
    this.updateState({ mode: 'edit', id, loading: true, error: null });
    this.api.getById(id)
      .pipe(finalize(() => this.updateState({ loading: false })))
      .subscribe({
        next: (data) => this.updateState({ data }),
        error: (err: any) => this.updateState({ error: this.handleError(err, 'carregar') })
      });
  }

  save(name: string, onDone: (saved: ArtistResponse) => void): void {
    const s = this.snapshot();
    const trimmed = (name ?? '').trim();

    this.updateState({ saving: true, error: null });

    const call$: Observable<ArtistResponse | null> = s.mode === 'create'
      ? this.api.create({ name: trimmed })
      : s.id ? this.api.update(s.id, { name: trimmed }) : of(null);

    call$.pipe(finalize(() => this.updateState({ saving: false })))
      .subscribe({
        next: (saved) => {
          if (saved) {
            this.updateState({ data: saved });
            onDone(saved);
          }
        },
        error: (err: any) => this.updateState({ error: this.handleError(err, 'salvar') })
      });
  }

  private handleError(err: any, action: string): string {
    return err?.error?.detail ?? err?.message ?? `Erro ao ${action} artista`;
  }
}

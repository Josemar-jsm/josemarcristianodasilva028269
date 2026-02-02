import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ArtistApiService } from './artist-api.service';
import { PageResponse } from '../shared/page.model';
import { ArtistResponse } from './artist.model';

export interface ArtistState {
  loading: boolean;
  error: string | null;

  name: string;
  page: number;
  size: number;

  data: PageResponse<ArtistResponse> | null;
}

const initialState: ArtistState = {
  loading: false,
  error: null,
  name: '',
  page: 0,
  size: 10,
  data: null,
};

@Injectable({ providedIn: 'root' })
export class ArtistFacade {
  private readonly subject = new BehaviorSubject<ArtistState>({ ...initialState });
  readonly state$ = this.subject.asObservable();

  constructor(
    private api: ArtistApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParamMap
      .pipe(
        map((q) => ({
          name: q.get('name') ?? '',
          page: Number(q.get('page') ?? 0),
          size: Number(q.get('size') ?? 10),
        })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((p) => {
        const prev = this.snapshot();

        const nextPage = Number.isFinite(p.page) ? Math.max(0, p.page) : 0;
        const nextSize = Number.isFinite(p.size) ? Math.max(1, p.size) : 10;

        const changed =
          prev.name !== p.name || prev.page !== nextPage || prev.size !== nextSize;

        if (!changed) return;

        this.subject.next({
          ...prev,
          name: p.name,
          page: nextPage,
          size: nextSize,
        });

        this.refresh();
      });
  }

  snapshot(): ArtistState {
    return this.subject.value;
  }

  private patch(partial: Partial<ArtistState>) {
    this.subject.next({ ...this.snapshot(), ...partial });
  }

  private syncUrl() {
    const s = this.snapshot();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name: s.name || null,
        page: s.page,
        size: s.size,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setName(name: string) {
    this.patch({ name, page: 0 });
    this.syncUrl();
  }

  setPage(page: number) {
    this.patch({ page: Math.max(0, page) });
    this.syncUrl();
  }

  prevPage() {
    const s = this.snapshot();
    this.setPage(Math.max(0, s.page - 1));
    this.refresh();
  }

  nextPage() {
    const s = this.snapshot();
    const last = (s.data?.totalPages ?? 1) - 1;
    this.setPage(Math.min(last, s.page + 1));
    this.refresh();
  }

  setSize(size: number) {
    this.patch({ size: Math.max(1, size), page: 0 });
    this.syncUrl();
  }

  refresh() {
    const s = this.snapshot();
    this.patch({ loading: true, error: null });

    this.api
      .list(s.name, s.page, s.size)
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (data) => this.patch({ data }),
        error: (err) => {
          const msg = err?.error?.detail ?? err?.message ?? 'Erro ao carregar artistas';
          this.patch({ error: msg });
        },
      });
  }
}

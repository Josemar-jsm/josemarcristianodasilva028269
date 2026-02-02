import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AlbumApi } from './album-api.service';
import { AlbumResponse, PageResponse } from './album.model';

export type AlbumListState = {
  loading: boolean;
  error: string | null;

  title: string;
  page: number;
  size: number;
  sort: string;

  data: PageResponse<AlbumResponse> | null;
};

const initialState: AlbumListState = {
  loading: false,
  error: null,
  title: '',
  page: 0,
  size: 10,
  sort: 'id,asc',
  data: null,
};

@Injectable({ providedIn: 'root' })
export class AlbumFacade {
  private readonly subject = new BehaviorSubject<AlbumListState>(initialState);
  readonly state$ = this.subject.asObservable();

  constructor(
    private api: AlbumApi,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParamMap
      .pipe(
        map((q) => ({
          title: q.get('title') ?? '',
          page: Number(q.get('page') ?? 0),
          size: Number(q.get('size') ?? 10),
          sort: q.get('sort') ?? 'id,asc',
        })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((p) => {
        const prev = this.snapshot();


        const nextPage = Number.isFinite(p.page) ? Math.max(0, p.page) : 0;
        const nextSize = Number.isFinite(p.size) ? Math.max(1, p.size) : 10;


        const changed =
          prev.title !== p.title ||
          prev.page !== nextPage ||
          prev.size !== nextSize ||
          prev.sort !== p.sort;

        if (!changed) return;

        this.subject.next({
          ...prev,
          title: p.title,
          page: nextPage,
          size: nextSize,
          sort: p.sort,
        });


        this.refresh();
      });
  }

  snapshot(): AlbumListState {
    return this.subject.value;
  }

  private patch(partial: Partial<AlbumListState>) {
    this.subject.next({ ...this.snapshot(), ...partial });
  }

  private syncUrl() {
    const s = this.snapshot();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        title: s.title || null,
        page: s.page,
        size: s.size,
        sort: s.sort,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setTitle(title: string) {
    this.patch({ title, page: 0 });
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
      .list({
        title: s.title || undefined,
        page: s.page,
        size: s.size,
        sort: s.sort,
      })
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (data) => this.patch({ data }),
        error: (err) => {
          const msg = err?.error?.detail || err?.message || 'Erro ao listar álbuns';
          this.patch({ error: msg });
        },
      });
  }
}

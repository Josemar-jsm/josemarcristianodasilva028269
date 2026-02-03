import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Adicionado
import {
  BehaviorSubject,
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ArtistDetailApiService } from '../../core/artists/artist-detail-api.service';
import { ArtistDetailResponse } from '../../core/artists/artist-detail.model';

type ArtistDetailState = {
  loading: boolean;
  error: string | null;
  data: ArtistDetailResponse | null;
};

const initialState: ArtistDetailState = {
  loading: false,
  error: null,
  data: null,
};

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Detalhes do artista</h1>
          <p class="text-sm text-slate-600">Álbuns associados e informações.</p>
        </div>

        <div class="flex gap-2">
          <button class="px-4 py-2 rounded border hover:bg-slate-50 transition-colors" (click)="back()">
            Voltar
          </button>

          <button
            class="px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            (click)="reload()"
            [disabled]="(state$ | async)?.loading"
          >
            {{ (state$ | async)?.loading ? 'Carregando...' : 'Atualizar' }}
          </button>
        </div>
      </div>

      <ng-container *ngIf="(state$ | async) as s">
        <div *ngIf="s.error" class="mb-3 p-3 rounded bg-red-50 text-red-800 border border-red-200">
          {{ s.error }}
        </div>

        <div *ngIf="s.loading" class="p-8 flex justify-center bg-white border rounded mb-4">
          <span class="text-slate-500 animate-pulse">Carregando informações do artista...</span>
        </div>

        <div *ngIf="!s.loading && s.data as d" class="space-y-4">
          <div class="bg-white border rounded p-4 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div class="text-sm text-slate-500 uppercase tracking-wider font-bold">Artista</div>
                <div class="text-2xl font-semibold text-slate-900">{{ d.name }}</div>
                <div class="text-sm text-slate-600 mt-1">
                  ID: <b>{{ d.id }}</b>
                  <span class="mx-2">|</span>
                  Nº de álbuns: <b>{{ d.albumCount }}</b>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="(d.albums.length === 0)" class="bg-white border rounded p-8 text-center">
            <div class="text-slate-800 font-medium">Nenhum álbum associado.</div>
          </div>

          <div *ngIf="(d.albums.length > 0)" class="bg-white border rounded overflow-hidden shadow-sm">
             <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50 text-slate-700 border-b">
                  <tr>
                    <th class="text-left py-3 px-4 w-24">ID</th>
                    <th class="text-left py-3 px-4">Título</th>
                    <th class="text-left py-3 px-4 w-40">Capa</th>
                    <th class="text-left py-3 px-4">Atualizado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let a of d.albums" class="hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4 text-slate-500 font-mono">{{ a.id }}</td>
                    <td class="py-3 px-4 font-medium text-slate-900">{{ a.title }}</td>
                    <td class="py-3 px-4">
                      <div class="flex flex-col gap-2">
                        <!-- Aplicado sanitizeUrl para permitir o carregamento -->
                        <img
                          *ngIf="a.coverUrl"
                          [src]="sanitizeUrl(a.coverUrl)"
                          alt="Capa do Álbum"
                          class="w-20 h-20 md:w-32 md:h-32 object-cover rounded shadow-sm border border-slate-200"
                        >
                        <a
                          *ngIf="a.coverUrl"
                          [href]="sanitizeUrl(a.coverUrl)"
                          target="_blank"
                          class="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          Ver original
                        </a>
                        <span *ngIf="!a.coverUrl" class="text-slate-300 text-xs">Sem capa</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-slate-500">{{ a.updatedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button class="px-6 py-2 rounded border bg-white hover:bg-slate-50 transition-colors" (click)="back()">
              Voltar para Lista
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class ArtistDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ArtistDetailApiService);
  private location = inject(Location);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  private destroy$ = new Subject<void>();
  private reload$ = new BehaviorSubject<number>(0);

  private readonly subject = new BehaviorSubject<ArtistDetailState>({ ...initialState });
  readonly state$ = this.subject.asObservable();

  sanitizeUrl(url: string): SafeUrl {
  const decodedUrl = url.replace(/&amp;/g, '&');
  return this.sanitizer.bypassSecurityTrustUrl(decodedUrl);
}

  ngOnInit(): void {
    const id$ = this.route.paramMap.pipe(
      map(pm => Number(pm.get('id'))),
      distinctUntilChanged()
    );

    combineLatest([id$, this.reload$])
      .pipe(
        map(([id]) => id),
        switchMap(id => {
          if (!id || Number.isNaN(id)) {
            return of<ArtistDetailState>({
              loading: false,
              error: 'ID do artista inválido ou não encontrado.',
              data: null,
            });
          }

          this.subject.next({ ...this.subject.value, loading: true, error: null });

          return this.api.getById(id).pipe(
            map((data): ArtistDetailState => ({ loading: false, error: null, data })),
            catchError(err => {
              const msg = err?.error?.detail ?? err?.message ?? 'Erro ao carregar detalhes do artista';
              return of<ArtistDetailState>({ loading: false, error: msg, data: null });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(state => this.subject.next(state));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.reload$.next(this.reload$.value + 1);
  }

  back(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/artists']);
    }
  }
}

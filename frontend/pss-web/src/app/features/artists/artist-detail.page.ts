import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  imports: [CommonModule, DatePipe, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Detalhes do Artista</h1>
          <p class="text-slate-500 mt-1">Informações detalhadas e catálogo de álbuns.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button (click)="back()"
                  class="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>

          <a routerLink="/artists/new"
             class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Artista
          </a>
        </div>
      </header>

      <ng-container *ngIf="(state$ | async) as s">
        <div *ngIf="s.error" role="alert" class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex gap-3 animate-in fade-in">
          <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
          <span class="font-medium">{{ s.error }}</span>
        </div>

        <div *ngIf="s.loading" class="p-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full bg-indigo-600 animate-bounce"></div>
            <div class="w-3 h-3 rounded-full bg-indigo-600 animate-bounce [animation-delay:-.3s]"></div>
            <div class="w-3 h-3 rounded-full bg-indigo-600 animate-bounce [animation-delay:-.5s]"></div>
          </div>
          <span class="text-slate-500 font-medium">Buscando informações...</span>
        </div>

        <div *ngIf="!s.loading && s.data as d" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-3">
                  PERFIL DO ARTISTA
                </span>
                <h2 class="text-4xl font-black text-slate-900 tracking-tight">{{ d.name }}</h2>
                <div class="flex items-center gap-4 mt-3 text-slate-500">
                  <span class="flex items-center gap-1 font-mono text-xs bg-slate-100 px-2 py-1 rounded">ID: {{ d.id }}</span>
                  <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span class="text-sm font-medium"><b>{{ d.albumCount }}</b> Álbuns no catálogo</span>
                </div>
              </div>

              <button (click)="reload()"
                      [disabled]="s.loading"
                      class="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 p-2 transition-colors">
                <svg class="w-4 h-4" [class.animate-spin]="s.loading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ATUALIZAR DADOS
              </button>
            </div>
          </div>

          <!-- Listagem de Álbuns -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 class="font-bold text-slate-800 uppercase tracking-widest text-xs">Discografia Associada</h3>
            </div>

            <div *ngIf="d.albums.length === 0" class="p-16 text-center">
              <div class="text-slate-400 font-medium italic">Nenhum álbum registrado para este artista.</div>
            </div>

            <div *ngIf="d.albums.length > 0" class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th class="px-6 py-4">Capa</th>
                    <th class="px-6 py-4">Título do Álbum</th>
                    <th class="px-6 py-4">Última Atualização</th>
                    <th class="px-6 py-4 text-right">ID</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let a of d.albums" class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="relative w-20 h-20 md:w-24 md:h-24 shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <img *ngIf="a.coverUrl"
                             [src]="sanitizeUrl(a.coverUrl)"
                             alt="Capa"
                             class="w-full h-full object-cover rounded-xl shadow-md border border-slate-200 bg-slate-100">
                        <div *ngIf="!a.coverUrl" class="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" /></svg>
                        </div>
                      </div>
                      <a *ngIf="a.coverUrl"
                         [href]="sanitizeUrl(a.coverUrl)"
                         target="_blank"
                         class="text-[10px] font-bold text-indigo-500 mt-1 block hover:underline">ABRIR ORIGINAL</a>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ a.title }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-slate-500">{{ a.updatedAt | date:'dd/MM/yyyy' }} às {{ a.updatedAt | date:'HH:mm' }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-xs font-mono text-slate-300">{{ a.id }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class ArtistDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ArtistDetailApiService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly destroy$ = new Subject<void>();
  private readonly reload$ = new BehaviorSubject<number>(0);

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

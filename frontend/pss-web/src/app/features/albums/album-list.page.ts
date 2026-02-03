import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlbumFacade } from '../../core/albums/album.facade';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 class="text-xl font-semibold text-slate-900">Álbuns</h1>

        <div class="flex gap-2">
          <input
            class="w-full md:w-72 border rounded px-3 py-2 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Filtrar por título..."
            [(ngModel)]="title"
            (keyup.enter)="search()"
          />
          <button class="px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors" (click)="search()">
            Buscar
          </button>
          <button class="px-4 py-2 rounded border hover:bg-slate-50 transition-colors" (click)="reload()">
            Atualizar
          </button>
        </div>
      </div>

      <div *ngIf="(state$ | async) as s">
        <div *ngIf="s.error" class="mb-3 p-3 rounded bg-red-50 text-red-800 border border-red-200">
          {{ s.error }}
        </div>

        <div class="bg-white border rounded overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th class="text-left py-3 px-4 w-20">ID</th>
                  <th class="text-left py-3 px-4">Título</th>
                  <th class="text-left py-3 px-4 w-24 text-center">Capa</th>
                  <th class="text-left py-3 px-4 w-44">Artistas (IDs)</th>
                  <th class="text-left py-3 px-4 w-48">Atualizado em</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                <tr *ngIf="s.loading">
                  <td class="py-6 px-4 text-center text-slate-500" colspan="5">
                    <span class="inline-block animate-pulse">Carregando álbuns...</span>
                  </td>
                </tr>

                <tr
                  *ngFor="let a of (s.data?.content ?? [])"
                  class="hover:bg-slate-50 transition-colors group cursor-pointer"
                  [routerLink]="['/albums', a.id]"
                >
                  <td class="py-3 px-4 text-slate-500 font-mono text-xs">{{ a.id }}</td>
                  <td class="py-3 px-4 font-medium text-slate-900">{{ a.title }}</td>

                  <td class="py-3 px-4 text-center" (click)="$event.stopPropagation()">
                    <a
                      *ngIf="a.coverUrl; else noCover"
                      class="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                      [href]="a.coverUrl"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver link
                    </a>
                    <ng-template #noCover><span class="text-slate-300">—</span></ng-template>
                  </td>

                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <ng-container *ngIf="a.artistIds && a.artistIds.length > 0; else noArtists">
                        <span
                          *ngFor="let id of a.artistIds"
                          class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200"
                        >
                          #{{ id }}
                        </span>
                      </ng-container>
                      <ng-template #noArtists><span class="text-slate-400 italic text-xs">Vazio</span></ng-template>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-slate-500 text-xs">
                    {{ a.updatedAt ? (a.updatedAt | date: 'dd/MM/yyyy HH:mm') : '—' }}
                  </td>
                </tr>

                <tr *ngIf="!s.loading && (s.data?.content?.length ?? 0) === 0" class="border-t">
                  <td class="py-10 px-4 text-center text-slate-400" colspan="5">
                    Nenhum álbum encontrado para esta pesquisa.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginação -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 px-1">
          <div class="text-sm text-slate-600">
            Mostrando <b>{{ s.data?.content?.length ?? 0 }}</b> de <b>{{ s.data?.totalElements ?? 0 }}</b> álbuns
            <span class="mx-2 text-slate-300">|</span>
            Página <b>{{ s.page + 1 }}</b> de <b>{{ s.data?.totalPages ?? 1 }}</b>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-500 mr-1">Itens por página:</label>
            <select
              class="border rounded px-2 py-1.5 bg-white text-sm outline-none focus:border-slate-400"
              [ngModel]="s.size"
              (ngModelChange)="changeSize($event)"
            >
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
            </select>

            <div class="flex gap-1 ml-2">
              <button
                class="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                [disabled]="s.page <= 0"
                (click)="prev()"
              >
                Anterior
              </button>

              <button
                class="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                [disabled]="s.page >= ((s.data?.totalPages ?? 1) - 1)"
                (click)="next()"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AlbumListPage implements OnInit {
  private facade = inject(AlbumFacade);

  state$ = this.facade.state$;
  title = '';

  ngOnInit(): void {
    this.facade.refresh();
  }

  reload(): void {
    this.facade.refresh();
  }

  search(): void {
    this.facade.setTitle(this.title);
    this.facade.setPage(0);
    this.facade.refresh();
  }

  prev(): void {
    const s = this.facade.snapshot();
    this.facade.setPage(Math.max(0, s.page - 1));
    this.facade.refresh();
  }

  next(): void {
    const s = this.facade.snapshot();
    const last = (s.data?.totalPages ?? 1) - 1;
    this.facade.setPage(Math.min(last, s.page + 1));
    this.facade.refresh();
  }

  changeSize(size: any): void {
    this.facade.setSize(Number(size));
    this.facade.setPage(0);
    this.facade.refresh();
  }
}

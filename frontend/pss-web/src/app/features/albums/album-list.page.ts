import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlbumFacade } from '../../core/albums/album.facade';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto p-4 md:p-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gerenciamento de Álbuns</h1>

        <a
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          routerLink="/albums/new"
        >
          <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Novo álbum</span>
        </a>
      </div>

      <div *ngIf="(state$ | async) as s">
        <div *ngIf="s.error" class="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
          {{ s.error }}
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6">
          <div class="flex flex-col md:flex-row gap-4 justify-end">
            <div class="flex-1 md:flex-none w-full md:w-80">
              <input
                class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all placeholder-slate-400"
                placeholder="Filtrar por título..."
                [(ngModel)]="title"
                (keyup.enter)="search()"
              />
            </div>

            <div class="flex gap-3">
              <button class="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm cursor-pointer" (click)="search()">
                <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span>Buscar</span>
              </button>

              <button class="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm cursor-pointer" (click)="reload()">
                <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.992v4.992" />
                </svg>
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabela de Dados -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th class="text-left py-4 px-4 w-24">ID</th>
                  <th class="text-left py-4 px-4">Título</th>
                  <th class="text-left py-4 px-4 w-28 text-center">Capa</th>
                  <th class="text-left py-4 px-4 w-56">Artistas</th>
                  <th class="text-left py-4 px-4 w-48">Última Atualização</th>
                  <th class="w-20"></th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                <tr *ngIf="s.loading">
                  <td class="py-10 px-4 text-center text-slate-500" colspan="6">
                    <span class="inline-block animate-pulse text-lg">Carregando álbuns...</span>
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
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors shadow-sm"
                      [href]="a.coverUrl"
                      target="_blank"
                      rel="noreferrer"
                      title="Ver capa em tamanho real"
                    >
                      <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                      Link
                    </a>
                    <ng-template #noCover><span class="text-slate-400 text-xs">Sem capa</span></ng-template>
                  </td>

                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <ng-container *ngIf="a.artistIds.length; else noArtists">
                        <span
                          *ngFor="let id of a.artistIds"
                          class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200"
                        >
                          #{{ id }}
                        </span>
                      </ng-container>
                      <ng-template #noArtists><span class="text-slate-400 italic text-xs">Nenhum</span></ng-template>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-slate-500 text-xs">
                    {{ a.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                  </td>

                  <td class="py-2 px-3 text-right" (click)="$event.stopPropagation()">
                    <a
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-xs shadow-sm"
                      [routerLink]="['/albums', a.id, 'edit']"
                      title="Editar álbum"
                    >
                      <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </a>
                  </td>
                </tr>

                <tr *ngIf="!s.loading && (s.data?.content?.length ?? 0) === 0" class="border-t">
                  <td class="py-10 px-4 text-center text-slate-400 text-base" colspan="6">
                    Nenhum álbum encontrado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginação -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <div class="text-sm text-slate-600">
            Mostrando <b>{{ s.data?.content?.length ?? 0 }}</b> de <b>{{ s.data?.totalElements ?? 0 }}</b> álbuns
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs font-medium text-slate-500">Itens/página:</label>
            <select
              class="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm outline-none focus:border-blue-500"
              [ngModel]="s.size"
              (ngModelChange)="changeSize($event)"
            >
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="20">20</option>
            </select>

            <div class="flex gap-2 ml-2">
              <button
                class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-sm font-medium shadow-sm"
                [disabled]="s.page <= 0"
                (click)="prev()"
              >
                Anterior
              </button>

              <button
                class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-sm font-medium shadow-sm"
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
  private readonly facade = inject(AlbumFacade);

  readonly state$ = this.facade.state$;
  title = '';

  ngOnInit(): void {
    this.facade.refresh();
  }

  reload(): void {
    this.facade.refresh();
  }

  search(): void {
    this.facade.setTitle(this.title ?? '');
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

  changeSize(size: string | number): void {
    this.facade.setSize(Number(size));
    this.facade.setPage(0);
    this.facade.refresh();
  }
}

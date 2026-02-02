import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumFacade } from '../../core/albums/album.facade';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 class="text-xl font-semibold text-slate-900">Álbuns</h1>

        <div class="flex gap-2">
          <input
            class="w-full md:w-72 border rounded px-3 py-2"
            placeholder="Filtrar por título..."
            [(ngModel)]="title"
            (keyup.enter)="search()"
          />
          <button class="px-4 py-2 rounded bg-slate-900 text-white" (click)="search()">
            Buscar
          </button>
          <button class="px-4 py-2 rounded border" (click)="reload()">
            Atualizar
          </button>
        </div>
      </div>

      <div *ngIf="(state$ | async) as s">
        <div *ngIf="s.error" class="mb-3 p-3 rounded bg-red-50 text-red-800 border border-red-200">
          {{ s.error }}
        </div>

        <div class="bg-white border rounded overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-slate-700">
              <tr>
                <th class="text-left py-2 px-3 w-24">ID</th>
                <th class="text-left py-2 px-3">Título</th>
                <th class="text-left py-2 px-3 w-24">Capa</th>
                <th class="text-left py-2 px-3 w-44">Artistas</th>
                <th class="text-left py-2 px-3 w-48">Atualizado</th>
              </tr>
            </thead>

            <tbody>
              <tr *ngIf="s.loading">
                <td class="py-3 px-3" colspan="5">Carregando...</td>
              </tr>

              <tr *ngFor="let a of (s.data?.content ?? [])" class="border-t">
                <td class="py-2 px-3">{{ a.id }}</td>
                <td class="py-2 px-3">{{ a.title }}</td>

                <td class="py-2 px-3">
                  <a
                    *ngIf="a.coverUrl; else noCover"
                    class="text-blue-600 hover:underline"
                    [href]="a.coverUrl"
                    target="_blank"
                    rel="noreferrer"
                  >ver</a>
                  <ng-template #noCover>—</ng-template>
                </td>

                <td class="py-2 px-3">{{ a.artistIds.join(', ') }}</td>

                <td class="py-2 px-3">
                  {{ a.updatedAt ? (a.updatedAt | date: 'short') : '-' }}
                </td>
              </tr>

              <tr *ngIf="!s.loading && (s.data?.content?.length ?? 0) === 0" class="border-t">
                <td class="py-3 px-3" colspan="5">Nenhum álbum encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
          <div class="text-sm text-slate-700">
            Total: <b>{{ s.data?.totalElements ?? 0 }}</b>
            | Página: <b>{{ s.page + 1 }}</b> / <b>{{ s.data?.totalPages ?? 1 }}</b>
          </div>

          <div class="flex items-center gap-2">
            <select
              class="border rounded px-2 py-2"
              [ngModel]="s.size"
              (ngModelChange)="changeSize($event)"
            >
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
            </select>

            <button
              class="px-3 py-2 rounded border"
              [disabled]="s.page <= 0"
              (click)="prev()"
            >
              Anterior
            </button>

            <button
              class="px-3 py-2 rounded border"
              [disabled]="s.page >= ((s.data?.totalPages ?? 1) - 1)"
              (click)="next()"
            >
              Próxima
            </button>
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

  changeSize(size: number): void {
    this.facade.setSize(Number(size));
    this.facade.setPage(0);
    this.facade.refresh();
  }
}

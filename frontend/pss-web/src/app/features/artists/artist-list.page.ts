import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArtistFacade } from '../../core/artists/artist.facade';

@Component({
  standalone: true,
  selector: 'app-artist-list',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 class="text-xl font-semibold text-slate-900">Artistas</h1>

        <div class="flex gap-2">
          <input
            class="w-full md:w-72 border rounded px-3 py-2 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Pesquisar por nome..."
            [(ngModel)]="name"
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
                  <th class="text-left py-3 px-4 w-24">ID</th>
                  <th class="text-left py-3 px-4">Nome</th>
                  <th class="text-left py-3 px-4 w-40">Total de álbuns</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                <tr *ngIf="s.loading">
                  <td class="py-6 px-4 text-center text-slate-500" colspan="3">
                    <span class="inline-block animate-pulse">Carregando artistas...</span>
                  </td>
                </tr>

                <tr
                  *ngFor="let a of (s.data?.content ?? [])"
                  class="hover:bg-slate-50 transition-colors group cursor-pointer"
                  [routerLink]="['/artists', a.id]"
                >
                  <td class="py-3 px-4 text-slate-500 font-mono text-xs">{{ a.id }}</td>
                  <td class="py-3 px-4 font-medium text-slate-900">{{ a.name }}</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {{ a.albumCount || 0 }} álbuns
                    </span>
                  </td>
                </tr>

                <tr *ngIf="!s.loading && (s.data?.content?.length ?? 0) === 0" class="border-t">
                  <td class="py-10 px-4 text-center text-slate-400" colspan="3">
                    Nenhum artista encontrado para esta pesquisa.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 px-1">
          <div class="text-sm text-slate-600">
            Mostrando <b>{{ s.data?.content?.length ?? 0 }}</b> de <b>{{ s.data?.totalElements ?? 0 }}</b> artistas
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
export class ArtistListPage implements OnInit {
  private facade = inject(ArtistFacade);

  state$ = this.facade.state$;
  name = '';

  ngOnInit(): void {
    this.facade.refresh();
  }

  reload(): void {
    this.facade.refresh();
  }

  search(): void {
    this.facade.setName(this.name);
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

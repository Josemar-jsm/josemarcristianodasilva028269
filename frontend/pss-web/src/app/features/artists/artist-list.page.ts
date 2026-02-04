import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArtistFacade } from '../../core/artists/artist.facade';

@Component({
  standalone: true,
  selector: 'app-artist-list',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 md:p-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gerenciamento de Artistas</h1>

        <a
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          routerLink="/artists/new"
        >
          <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Novo artista</span>
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
                placeholder="Pesquisar por nome..."
                [(ngModel)]="name"
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

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th class="text-left py-4 px-4 w-24">ID</th>
                  <th class="text-left py-4 px-4">Nome</th>
                  <th class="text-left py-4 px-4 w-40">Álbuns</th>
                  <th class="w-28 text-right pr-4">Ações</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                <tr *ngIf="s.loading">
                  <td class="py-10 px-4 text-center text-slate-500" colspan="4">
                    <span class="inline-block animate-pulse text-lg">Carregando artistas...</span>
                  </td>
                </tr>

                <tr
                  *ngFor="let a of (s.data?.content ?? [])"
                  class="hover:bg-slate-50 transition-colors group"
                >
                  <td class="py-3 px-4 text-slate-500 font-mono text-xs">{{ a.id }}</td>
                  <td class="py-3 px-4 font-medium text-slate-900">{{ a.name }}</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {{ a.albumCount || 0 }}
                    </span>
                  </td>

                  <td class="py-2 px-3 text-right">
                    <div class="flex justify-end gap-2" (click)="$event.stopPropagation()">

                      <button
                        class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors shadow-sm cursor-pointer"
                        title="Ver detalhes do artista"
                        (click)="goDetail(a.id)"
                      >
                        <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>

                      <a
                        class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                        [routerLink]="['/artists', a.id, 'edit']"
                        title="Editar artista"
                      >
                        <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="!s.loading && (s.data?.content?.length ?? 0) === 0" class="border-t">
                  <td class="py-10 px-4 text-center text-slate-400 text-base" colspan="4">
                    Nenhum artista encontrado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginação -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <div class="text-sm text-slate-600">
            Mostrando <b>{{ s.data?.content?.length ?? 0 }}</b> de <b>{{ s.data?.totalElements ?? 0 }}</b> artistas
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs font-medium text-slate-500">Itens/página:</label>
            <select
              class="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm outline-none focus:border-blue-500"
              [ngModel]="s.size"
              (ngModelChange)="changeSize($event)"
            >
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
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
export class ArtistListPage implements OnInit {
  private readonly facade = inject(ArtistFacade);
  private readonly router = inject(Router);

  state$ = this.facade.state$;
  name = '';

  ngOnInit(): void {
    this.facade.refresh();
  }

  goDetail(id: number): void {
    this.router.navigate(['/artists', id]);
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

  changeSize(size: number): void {
    this.facade.setSize(size);
    this.facade.setPage(0);
    this.facade.refresh();
  }
}

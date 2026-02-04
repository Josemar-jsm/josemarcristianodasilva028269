import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ArtistFormFacade } from '../../core/artists/artist-form.facade';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div *ngIf="showSuccess"
           class="fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-lg transition-all"
           role="alert">
        <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        <div class="ms-3 text-sm font-medium">Artista salvo com sucesso!</div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">
            {{ isEdit ? 'Editar artista' : 'Novo artista' }}
          </h1>
          <p class="text-sm text-slate-600">Preencha os dados e salve.</p>
        </div>
        <button
        (click)="back()"
        class="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
         </button>
      </div>

      <ng-container *ngIf="facade.state$ | async as s">
        <div *ngIf="s.error" class="mb-3 p-3 rounded bg-red-50 text-red-800 border border-red-200">
          {{ s.error }}
        </div>

        <div *ngIf="s.loading" class="animate-pulse bg-slate-100 h-32 rounded mb-4"></div>

        <div *ngIf="!s.loading" class="bg-white border rounded-xl shadow-sm p-6">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <label class="block text-sm font-medium text-slate-700 mb-1">Nome do Artista</label>
            <input
              class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ex: Chico Gil"
              formControlName="name"
            />

            <div class="mt-2 text-xs text-red-600" *ngIf="form.controls.name.touched && form.controls.name.invalid">
              O nome deve ter pelo menos 2 caracteres.
            </div>

            <div class="mt-6 flex gap-3">
              <button
                class="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                [disabled]="s.saving || form.invalid"
                type="submit"
              >
                <span *ngIf="s.saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ s.saving ? 'Salvando...' : 'Salvar Artista' }}
              </button>

              <button class="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                      type="button"
                      (click)="back()">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </ng-container>
    </div>
  `,
})
export class ArtistFormPage implements OnInit, OnDestroy {
  readonly facade = inject(ArtistFormFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly destroy$ = new Subject<void>();

  isEdit = false;
  showSuccess = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && !Number.isNaN(id)) {
      this.isEdit = true;
      this.facade.initEdit(id);

      this.facade.state$
        .pipe(takeUntil(this.destroy$))
        .subscribe(s => {
          if (s.data && this.form.controls.name.pristine) {
            this.form.patchValue({ name: s.data.name }, { emitEvent: false });
          }
        });
    } else {
      this.facade.initCreate();
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const { name } = this.form.getRawValue();

    this.facade.save(name, () => {
      this.showSuccess = true;

      setTimeout(() => {
        this.showSuccess = false;
        this.back();
      }, 2000);
    });
  }

  back(): void {
    this.router.navigateByUrl('/artists');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

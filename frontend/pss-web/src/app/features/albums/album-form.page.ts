import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AlbumFormFacade } from '../../core/albums/album-form.facade';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-4">
      <div *ngIf="showSuccess"
           class="fixed top-4 right-4 z-50 flex items-center p-4 text-green-800 rounded-xl bg-green-50 border border-green-200 shadow-xl animate-in fade-in slide-in-from-top-4 transition-all">
        <div class="bg-green-500 text-white p-1 rounded-full mr-3">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>
        <span class="font-medium text-sm">{{ successMessage }}</span>
      </div>

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ isEdit ? 'Editar Álbum' : 'Novo Álbum' }}</h1>
          <p class="text-sm text-slate-500">Gerencie títulos, artistas e arte da capa.</p>
        </div>
      <button
        (click)="back()"
        class="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
      </div>

      <ng-container *ngIf="(facade.state$ | async) as s">
        <div *ngIf="s.error" class="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
          {{ s.error }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Dados do Álbum -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <form [formGroup]="form" (ngSubmit)="save()">
                <div class="mb-8">
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Título do Álbum</label>
                  <input
                    class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: Chico Gil"
                    formControlName="title"
                  />
                </div>

                <div class="border-t border-slate-100 pt-6">
                  <label class="block text-sm font-semibold text-slate-700 mb-4">Artistas</label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      type="button"
                      *ngFor="let a of s.artists"
                      (click)="toggleArtist(a.id)"
                      class="flex items-center justify-between p-4 rounded-xl border transition-all text-left"
                      [class]="s.artistIds.includes(a.id) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'"
                    >
                      <span class="font-medium truncate">{{ a.name }}</span>
                    </button>
                  </div>
                </div>

                <div class="mt-10 pt-6 border-t border-slate-100">
                  <button
                    class="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 cursor-pointer"
                    [disabled]="s.saving || form.invalid || s.artistIds.length === 0"
                    type="submit"
                  >
                    <span *ngIf="s.saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ s.saving ? 'Salvando...' : 'Salvar Informações' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Capa e Upload -->
          <div class="space-y-6">
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 class="font-bold text-slate-900 mb-6 tracking-tight">Capa do Álbum</h3>

              <div class="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                <img *ngIf="tempUrl || s.coverPreviewUrl; else noCover"
                     [src]="tempUrl || s.coverPreviewUrl"
                     class="w-full h-full object-cover animate-in fade-in duration-500" />
                <ng-template #noCover>
                  <div class="text-slate-400 text-center">
                    <svg class="mx-auto w-12 h-12 opacity-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Aguardando Imagem</span>
                  </div>
                </ng-template>
              </div>

              <div *ngIf="selectedFile" class="mt-4 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                <span class="text-blue-500 font-bold text-xs">DOC:</span>
                <span class="text-blue-900 text-[11px] truncate font-medium">{{ selectedFile.name }}</span>
              </div>

              <div class="mt-6 space-y-3">
                <input type="file" id="coverUpload" accept="image/*" class="hidden" (change)="onFileChange($event)" />
                <label for="coverUpload" class="block w-full text-center px-4 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                  {{ selectedFile ? 'Substituir Seleção' : 'Selecionar Capa' }}
                </label>

                <button
                  class="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-40 hover:bg-slate-800 transition-all flex justify-center gap-2 shadow-lg shadow-slate-200 cursor-pointer"
                  (click)="upload()"
                  [disabled]="!selectedFile || s.uploading || !s.album?.id"
                >
                  <span *ngIf="s.uploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {{ s.uploading ? 'Enviando...' : 'Fazer Upload' }}
                </button>

                <button
                  *ngIf="s.coverPreviewUrl && !selectedFile"
                  type="button"
                  class="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  (click)="removeCover()"
                  [disabled]="s.uploading"
                >
                  Remover imagem atual
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class AlbumFormPage implements OnInit, OnDestroy {
  readonly facade = inject(AlbumFormFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroy$ = new Subject<void>();

  isEdit = false;
  showSuccess = false;
  successMessage = '';
  selectedFile: File | null = null;
  tempUrl: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isEdit = true;
      this.facade.initEdit(id);
      this.facade.state$.pipe(takeUntil(this.destroy$)).subscribe(s => {
        if (s.title && this.form.controls.title.pristine) {
          this.form.patchValue({ title: s.title }, { emitEvent: false });
        }
      });
    } else {
      this.facade.initCreate();
    }
  }

  toggleArtist(id: number): void {
    this.facade.toggleArtist(id);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      // Cria o preview em tempo real
      this.tempUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  private triggerSuccess(msg: string, redirect = false): void {
    this.successMessage = msg;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
      if (redirect) this.back();
    }, redirect ? 1500 : 3000);
  }

  save(): void {
    if (this.form.invalid) return;
    this.facade.setTitle(this.form.controls.title.value);
    this.facade.save(() => this.triggerSuccess('Álbum salvo com sucesso!'));
  }

  upload(): void {
    if (this.selectedFile) {
      this.facade.uploadCover(this.selectedFile, () => {
        this.tempUrl = null;
        this.triggerSuccess('Imagem enviada! Redirecionando...', true);
      });
      this.selectedFile = null;
    }
  }

  removeCover(): void {
    if (confirm('Deseja remover a imagem de capa atual?')) {
      this.facade.removeCover(() => {
        this.tempUrl = null;
        this.triggerSuccess('Imagem removida com sucesso!');
      });
    }
  }

  back(): void {
    this.router.navigateByUrl('/albums');
  }

  ngOnDestroy(): void {
    if (this.tempUrl) URL.revokeObjectURL(this.tempUrl);
    this.destroy$.next();
    this.destroy$.complete();
  }
}

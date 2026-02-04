import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiHttp } from '../api/api.http';
import { PageResponse } from '../shared/page.model';
import {
  AlbumResponse,
  AlbumCreateRequest,
  AlbumUpdateRequest
} from './album.model';

@Injectable({ providedIn: 'root' })
export class AlbumApi {
  private readonly api = inject(ApiHttp);
  private readonly base = '/v1/albums';

  list(params: { title?: string; page: number; size: number; sort?: string }): Observable<PageResponse<AlbumResponse>> {
    return this.api.get<PageResponse<AlbumResponse>>(this.base, params);
  }

  getById(id: number): Observable<AlbumResponse> {
    return this.api.get<AlbumResponse>(`${this.base}/${id}`);
  }

  create(payload: AlbumCreateRequest): Observable<AlbumResponse> {
    return this.api.post<AlbumResponse>(this.base, payload);
  }

  update(id: number, payload: AlbumUpdateRequest): Observable<AlbumResponse> {
    return this.api.put<AlbumResponse>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }

  uploadCover(albumId: number, file: File): Observable<{ albumId: number; objectKey: string; url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.api.post<{ albumId: number; objectKey: string; url: string }>(
      `${this.base}/${albumId}/cover`,
      form
    );
  }

  deleteCover(albumId: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${albumId}/cover`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../shared/page.model';
import {
  ArtistResponse,
  ArtistCreateRequest,
  ArtistUpdateRequest
} from './artist.model';

@Injectable({ providedIn: 'root' })
export class ArtistApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUi = '/v1/ui/artists';
  private readonly base = ' /v1/artists';


  list(name: string | null, page: number, size: number): Observable<PageResponse<ArtistResponse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', 'id,asc');

    if (name?.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<PageResponse<ArtistResponse>>(`${this.baseUi}`, { params });
  }

  getById(id: number): Observable<ArtistResponse> {
    return this.http.get<ArtistResponse>(`${this.baseUi}/${id}`);
  }

  create(payload: ArtistCreateRequest): Observable<ArtistResponse> {
    return this.http.post<ArtistResponse>(this.base, payload);
  }

  update(id: number, payload: ArtistUpdateRequest): Observable<ArtistResponse> {
    return this.http.put<ArtistResponse>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

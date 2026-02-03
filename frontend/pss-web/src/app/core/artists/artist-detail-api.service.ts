import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ArtistDetailResponse } from './artist-detail.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArtistDetailApiService {
  private readonly baseUrl = '/v1/ui/artists';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<ArtistDetailResponse> {
    return this.http.get<ArtistDetailResponse>(`${this.baseUrl}/${id}`);
  }
}

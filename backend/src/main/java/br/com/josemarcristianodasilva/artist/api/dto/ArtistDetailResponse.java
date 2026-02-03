package br.com.josemarcristianodasilva.artist.api.dto;

import java.util.List;

public record ArtistDetailResponse(
        Long id,
        String name,
        long albumCount,
        List<ArtistAlbumItemResponse> albums
) {}

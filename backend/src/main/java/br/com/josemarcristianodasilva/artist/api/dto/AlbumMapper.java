package br.com.josemarcristianodasilva.artist.api.dto;

import br.com.josemarcristianodasilva.artist.domain.model.Album;

import java.util.stream.Collectors;

public final class AlbumMapper {
    private AlbumMapper() {}

    public static AlbumResponse toResponse(Album a, String coverUrl) {
        var ids = a.getArtists().stream().map(art -> art.getId()).collect(Collectors.toSet());
        return new AlbumResponse(
                a.getId(),
                a.getTitle(),
                coverUrl,
                ids,
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}

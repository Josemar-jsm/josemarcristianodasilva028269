package br.com.josemarcristianodasilva.artist.api.dto;

import br.com.josemarcristianodasilva.artist.domain.model.Artist;

public final class ArtistMapper {

    private ArtistMapper() {}

    public static ArtistResponse toResponse(Artist a) {
        return new ArtistResponse(
                a.getId(),
                a.getName(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}

package br.com.josemarcristianodasilva.artist.api.dto;

public record ArtistListItemResponse(
        Long id,
        String name,
        long albumCount
) {}

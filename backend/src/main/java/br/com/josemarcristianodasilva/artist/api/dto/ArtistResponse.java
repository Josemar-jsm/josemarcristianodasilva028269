package br.com.josemarcristianodasilva.artist.api.dto;

import java.time.Instant;

public record ArtistResponse(
        Long id,
        String name,
        Instant createdAt,
        Instant updatedAt
) {}

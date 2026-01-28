package br.com.josemarcristianodasilva.artist.api.dto;

import java.time.Instant;
import java.util.Set;

public record AlbumResponse(
        Long id,
        String title,
        String coverObjectKey,
        Set<Long> artistIds,
        Instant createdAt,
        Instant updatedAt
) {}

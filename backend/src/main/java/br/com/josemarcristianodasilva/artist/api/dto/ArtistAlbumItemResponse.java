package br.com.josemarcristianodasilva.artist.api.dto;

import java.time.Instant;
import java.util.Set;

public record ArtistAlbumItemResponse(
        Long id,
        String title,
        String coverUrl,
        Set<Long> artistIds,
        Instant createdAt,
        Instant updatedAt
) {}

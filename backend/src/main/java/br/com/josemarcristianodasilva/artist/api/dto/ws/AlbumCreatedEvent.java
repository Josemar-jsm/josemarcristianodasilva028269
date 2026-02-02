package br.com.josemarcristianodasilva.artist.api.dto.ws;

import java.time.Instant;

public record AlbumCreatedEvent(
        String type,
        Long id,
        String title,
        Instant createdAt
) {}

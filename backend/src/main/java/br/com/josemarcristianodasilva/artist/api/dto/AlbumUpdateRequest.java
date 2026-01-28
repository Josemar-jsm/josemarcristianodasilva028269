package br.com.josemarcristianodasilva.artist.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record AlbumUpdateRequest(
        @NotBlank(message = "title is required")
        @Size(min = 2, max = 200, message = "title must have between 2 and 200 characters")
        String title,
        Set<Long> artistIds
) {}

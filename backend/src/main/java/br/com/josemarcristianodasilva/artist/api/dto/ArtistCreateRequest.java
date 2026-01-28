package br.com.josemarcristianodasilva.artist.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ArtistCreateRequest(
        @NotBlank(message = "name is required")
        @Size(min = 2, max = 150, message = "name must have between 2 and 150 characters")
        String name
) {}

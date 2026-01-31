package br.com.josemarcristianodasilva.artist.api.dto.auth;

public record TokenResponse(
        String tokenType,
        String accessToken,
        long accessExpiresInSeconds,
        String refreshToken,
        long refreshExpiresInSeconds
) {}


package br.com.josemarcristianodasilva.artist.api.dto;

public record AlbumCoverResponse(
        Long albumId,
        String objectKey,
        String url
) {}


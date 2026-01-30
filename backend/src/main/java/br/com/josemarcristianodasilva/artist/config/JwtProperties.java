package br.com.josemarcristianodasilva.artist.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        String issuer,
        long accessTtlSeconds,
        long refreshTtlSeconds,
        String secret
) {}

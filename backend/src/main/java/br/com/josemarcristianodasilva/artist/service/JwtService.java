package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.config.JwtProperties;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class JwtService {

    private final JwtProperties props;
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public JwtService(JwtProperties props, JwtEncoder encoder, JwtDecoder decoder) {
        this.props = props;
        this.encoder = encoder;
        this.decoder = decoder;
    }

    public String createAccessToken(String subject, List<String> roles) {
        var now = Instant.now();
        var jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        var claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(props.accessTtlSeconds()))
                .subject(subject)
                .claim("roles", roles)
                .build();

        return encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createRefreshToken(String subject) {
        var now = Instant.now();
        var jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        var claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(props.refreshTtlSeconds()))
                .subject(subject)
                .claim("typ", "refresh")
                .build();

        return encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public Jwt decode(String token) {
        return decoder.decode(token);
    }

    public boolean isRefreshToken(Jwt jwt) {
        Object typ = jwt.getClaims().get("typ");
        return typ != null && "refresh".equals(typ.toString());
    }

    public long accessTtlSeconds() { return props.accessTtlSeconds(); }
    public long refreshTtlSeconds() { return props.refreshTtlSeconds(); }
}
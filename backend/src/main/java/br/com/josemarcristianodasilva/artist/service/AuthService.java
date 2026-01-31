package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.auth.TokenResponse;
import br.com.josemarcristianodasilva.artist.api.exception.BadRequestException;
import br.com.josemarcristianodasilva.artist.domain.model.User;
import br.com.josemarcristianodasilva.artist.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional(readOnly = true)
    public TokenResponse login(String username, String password) {
        User u = users.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!u.isEnabled()) {
            throw new BadRequestException("User disabled");
        }
        if (!encoder.matches(password, u.getPasswordHash())) {
            throw new BadRequestException("Invalid username or password");
        }
        List<String> roles = (u.getRoles() == null)
                ? List.of()
                : u.getRoles().stream()
                .map(Object::toString)
                .toList();

        String accessToken = jwt.createAccessToken(u.getUsername(), roles);
        String refreshToken = jwt.createRefreshToken(u.getUsername());

        return new TokenResponse(
                "Bearer",
                accessToken,
                jwt.accessTtlSeconds(),
                refreshToken,
                jwt.refreshTtlSeconds()
        );

    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        var decoded = jwt.decode(refreshToken);
        if (!jwt.isRefreshToken(decoded)) {
            throw new BadRequestException("Invalid refresh token");
        }

        var subject = decoded.getSubject();
        User u = users.findByUsername(subject)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (!u.isEnabled()) {
            throw new BadRequestException("User disabled");
        }
        List<String> roles = (u.getRoles() == null)
                ? List.of()
                : u.getRoles().stream()
                .map(Object::toString)
                .toList();

        String newAccessToken = jwt.createAccessToken(u.getUsername(), roles);

        return new TokenResponse(
                "Bearer",
                newAccessToken,
                jwt.accessTtlSeconds(),
                refreshToken,
                jwt.refreshTtlSeconds()
        );
    }
}

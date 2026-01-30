package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.auth.LoginRequest;
import br.com.josemarcristianodasilva.artist.api.dto.auth.RefreshRequest;
import br.com.josemarcristianodasilva.artist.api.dto.auth.TokenResponse;
import br.com.josemarcristianodasilva.artist.api.exception.BadRequestException;
import br.com.josemarcristianodasilva.artist.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Auth", description = "Authentication endpoints")
@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final JwtService jwtService;
    private final PasswordEncoder encoder;

    public AuthController(JwtService jwtService, PasswordEncoder encoder) {
        this.jwtService = jwtService;
        this.encoder = encoder;
    }

    @Operation(summary = "Login", description = "Returns access and refresh tokens.")
    @PostMapping("/login")
    public TokenResponse login(@Valid @org.springframework.web.bind.annotation.RequestBody LoginRequest req) {
        String username = "admin";
        String passwordHash = encoder.encode("admin123");

        if (!username.equals(req.username()) || !encoder.matches(req.password(), passwordHash)) {
            throw new BadRequestException("Invalid username or password");
        }

        var roles = List.of("ADMIN");
        var access = jwtService.createAccessToken(username, roles);
        var refresh = jwtService.createRefreshToken(username);

        return new TokenResponse("Bearer", access, 900, refresh, 604800);
    }

    @Operation(summary = "Refresh", description = "Generates a new access token using a refresh token.")
    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @org.springframework.web.bind.annotation.RequestBody RefreshRequest req) {
        var jwt = jwtService.decode(req.refreshToken());
        if (!jwtService.isRefreshToken(jwt)) {
            throw new BadRequestException("Invalid refresh token");
        }

        var subject = jwt.getSubject();
        var access = jwtService.createAccessToken(subject, List.of("ADMIN"));

        return new TokenResponse("Bearer", access, 900, req.refreshToken(), 604800);
    }
}

package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.auth.LoginRequest;
import br.com.josemarcristianodasilva.artist.api.dto.auth.RefreshRequest;
import br.com.josemarcristianodasilva.artist.api.dto.auth.TokenResponse;
import br.com.josemarcristianodasilva.artist.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Authentication endpoints")
@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @Operation(summary = "Login", description = "Returns access and refresh tokens.")
    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody  LoginRequest req) {
        return auth.login(req.username(), req.password());
    }

    @Operation(summary = "Refresh", description = "Generates a new access token using a refresh token.")
    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return auth.refresh(req.refreshToken());
    }
}

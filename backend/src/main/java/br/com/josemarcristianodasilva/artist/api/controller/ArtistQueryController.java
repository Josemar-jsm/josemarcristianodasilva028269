package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.ArtistDetailResponse;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistListItemResponse;
import br.com.josemarcristianodasilva.artist.api.dto.PageResponse;
import br.com.josemarcristianodasilva.artist.service.ArtistQueryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Artists (UI)", description = "Endpoints for UI screens (albumCount + detail)")
@RestController
@RequestMapping("/v1/ui/artists")
public class ArtistQueryController {

    private final ArtistQueryService service;

    public ArtistQueryController(ArtistQueryService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public PageResponse<ArtistListItemResponse> list(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return PageResponse.from(service.list(name, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ArtistDetailResponse detail(@PathVariable Long id) {
        return service.detail(id);
    }
}

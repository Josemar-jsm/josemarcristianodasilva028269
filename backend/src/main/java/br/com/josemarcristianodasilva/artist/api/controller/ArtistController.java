package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.ArtistCreateRequest;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistMapper;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistResponse;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistUpdateRequest;
import br.com.josemarcristianodasilva.artist.service.ArtistService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/v1/artists")
public class ArtistController {

    private final ArtistService service;

    public ArtistController(ArtistService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ArtistResponse> list(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.list(name, pageable).map(ArtistMapper::toResponse);
    }

    @GetMapping("/{id}")
    public ArtistResponse get(@PathVariable Long id) {
        return ArtistMapper.toResponse(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ArtistResponse> create(
            @Valid @RequestBody ArtistCreateRequest req,
            UriComponentsBuilder uri
    ) {
        var saved = service.create(req.name());
        var location = uri.path("/v1/artists/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(ArtistMapper.toResponse(saved));
    }

    @PutMapping("/{id}")
    public ArtistResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ArtistUpdateRequest req
    ) {
        return ArtistMapper.toResponse(service.update(id, req.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

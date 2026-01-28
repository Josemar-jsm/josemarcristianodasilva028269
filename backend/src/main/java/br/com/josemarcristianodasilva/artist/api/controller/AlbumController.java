package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.*;
import br.com.josemarcristianodasilva.artist.service.AlbumService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/v1/albums")
public class AlbumController {

    private final AlbumService service;

    public AlbumController(AlbumService service) {
        this.service = service;
    }

    @GetMapping
    public Page<AlbumResponse> list(
            @RequestParam(required = false) String title,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.list(title, pageable).map(AlbumMapper::toResponse);
    }

    @GetMapping("/{id}")
    public AlbumResponse get(@PathVariable Long id) {
        return AlbumMapper.toResponse(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<AlbumResponse> create(
            @Valid @RequestBody AlbumCreateRequest req,
            UriComponentsBuilder uri
    ) {
        var saved = service.create(req.title(), req.artistIds());
        var location = uri.path("/v1/albums/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(AlbumMapper.toResponse(saved));
    }

    @PutMapping("/{id}")
    public AlbumResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AlbumUpdateRequest req
    ) {
        return AlbumMapper.toResponse(service.update(id, req.title(), req.artistIds()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/{id}/cover")
    public ResponseEntity<AlbumCoverResponse> uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.uploadCover(id, file));
    }

    @GetMapping("/{id}/cover-url")
    public ResponseEntity<String> getCoverUrl(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCoverUrl(id));
    }


}

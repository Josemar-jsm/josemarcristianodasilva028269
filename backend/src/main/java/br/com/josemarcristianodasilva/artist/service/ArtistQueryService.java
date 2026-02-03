package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.ArtistAlbumItemResponse;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistDetailResponse;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistListItemResponse;
import br.com.josemarcristianodasilva.artist.api.dto.AlbumMapper;
import br.com.josemarcristianodasilva.artist.api.exception.ResourceNotFoundException;
import br.com.josemarcristianodasilva.artist.repository.AlbumRepository;
import br.com.josemarcristianodasilva.artist.repository.ArtistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArtistQueryService {

    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final MinioStorageService minioStorageService;

    public ArtistQueryService(
            ArtistRepository artistRepository,
            AlbumRepository albumRepository,
            MinioStorageService minioStorageService
    ) {
        this.artistRepository = artistRepository;
        this.albumRepository = albumRepository;
        this.minioStorageService = minioStorageService;
    }

    @Transactional(readOnly = true)
    public Page<ArtistListItemResponse> list(String name, Pageable pageable) {
        String filter = (name == null || name.isBlank()) ? null : name;
        return artistRepository.findWithAlbumCount(filter, pageable)
                .map(p -> new ArtistListItemResponse(p.getId(), p.getName(), p.getAlbumCount()));
    }

    @Transactional(readOnly = true)
    public ArtistDetailResponse detail(Long id) {
        var artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found: " + id));

        long albumCount = (artist.getAlbums() == null) ? 0 : artist.getAlbums().size();

        List<ArtistAlbumItemResponse> albums = albumRepository.findAllByArtistId(id).stream()
                .map(a -> {
                    String key = a.getCoverObjectKey();
                    String coverUrl = (key == null || key.isBlank()) ? null : minioStorageService.presignedGetUrl(key);
                    var r = AlbumMapper.toResponse(a, coverUrl);
                    return new ArtistAlbumItemResponse(r.id(), r.title(), r.coverUrl(), r.artistIds(), r.createdAt(), r.updatedAt());
                })
                .toList();

        return new ArtistDetailResponse(artist.getId(), artist.getName(), albumCount, albums);
    }
}

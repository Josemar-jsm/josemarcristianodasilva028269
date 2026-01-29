package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.AlbumCoverResponse;
import br.com.josemarcristianodasilva.artist.api.exception.ResourceNotFoundException;
import br.com.josemarcristianodasilva.artist.config.UploadProperties;
import br.com.josemarcristianodasilva.artist.domain.model.Album;
import br.com.josemarcristianodasilva.artist.repository.AlbumRepository;
import br.com.josemarcristianodasilva.artist.repository.ArtistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final MinioStorageService minioStorageService;

    private final UploadProperties uploadProperties;

    public AlbumService(AlbumRepository albumRepository, ArtistRepository artistRepository, MinioStorageService minioStorageService, UploadProperties uploadProperties) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.minioStorageService = minioStorageService;
        this.uploadProperties = uploadProperties;
    }

    @Transactional(readOnly = true)
    public Page<Album> list(String title, Pageable pageable) {
        if (title == null || title.isBlank()) {
            return albumRepository.findAll(pageable);
        }
        return albumRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Transactional(readOnly = true)
    public Album getById(Long id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));
    }

    @Transactional
    public Album create(String title, Set<Long> artistIds) {
        var album = new Album(title);
        applyArtists(album, artistIds);
        return albumRepository.save(album);
    }

    @Transactional
    public Album update(Long id, String title, Set<Long> artistIds) {
        var album = getById(id);
        album.setTitle(title);
        applyArtists(album, artistIds);
        return albumRepository.save(album);
    }

    @Transactional
    public void delete(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new IllegalArgumentException("Album not found: " + id);
        }
        albumRepository.deleteById(id);
    }
    @Transactional
    public void deleteCover(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

        String key = album.getCoverObjectKey();
        if (key == null || key.isBlank()) {
            throw new ResourceNotFoundException("Album cover not found: " + albumId);
        }
        minioStorageService.deleteIfExists(key);
        album.setCoverObjectKey(null);
        albumRepository.save(album);
    }

    private void applyArtists(Album album, Set<Long> artistIds) {
        album.getArtists().clear();

        if (artistIds == null || artistIds.isEmpty()) {
            return;
        }

        var artists = new HashSet<>(artistRepository.findAllById(artistIds));
        if (artists.size() != artistIds.size()) {
            throw new IllegalArgumentException("One or more artistIds are invalid.");
        }
        album.getArtists().addAll(artists);
    }
    @Transactional
    public AlbumCoverResponse uploadCover(Long albumId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        if (file.getSize() > uploadProperties.getMaxBytes()) {
            throw new IllegalArgumentException("File too large. Max bytes: " + uploadProperties.getMaxBytes());
        }

        String ct = file.getContentType();
        if (ct == null || !(ct.equals("image/jpeg") || ct.equals("image/png") || ct.equals("image/webp"))) {
            throw new IllegalArgumentException("Invalid file type. Allowed: image/jpeg, image/png, image/webp");
        }

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

        String oldKey = album.getCoverObjectKey();

        // OBJECT KEY SEGURO (produção)
        String ext = switch (ct) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };

        String objectKey = "albums/%d/cover/%s%s"
                .formatted(albumId, UUID.randomUUID(), ext);

        minioStorageService.upload(file, objectKey);

        album.setCoverObjectKey(objectKey);
        albumRepository.save(album);

        if (oldKey != null && !oldKey.isBlank() && !oldKey.equals(objectKey)) {
            minioStorageService.deleteIfExists(oldKey);
        }

        return new AlbumCoverResponse(
                album.getId(),
                objectKey,
                minioStorageService.presignedGetUrl(objectKey)
        );
    }

    @Transactional(readOnly = true)
    public String getCoverUrl(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

        if (album.getCoverObjectKey() == null || album.getCoverObjectKey().isBlank()) {
            throw new ResourceNotFoundException("Album cover not found: " + albumId);
        }

        return minioStorageService.presignedGetUrl(album.getCoverObjectKey());
    }
}

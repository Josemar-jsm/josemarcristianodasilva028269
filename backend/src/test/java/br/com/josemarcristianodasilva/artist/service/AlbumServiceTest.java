package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.AlbumCoverResponse;
import br.com.josemarcristianodasilva.artist.api.dto.AlbumResponse;
import br.com.josemarcristianodasilva.artist.api.exception.ResourceNotFoundException;
import br.com.josemarcristianodasilva.artist.config.UploadProperties;
import br.com.josemarcristianodasilva.artist.domain.model.Album;
import br.com.josemarcristianodasilva.artist.domain.model.Artist;
import br.com.josemarcristianodasilva.artist.repository.AlbumRepository;
import br.com.josemarcristianodasilva.artist.repository.ArtistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

    @Mock private AlbumRepository albumRepository;
    @Mock private ArtistRepository artistRepository;
    @Mock private MinioStorageService minioStorageService;
    @Mock private UploadProperties uploadProperties;

    @Mock private AlbumEventPublisher albumEventPublisher;
    @Mock private MultipartFile multipartFile;

    private AlbumService service;

    @BeforeEach
    void setup() {
        service = new AlbumService(
                albumRepository,
                artistRepository,
                minioStorageService,
                uploadProperties,
                albumEventPublisher
        );
    }
    @Test
    void list_shouldReturnAlbumResponses() {
        Album album = new Album("Discovery");
        setId(album, 1L);
        album.setCoverObjectKey("key");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Album> page = new PageImpl<>(List.of(album));

        when(albumRepository.findAll(pageable)).thenReturn(page);
        when(minioStorageService.presignedGetUrl("key"))
                .thenReturn("http://minio/url");

        Page<AlbumResponse> result = service.list(null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Discovery", result.getContent().get(0).title());
        assertEquals("http://minio/url", result.getContent().get(0).coverUrl());
    }
    @Test
    void getById_shouldThrowNotFound() {
        when(albumRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getById_shouldReturnResponse() {
        Album album = new Album("RAM");
        setId(album, 1L);
        album.setCoverObjectKey("key");

        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(minioStorageService.presignedGetUrl("key"))
                .thenReturn("url");

        AlbumResponse res = service.getById(1L);

        assertEquals("RAM", res.title());
        assertEquals("url", res.coverUrl());
    }
    @Test
    void create_shouldSaveAlbum() {
        when(albumRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Album album = service.create("Discovery", Set.of());

        assertEquals("Discovery", album.getTitle());
        verify(albumRepository).save(any());
    }

    @Test
    void create_shouldAttachArtists() {
        Artist a = new Artist("Daft Punk");
        setId(a, 10L);

        when(artistRepository.findAllById(Set.of(10L)))
                .thenReturn(List.of(a));
        when(albumRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Album album = service.create("Discovery", Set.of(10L));

        assertEquals(1, album.getArtists().size());
    }
    @Test
    void update_shouldUpdateAlbum() {
        Album album = new Album("Old");
        setId(album, 1L);

        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(albumRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Album updated = service.update(1L, "New", Set.of());

        assertEquals("New", updated.getTitle());
    }
    @Test
    void delete_shouldThrowWhenNotFound() {
        when(albumRepository.existsById(1L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void delete_shouldDelete() {
        when(albumRepository.existsById(1L)).thenReturn(true);
        service.delete(1L);
        verify(albumRepository).deleteById(1L);
    }
    @Test
    void uploadCover_shouldUpload() {
        Album album = new Album("Discovery");
        setId(album, 1L);

        when(albumRepository.findById(1L))
                .thenReturn(Optional.of(album));
        when(uploadProperties.getMaxBytes()).thenReturn(1000L);
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(100L);
        when(multipartFile.getContentType())
                .thenReturn("image/jpeg");
        when(minioStorageService.presignedGetUrl(any()))
                .thenReturn("url");
        when(albumRepository.save(any()))
                .thenAnswer(i -> i.getArgument(0));

        AlbumCoverResponse res =
                service.uploadCover(1L, multipartFile);

        assertNotNull(res.url());
        verify(minioStorageService)
                .upload(eq(multipartFile), any());
    }
    @Test
    void getCoverUrl_shouldReturnUrl() {
        Album album = new Album("Discovery");
        setId(album, 1L);
        album.setCoverObjectKey("key");

        when(albumRepository.findById(1L))
                .thenReturn(Optional.of(album));
        when(minioStorageService.presignedGetUrl("key"))
                .thenReturn("url");

        String url = service.getCoverUrl(1L);

        assertEquals("url", url);
    }
    @Test
    void deleteCover_shouldDeleteAndNullKey() {
        Album album = new Album("Discovery");
        setId(album, 1L);
        album.setCoverObjectKey("key");

        when(albumRepository.findById(1L))
                .thenReturn(Optional.of(album));
        when(albumRepository.save(any()))
                .thenAnswer(i -> i.getArgument(0));

        service.deleteCover(1L);

        assertNull(album.getCoverObjectKey());
        verify(minioStorageService)
                .deleteIfExists("key");
    }
    private void setId(Object obj, Long id) {
        try {
            Field f = obj.getClass().getDeclaredField("id");
            f.setAccessible(true);
            f.set(obj, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

package java.br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.domain.repository.AlbumRepository;
import br.com.josemarcristianodasilva.artist.domain.repository.ArtistRepository;
import br.com.josemarcristianodasilva.artist.infra.MinioStorageService;
import br.com.josemarcristianodasilva.artist.infra.UploadProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

    @Mock
    AlbumRepository albumRepository;
    @Mock
    ArtistRepository artistRepository;
    @Mock
    MinioStorageService minio;
    @Mock
    UploadProperties uploadProps;

    @InjectMocks
    AlbumService service;

    @Test
    void list_withoutTitle_shouldCallFindAll() {

        Pageable pageable = PageRequest.of(0, 10);

        when(albumRepository.findAll(pageable)).thenReturn(Page.empty());

        var result = service.list(null, pageable);

        verify(albumRepository).findAll(pageable);
        assertNotNull(result);
    }
}
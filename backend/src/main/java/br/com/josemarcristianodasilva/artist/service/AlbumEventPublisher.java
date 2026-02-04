package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.ws.AlbumCreatedEvent;
import br.com.josemarcristianodasilva.artist.domain.model.Album;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AlbumEventPublisher {

    private final SimpMessagingTemplate messaging;

    public AlbumEventPublisher(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    public void publishAlbumCreated(Album album) {
        var event = new AlbumCreatedEvent(
                "album.created",
                album.getId(),
                album.getTitle(),
                Instant.now()
        );
        messaging.convertAndSend("/topic/albums", event);
    }
}

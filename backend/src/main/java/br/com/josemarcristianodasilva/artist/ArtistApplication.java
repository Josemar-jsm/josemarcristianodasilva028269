package br.com.josemarcristianodasilva.artist;

import br.com.josemarcristianodasilva.artist.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({CorsProperties.class})
public class ArtistApplication {

	public static void main(String[] args) {

		SpringApplication.run(ArtistApplication.class, args);
	}

}

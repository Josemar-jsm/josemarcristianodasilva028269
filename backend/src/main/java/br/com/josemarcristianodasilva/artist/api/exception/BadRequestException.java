package br.com.josemarcristianodasilva.artist.api.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}

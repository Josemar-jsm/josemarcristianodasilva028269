package br.com.josemarcristianodasilva.artist.api.exception;

public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) { super(message); }
}

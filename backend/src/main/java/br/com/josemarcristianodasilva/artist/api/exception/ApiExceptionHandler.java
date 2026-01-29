package br.com.josemarcristianodasilva.artist.api.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return baseProblem(HttpStatus.NOT_FOUND, "Resource not found", ex.getMessage(), req, URI.create("urn:problem:not-found"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ProblemDetail handleBadRequest(BadRequestException ex, HttpServletRequest req) {
        return baseProblem(HttpStatus.BAD_REQUEST, "Bad request", ex.getMessage(), req, URI.create("urn:problem:bad-request"));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ProblemDetail handleBusinessRule(BusinessRuleException ex, HttpServletRequest req) {
        return baseProblem(HttpStatus.CONFLICT, "Business rule violation", ex.getMessage(), req, URI.create("urn:problem:conflict"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArg(IllegalArgumentException ex, HttpServletRequest req) {
        return baseProblem(HttpStatus.BAD_REQUEST, "Bad request", ex.getMessage(), req, URI.create("urn:problem:bad-request"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        var errors = ex.getBindingResult().getFieldErrors().stream().collect(Collectors.toMap(fe -> fe.getField(), fe -> fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage(), (a, b) -> a, LinkedHashMap::new));

        var pd = baseProblem(HttpStatus.BAD_REQUEST, "Validation error", "One or more fields are invalid.", req, URI.create("urn:problem:validation"));

        pd.setProperty("errors", errors);
        return pd;
    }

    private ProblemDetail baseProblem(HttpStatus status, String title, String detail, HttpServletRequest req, URI type) {
        var pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle(title);
        pd.setType(type);
        pd.setInstance(URI.create(req.getRequestURI()));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}

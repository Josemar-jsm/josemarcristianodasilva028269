
package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.config.MinioProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Service
public class MinioStorageService {

    private final MinioClient minioClient;
    private final MinioProperties props;

    public MinioStorageService(MinioClient minioClient, MinioProperties props) {
        this.minioClient = minioClient;
        this.props = props;
    }

    public String upload(MultipartFile file, String objectKey) {
        try {
            String contentType = Objects.requireNonNullElse(file.getContentType(), "application/octet-stream");

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );

            return objectKey;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }

    public String presignedGetUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .method(Method.GET)
                            .expiry(props.getPresignExpiryMinutes() * 60)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error generating presigned URL", e);
        }
    }

    public void deleteIfExists(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return;

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error deleting object from MinIO", e);
        }
    }
}

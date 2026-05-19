package com.healthtracker.api.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("mongo_connection_tests")
public class MongoConnectionTestDocument {

    @Id
    private String id;

    private String message;

    private Instant createdAt;

    protected MongoConnectionTestDocument() {
    }

    public MongoConnectionTestDocument(String message) {
        this.message = message;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

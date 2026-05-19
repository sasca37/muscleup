package com.healthtracker.api.mongo;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/mongo-test")
public class MongoConnectionTestController {

    private final MongoTemplate mongoTemplate;
    private final MongoConnectionTestRepository repository;

    public MongoConnectionTestController(
        MongoTemplate mongoTemplate,
        MongoConnectionTestRepository repository
    ) {
        this.mongoTemplate = mongoTemplate;
        this.repository = repository;
    }

    @GetMapping("/ping")
    public MongoPingResponse ping() {
        Document result = mongoTemplate.executeCommand(new Document("ping", 1));
        return new MongoPingResponse(true, result.toJson(), Instant.now());
    }

    @PostMapping("/samples")
    public MongoSampleResponse save(@RequestBody(required = false) MongoSampleRequest request) {
        String message = request == null || request.message() == null || request.message().isBlank()
            ? "MongoDB save test"
            : request.message();
        MongoConnectionTestDocument saved = repository.save(new MongoConnectionTestDocument(message));
        return MongoSampleResponse.from(saved);
    }

    @GetMapping("/samples")
    public List<MongoSampleResponse> samples() {
        return repository.findTop10ByOrderByCreatedAtDesc()
            .stream()
            .map(MongoSampleResponse::from)
            .toList();
    }

    public record MongoPingResponse(
        boolean connected,
        String raw,
        Instant checkedAt
    ) {
    }

    public record MongoSampleRequest(
        String message
    ) {
    }

    public record MongoSampleResponse(
        String id,
        String message,
        Instant createdAt
    ) {
        static MongoSampleResponse from(MongoConnectionTestDocument document) {
            return new MongoSampleResponse(
                document.getId(),
                document.getMessage(),
                document.getCreatedAt()
            );
        }
    }
}

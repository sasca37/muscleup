package com.healthtracker.api.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MongoConnectionTestRepository extends MongoRepository<MongoConnectionTestDocument, String> {

    List<MongoConnectionTestDocument> findTop10ByOrderByCreatedAtDesc();
}

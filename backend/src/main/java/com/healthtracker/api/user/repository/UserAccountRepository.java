package com.healthtracker.api.user.repository;

import com.healthtracker.api.user.domain.UserAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserAccountRepository extends MongoRepository<UserAccount, String> {

    Optional<UserAccount> findByLoginId(String loginId);
}

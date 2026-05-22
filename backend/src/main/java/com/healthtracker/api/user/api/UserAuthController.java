package com.healthtracker.api.user.api;

import com.healthtracker.api.user.service.UserAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserAuthController {

    private final UserAuthService userAuthService;

    public UserAuthController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @PostMapping("/register")
    public UserDtos.AuthResponse register(@Valid @RequestBody UserDtos.RegisterRequest request) {
        return UserDtos.AuthResponse.from(userAuthService.register(
            request.email(),
            request.password(),
            request.nickname(),
            request.workoutGoal(),
            request.gender(),
            request.ageGroup()
        ));
    }

    @PostMapping("/login")
    public UserDtos.AuthResponse login(@Valid @RequestBody UserDtos.LoginRequest request) {
        return UserDtos.AuthResponse.from(userAuthService.login(request.email(), request.password()));
    }
}

package com.healthtracker.api.user.api;

import com.healthtracker.api.user.service.UserLoginService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserAuthController {

    private final UserLoginService userLoginService;

    public UserAuthController(UserLoginService userLoginService) {
        this.userLoginService = userLoginService;
    }

    @PostMapping("/login")
    public UserDtos.LoginResponse login(@Valid @RequestBody UserDtos.LoginRequest request) {
        return UserDtos.LoginResponse.from(userLoginService.login(request.loginId()));
    }
}

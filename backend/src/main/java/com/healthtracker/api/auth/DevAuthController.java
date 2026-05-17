package com.healthtracker.api.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@ConditionalOnProperty(name = "app.dev-auth-enabled", havingValue = "true")
public class DevAuthController {

    private final String frontendUrl;

    public DevAuthController(@Value("${app.frontend-url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @GetMapping("/oauth2/authorization/{provider}")
    public String devLogin(@PathVariable String provider) {
        return "redirect:" + frontendUrl + "?login=dev";
    }
}

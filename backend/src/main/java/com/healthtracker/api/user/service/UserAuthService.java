package com.healthtracker.api.user.service;

import com.healthtracker.api.user.domain.AgeGroup;
import com.healthtracker.api.user.domain.Gender;
import com.healthtracker.api.user.domain.UserAccount;
import com.healthtracker.api.user.domain.WorkoutGoal;
import com.healthtracker.api.user.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class UserAuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAuthService(
        UserAccountRepository userAccountRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResult register(
        String rawEmail,
        String rawPassword,
        String rawNickname,
        WorkoutGoal workoutGoal,
        Gender gender,
        AgeGroup ageGroup
    ) {
        String email = normalizeEmail(rawEmail);
        String password = validatePassword(rawPassword);
        String nickname = normalizeNickname(rawNickname);

        if (workoutGoal == null || gender == null || ageGroup == null) {
            throw new InvalidUserRequestException("운동목적, 성별, 연령대를 모두 선택해주세요.");
        }

        if (userAccountRepository.existsByEmail(email) || userAccountRepository.findByLoginId(email).isPresent()) {
            throw new DuplicateUserException("이미 가입된 이메일입니다.");
        }

        UserAccount user = UserAccount.register(
            email,
            passwordEncoder.encode(password),
            nickname,
            workoutGoal,
            gender,
            ageGroup
        );
        return new AuthResult(userAccountRepository.save(user), true);
    }

    public AuthResult login(String rawEmail, String rawPassword) {
        String email = normalizeEmail(rawEmail);
        String password = validatePassword(rawPassword);
        UserAccount user = userAccountRepository.findByEmail(email)
            .or(() -> userAccountRepository.findByLoginId(email))
            .filter(found -> found.getPasswordHash() != null && passwordEncoder.matches(password, found.getPasswordHash()))
            .orElseThrow(InvalidCredentialsException::new);

        user.markLoggedIn();
        return new AuthResult(userAccountRepository.save(user), false);
    }

    private String normalizeEmail(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new InvalidUserRequestException("이메일은 필수입니다.");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new InvalidUserRequestException("올바른 이메일 형식으로 입력해주세요.");
        }

        return email;
    }

    private String validatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new InvalidUserRequestException("비밀번호는 필수입니다.");
        }

        String password = rawPassword.trim();
        if (password.length() < 8 || password.length() > 72) {
            throw new InvalidUserRequestException("비밀번호는 8~72자로 입력해주세요.");
        }

        return password;
    }

    private String normalizeNickname(String rawNickname) {
        if (rawNickname == null || rawNickname.isBlank()) {
            throw new InvalidUserRequestException("닉네임은 필수입니다.");
        }

        String nickname = rawNickname.trim();
        if (nickname.length() < 2 || nickname.length() > 20) {
            throw new InvalidUserRequestException("닉네임은 2~20자로 입력해주세요.");
        }

        return nickname;
    }

    public record AuthResult(
        UserAccount user,
        boolean created
    ) {
    }
}

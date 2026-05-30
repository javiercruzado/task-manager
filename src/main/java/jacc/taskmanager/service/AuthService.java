package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.LoginRequest;
import jacc.taskmanager.dto.request.RegisterRequest;
import jacc.taskmanager.dto.response.AuthResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.exception.UnauthorizedException;
import jacc.taskmanager.model.RefreshToken;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.RefreshTokenRepository;
import jacc.taskmanager.repository.UserRepository;
import jacc.taskmanager.security.JwtTokenProvider;
import jacc.taskmanager.security.TokenInfo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, 
                       AuthenticationManager authenticationManager, EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new ConflictException("Email already in use");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEnabled(false);
        
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        String verificationLink = "http://localhost:8080/auth/verify?token=" + verificationToken;
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationLink);

        return new AuthResponse(null, null);
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            TokenInfo accessTokenInfo = jwtTokenProvider.generateAccessToken(user.getEmail());
            TokenInfo refreshTokenInfo = jwtTokenProvider.generateRefreshToken(user.getEmail());

            // Store refresh token in DB
            saveRefreshToken(user, refreshTokenInfo.getToken(), refreshTokenInfo.getExpiryDate());

            return new AuthResponse(accessTokenInfo.getToken(), refreshTokenInfo.getToken());
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password, or account is disabled");
        }
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        String refreshTokenHash = hashToken(refreshToken);
        RefreshToken storedRefreshToken = refreshTokenRepository.findByTokenHash(refreshTokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found or already used"));

        if (storedRefreshToken.isRevoked() || storedRefreshToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UnauthorizedException("Refresh token is revoked or expired");
        }

        // Revoke the old refresh token
        storedRefreshToken.setRevoked(true);
        refreshTokenRepository.save(storedRefreshToken);

        // Generate new tokens
        TokenInfo newAccessTokenInfo = jwtTokenProvider.generateAccessToken(user.getEmail());
        TokenInfo newRefreshTokenInfo = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Save the new refresh token
        saveRefreshToken(user, newRefreshTokenInfo.getToken(), newRefreshTokenInfo.getExpiryDate());

        return new AuthResponse(newAccessTokenInfo.getToken(), newRefreshTokenInfo.getToken());
    }

    public void verifyAccount(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (user.isEnabled()) {
            throw new ConflictException("Account already verified");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public void logout(String refreshToken) {
        String refreshTokenHash = hashToken(refreshToken);
        RefreshToken storedRefreshToken = refreshTokenRepository.findByTokenHash(refreshTokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (!storedRefreshToken.isRevoked()) {
            storedRefreshToken.setRevoked(true);
            refreshTokenRepository.save(storedRefreshToken);
        }
    }

    private void saveRefreshToken(User user, String token, OffsetDateTime expiryDate) {
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setUser(user);
        newRefreshToken.setTokenHash(hashToken(token));
        newRefreshToken.setExpiresAt(expiryDate);
        newRefreshToken.setRevoked(false);
        refreshTokenRepository.save(newRefreshToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}

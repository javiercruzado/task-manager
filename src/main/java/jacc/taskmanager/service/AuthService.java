package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.LoginRequest;
import jacc.taskmanager.dto.request.RegisterRequest;
import jacc.taskmanager.dto.response.AuthResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.exception.UnauthorizedException;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.UserRepository;
import jacc.taskmanager.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService; // Inject EmailService

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider, AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
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
        
        // Generate and set verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        // Simulate sending verification email
        String verificationLink = "http://localhost:8080/auth/verify?token=" + verificationToken; // Adjust URL as needed
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationLink);

        // For registration, we don't return tokens until the account is verified
        return new AuthResponse(null, null); // Or a specific DTO indicating success but no tokens yet
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            String accessToken = jwtTokenProvider.generateAccessToken(loginRequest.getEmail());
            String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getEmail());

            return new AuthResponse(accessToken, refreshToken);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password, or account is disabled");
        }
    }

    public AuthResponse refresh(String refreshToken) {
        if (jwtTokenProvider.validateToken(refreshToken)) {
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));
            
            if (!user.isEnabled()) {
                throw new UnauthorizedException("Account is disabled");
            }

            String newAccessToken = jwtTokenProvider.generateAccessToken(email);
            return new AuthResponse(newAccessToken, refreshToken);
        }
        throw new UnauthorizedException("Invalid refresh token");
    }

    public void verifyAccount(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (user.isEnabled()) {
            throw new ConflictException("Account already verified");
        }

        user.setEnabled(true);
        user.setVerificationToken(null); // Clear the token after successful verification
        userRepository.save(user);
    }
}

package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.LoginRequest;
import jacc.taskmanager.dto.request.RegisterRequest;
import jacc.taskmanager.dto.response.AuthResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.UnauthorizedException;
import jacc.taskmanager.model.RefreshToken;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.RefreshTokenRepository;
import jacc.taskmanager.repository.UserRepository;
import jacc.taskmanager.security.JwtTokenProvider;
import jacc.taskmanager.security.TokenInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setFullName("Test User");
        testUser.setPasswordHash("hashedPassword");
        testUser.setEnabled(true);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setFullName("New User");
        request.setPassword("password123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("new@example.com", savedUser.getEmail());
        assertFalse(savedUser.isEnabled());
        assertNotNull(savedUser.getVerificationToken());

        verify(emailService).sendVerificationEmail(eq("new@example.com"), eq("New User"), any());
    }

    @Test
    void register_DuplicateEmail_ThrowsConflictException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setFullName("Test User");
        request.setPassword("password123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        TokenInfo accessInfo = new TokenInfo("access_token", OffsetDateTime.now().plusHours(1));
        TokenInfo refreshInfo = new TokenInfo("refresh_token", OffsetDateTime.now().plusDays(7));

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateAccessToken(testUser.getEmail())).thenReturn(accessInfo);
        when(jwtTokenProvider.generateRefreshToken(testUser.getEmail())).thenReturn(refreshInfo);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void login_BadCredentials_ThrowsUnauthorizedException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void verifyAccount_Success() {
        String token = "valid-token";
        testUser.setEnabled(false);
        testUser.setVerificationToken(token);

        when(userRepository.findByVerificationToken(token)).thenReturn(Optional.of(testUser));

        authService.verifyAccount(token);

        assertTrue(testUser.isEnabled());
        assertNull(testUser.getVerificationToken());
        verify(userRepository).save(testUser);
    }
}

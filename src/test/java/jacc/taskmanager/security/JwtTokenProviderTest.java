package jacc.taskmanager.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String testSecret = "superSecretTestKeyWithEnoughBitsForHmacSha256SignatureRequirements123456";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtAccessExpirationMs", 3600000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtRefreshExpirationMs", 604800000L);
        jwtTokenProvider.init();
    }

    @Test
    void generateAccessToken_ShouldReturnValidToken() {
        String email = "test@example.com";
        TokenInfo tokenInfo = jwtTokenProvider.generateAccessToken(email);

        assertNotNull(tokenInfo);
        assertNotNull(tokenInfo.getToken());
        assertNotNull(tokenInfo.getExpiryDate());
        assertTrue(tokenInfo.getExpiryDate().isAfter(OffsetDateTime.now()));

        assertTrue(jwtTokenProvider.validateToken(tokenInfo.getToken()));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(tokenInfo.getToken()));
    }

    @Test
    void generateRefreshToken_ShouldReturnValidToken() {
        String email = "user@example.com";
        TokenInfo tokenInfo = jwtTokenProvider.generateRefreshToken(email);

        assertNotNull(tokenInfo);
        assertTrue(jwtTokenProvider.validateToken(tokenInfo.getToken()));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(tokenInfo.getToken()));
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
    }

    @Test
    void validateToken_WithMalformedToken_ShouldReturnFalse() {
        assertFalse(jwtTokenProvider.validateToken(""));
    }
}

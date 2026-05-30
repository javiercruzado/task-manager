package jacc.taskmanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:defaultSecretKeyWithEnoughCharactersToSatisfySecurityRequirements}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-ms:3600000}") // 1 hour
    private long jwtAccessExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}") // 7 days
    private long jwtRefreshExpirationMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public TokenInfo generateAccessToken(String email) {
        return generateToken(email, jwtAccessExpirationMs);
    }

    public TokenInfo generateRefreshToken(String email) {
        return generateToken(email, jwtRefreshExpirationMs);
    }

    private TokenInfo generateToken(String email, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        String token = Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
        
        return new TokenInfo(token, expiryDate.toInstant().atOffset(ZoneOffset.UTC));
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public OffsetDateTime getExpiryDateFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getExpiration().toInstant().atOffset(ZoneOffset.UTC);
    }
}

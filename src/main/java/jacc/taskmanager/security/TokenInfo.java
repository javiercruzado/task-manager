package jacc.taskmanager.security;

import java.time.OffsetDateTime;

public class TokenInfo {
    private String token;
    private OffsetDateTime expiryDate;

    public TokenInfo(String token, OffsetDateTime expiryDate) {
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public String getToken() {
        return token;
    }

    public OffsetDateTime getExpiryDate() {
        return expiryDate;
    }
}

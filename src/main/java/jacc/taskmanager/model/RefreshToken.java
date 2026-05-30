package jacc.taskmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_tokens_user", columnList = "user_id"),
        @Index(name = "idx_refresh_tokens_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_refresh_tokens_expiry", columnList = "expires_at")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @NotBlank
    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash; // Store SHA-256 hash of the token

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public RefreshToken() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RefreshToken that = (RefreshToken) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

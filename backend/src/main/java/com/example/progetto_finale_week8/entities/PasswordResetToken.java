package com.example.progetto_finale_week8.entities;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// il suo id e' il token che finisce nell'URL del link di reset password
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false, updatable = false)
	private Instant expireAt;

	@Column(nullable = false)
	private boolean used = false;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
		expireAt = createdAt.plus(30, ChronoUnit.MINUTES);
	}

}

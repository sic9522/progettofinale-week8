package com.example.progetto_finale_week8.entities;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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

@Entity
@Table(name = "login_otps")
@Getter
@Setter
@NoArgsConstructor
public class LoginOtp {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 6)
	private String codice;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false, updatable = false)
	private Instant expireAt;

	@Column(nullable = false)
	private boolean used = false;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
		expireAt = createdAt.plus(10, ChronoUnit.MINUTES);
	}

}

package com.example.progetto_finale_week8.entities;

import java.time.Instant;

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

// niente piu' storage locale: url e' il link diretto alla CDN di auto.dev
@Entity
@Table(name = "foto")
@Getter
@Setter
@NoArgsConstructor
public class Foto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "auto_id", nullable = false)
	private Auto auto;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String url;

	// la foto con ordine più basso è la copertina
	@Column(nullable = false)
	private int ordine;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
	}

}

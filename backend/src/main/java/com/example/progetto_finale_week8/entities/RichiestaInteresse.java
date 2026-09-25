package com.example.progetto_finale_week8.entities;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

// un utente segnala interesse per acquisto o noleggio di un'auto: l'admin la vede
// nella pagina Notifiche e contatta il cliente a mano, nessun invio email automatico
@Entity
@Table(name = "richieste_interesse")
@Getter
@Setter
@NoArgsConstructor
public class RichiestaInteresse {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(optional = false)
	@JoinColumn(name = "auto_id", nullable = false)
	private Auto auto;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TipoInteresse tipo;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
	}

}

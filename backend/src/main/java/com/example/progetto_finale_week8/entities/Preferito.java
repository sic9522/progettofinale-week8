package com.example.progetto_finale_week8.entities;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// accorpa avviso di prezzo e notifica di disponibilità: un utente le imposta
// solo su un'auto già nei preferiti, mai prima - vedi Decisioni.txt
@Entity
@Table(name = "preferiti", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "auto_id" }))
@Getter
@Setter
@NoArgsConstructor
public class Preferito {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(optional = false)
	@JoinColumn(name = "auto_id", nullable = false)
	private Auto auto;

	// null = nessun avviso di prezzo attivo su questo preferito
	@Column(name = "soglia_prezzo", precision = 10, scale = 2)
	private BigDecimal sogliaPrezzo;

	@Column(name = "prezzo_inviato", nullable = false)
	private boolean prezzoInviato = false;

	@Column(name = "notifica_disponibilita", nullable = false)
	private boolean notificaDisponibilita = true;

	@Column(name = "disponibilita_inviata", nullable = false)
	private boolean disponibilitaInviata = false;

	@Column(name = "token_disiscrizione_prezzo", nullable = false, unique = true, updatable = false)
	private UUID tokenDisiscrizionePrezzo;

	@Column(name = "token_disiscrizione_disponibilita", nullable = false, unique = true, updatable = false)
	private UUID tokenDisiscrizioneDisponibilita;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
		updatedAt = createdAt;
		tokenDisiscrizionePrezzo = UUID.randomUUID();
		tokenDisiscrizioneDisponibilita = UUID.randomUUID();
	}

	@PreUpdate
	private void onUpdate() {
		updatedAt = Instant.now();
	}

}

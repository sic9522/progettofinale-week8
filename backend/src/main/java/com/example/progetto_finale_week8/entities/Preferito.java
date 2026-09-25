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

	// facoltativa: se impostata, l'avviso di ribasso parte solo sotto questa cifra
	@Column(name = "soglia_prezzo", precision = 10, scale = 2)
	private BigDecimal sogliaPrezzo;

	// non piu' usato dagli avvisi (ora partono a ogni ribasso); resta perche' la colonna
	// e' NOT NULL nel database gia' esistente
	@Column(name = "prezzo_inviato", nullable = false)
	private boolean prezzoInviato = false;

	// avviso di ribasso attivo di default su ogni preferito; il link "disattiva" lo spegne.
	// default nel DDL: la colonna arriva su una tabella gia' popolata (ddl-auto=update)
	@Column(name = "notifica_prezzo", nullable = false, columnDefinition = "boolean default true")
	private boolean notificaPrezzo = true;

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

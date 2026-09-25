package com.example.progetto_finale_week8.entities;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auto")
@Getter
@Setter
@NoArgsConstructor
public class Auto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// identifica l'auto fisica su auto.dev; immutabile dopo la creazione
	@Column(nullable = false, unique = true)
	private String vin;

	// marca/modello/anno arrivano dal decode auto.dev del VIN, non li scrive l'admin
	@Column(nullable = false)
	private String marca;

	@Column(nullable = false)
	private String modello;

	@Column(nullable = false)
	private int anno;

	// testo libero dell'admin, facoltativo: i dati tecnici li copre gia' specificheJson
	@Column(columnDefinition = "TEXT")
	private String descrizione;

	// risposta grezza di GET /specs/{vin} (sezione "specs"): 120+ parametri, nessuna
	// colonna dedicata per ognuno, il frontend legge quello che le serve dal JSON
	@Column(name = "specifiche_json", columnDefinition = "TEXT")
	private String specificheJson;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal prezzo;

	// mai esposto nel catalogo pubblico, solo nelle risposte per l'admin
	@Column(name = "prezzo_acquisto", nullable = false, precision = 10, scale = 2)
	private BigDecimal prezzoAcquisto;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatoAuto stato = StatoAuto.BOZZA;

	// resta in vetrina (PUBBLICATA), il badge "Noleggio" si aggiunge sopra: non e' un
	// altro valore di StatoAuto perche' non sostituisce la vendita, la affianca
	@Column(name = "disponibile_noleggio", nullable = false)
	private boolean disponibileNoleggio = false;

	// prezzoOriginale valorizzato solo mentre inOfferta e' true: serve alla card per il
	// prezzo barrato. Tasto "Offerta" dedicato, separato dalla modifica prezzo normale
	// dell'admin che non deve attivare per sbaglio lo stile offerta
	@Column(name = "in_offerta", nullable = false)
	private boolean inOfferta = false;

	@Column(name = "prezzo_originale", precision = 10, scale = 2)
	private BigDecimal prezzoOriginale;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
		updatedAt = createdAt;
	}

	@PreUpdate
	private void onUpdate() {
		updatedAt = Instant.now();
	}

}

package com.example.progetto_finale_week8.entities;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false)
	private String cognome;

	// hash BCrypt, mai la password in chiaro
	@Column(nullable = false)
	private String password;

	// solo anagrafici sul profilo, nessuna logica collegata; valorizzati dopo la registrazione
	private String indirizzo;
	private String citta;
	private String cap;

	// nullable: in pratica solo l'admin lo valorizza
	private String societa;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Ruolo ruolo = Ruolo.USER;

	// finché non conferma la registrazione via link, il login resta bloccato
	@Column(nullable = false)
	private boolean verified = false;

	// numero tessera stampato sulla patente nel profilo: l'admin lo usa per trovare
	// l'account senza chiedere email o username. Non "unique" a livello DB: la colonna
	// e' stata aggiunta con utenti gia' esistenti e non tutti valorizzati finche' non
	// vengono aggiornati manualmente (vedi migrazione dati), l'unicita' pratica viene
	// dalla probabilita' di collisione di un UUID v4, non da un vincolo del database
	@Column(name = "numero_tessera", updatable = false)
	private UUID numeroTessera;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
		if (numeroTessera == null) {
			numeroTessera = UUID.randomUUID();
		}
	}

}

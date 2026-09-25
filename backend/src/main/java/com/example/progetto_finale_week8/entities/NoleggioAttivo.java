package com.example.progetto_finale_week8.entities;

import java.math.BigDecimal;
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

// un'auto a noleggio (Auto.disponibileNoleggio) puo' avere al piu' un cliente attivo alla
// volta: l'admin conferma un noleggio da un preventivo caricato, il cliente riceve l'email
// di conferma e vede il noleggio nel proprio profilo finche' l'admin non lo revoca
@Entity
@Table(name = "noleggi_attivi")
@Getter
@Setter
@NoArgsConstructor
public class NoleggioAttivo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "auto_id", nullable = false)
	private Auto auto;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private Integer mesi;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal anticipo;

	private Integer percentualeSconto;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal rata;

	@Column(nullable = false)
	private boolean attivo = true;

	private Instant dataRevoca;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@PrePersist
	private void onCreate() {
		createdAt = Instant.now();
	}

}

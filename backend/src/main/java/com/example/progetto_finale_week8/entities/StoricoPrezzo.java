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

@Entity
@Table(name = "storico_prezzi")
@Getter
@Setter
@NoArgsConstructor
public class StoricoPrezzo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "auto_id", nullable = false)
	private Auto auto;

	@Column(name = "prezzo_precedente", nullable = false, precision = 10, scale = 2)
	private BigDecimal prezzoPrecedente;

	@Column(name = "prezzo_nuovo", nullable = false, precision = 10, scale = 2)
	private BigDecimal prezzoNuovo;

	@Column(name = "cambiato_at", nullable = false, updatable = false)
	private Instant cambiatoAt;

	@PrePersist
	private void onCreate() {
		cambiatoAt = Instant.now();
	}

}

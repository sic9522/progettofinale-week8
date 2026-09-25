package com.example.progetto_finale_week8.payloads.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.progetto_finale_week8.entities.StoricoPrezzo;

public record StoricoPrezzoResponse(
	BigDecimal prezzoPrecedente,
	BigDecimal prezzoNuovo,
	Instant cambiatoAt
) {
	public static StoricoPrezzoResponse of(StoricoPrezzo storico) {
		return new StoricoPrezzoResponse(storico.getPrezzoPrecedente(), storico.getPrezzoNuovo(), storico.getCambiatoAt());
	}
}

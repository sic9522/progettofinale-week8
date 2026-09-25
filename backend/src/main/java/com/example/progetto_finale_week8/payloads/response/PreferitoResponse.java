package com.example.progetto_finale_week8.payloads.response;

import java.math.BigDecimal;

import com.example.progetto_finale_week8.entities.Preferito;

public record PreferitoResponse(
	Long id,
	AutoResponse auto,
	BigDecimal sogliaPrezzo,
	boolean notificaDisponibilita
) {
	public static PreferitoResponse of(Preferito preferito, AutoResponse auto) {
		return new PreferitoResponse(preferito.getId(), auto, preferito.getSogliaPrezzo(), preferito.isNotificaDisponibilita());
	}
}

package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

import com.example.progetto_finale_week8.entities.StatoAuto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// il VIN e' immutabile dopo la creazione: per cambiarlo serve un'auto nuova, non un update
public record AutoUpdateRequest(
	String descrizione,
	@NotNull @Positive BigDecimal prezzo,
	@NotNull @Positive BigDecimal prezzoAcquisto,
	@NotNull StatoAuto stato
) {
}

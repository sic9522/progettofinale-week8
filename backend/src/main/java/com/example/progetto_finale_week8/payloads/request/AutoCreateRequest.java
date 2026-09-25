package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

import com.example.progetto_finale_week8.entities.StatoAuto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// solo l'admin la usa: marca/modello/anno/specifiche arrivano da auto.dev tramite il VIN,
// non li scrive lui
public record AutoCreateRequest(
	@NotBlank String vin,
	String descrizione,
	@NotNull @Positive BigDecimal prezzo,
	@NotNull @Positive BigDecimal prezzoAcquisto,
	@NotNull StatoAuto stato
) {
}

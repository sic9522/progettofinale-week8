package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

// percentualeSconto facoltativo (10/15/20, come per l'offerta): la rata si ricalcola
// sempre lato server, mai fidandosi di un numero gia' calcolato dal client
public record ConfermaNoleggioRequest(
	@NotNull Long userId,
	@NotNull @Positive Integer mesi,
	@NotNull @PositiveOrZero BigDecimal anticipo,
	Integer percentualeSconto
) {
}

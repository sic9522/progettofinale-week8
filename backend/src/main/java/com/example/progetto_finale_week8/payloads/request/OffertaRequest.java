package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

// esattamente uno dei due: sconto in percentuale (10/15/20) oppure un prezzo scritto
// a mano. Validato in AutoService.applicaOfferta, non qui: e' un vincolo tra due campi
public record OffertaRequest(
	Integer percentualeSconto,
	BigDecimal nuovoPrezzo
) {
}

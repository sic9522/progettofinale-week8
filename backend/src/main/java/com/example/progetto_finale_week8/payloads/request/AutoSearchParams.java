package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

// filtri di GET /api/auto da query string, tutti facoltativi e combinati in AND
public record AutoSearchParams(
	String q,
	String marca,
	Integer annoDa,
	Integer annoA,
	BigDecimal prezzoMin,
	BigDecimal prezzoMax,
	Boolean inOfferta,
	Boolean disponibileNoleggio
) {
}

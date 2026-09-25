package com.example.progetto_finale_week8.payloads.request;

import java.math.BigDecimal;

// null in sogliaPrezzo = nessun avviso di prezzo; notificaDisponibilita null = non toccarla
public record PreferitoRequest(
	BigDecimal sogliaPrezzo,
	Boolean notificaDisponibilita
) {
}

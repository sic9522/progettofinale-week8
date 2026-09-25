package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;

// pubblicato solo dopo il commit del salvataggio, mai prima
// prezzoPrecedente serve a capire se e' un ribasso (solo allora partono gli avvisi)
public record PrezzoCambiatoEvent(Long autoId, BigDecimal prezzoPrecedente, BigDecimal nuovoPrezzo) {
}

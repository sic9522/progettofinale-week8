package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;

// pubblicato solo dopo il commit del salvataggio, mai prima
public record PrezzoCambiatoEvent(Long autoId, BigDecimal nuovoPrezzo) {
}

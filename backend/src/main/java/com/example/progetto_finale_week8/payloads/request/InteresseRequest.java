package com.example.progetto_finale_week8.payloads.request;

import com.example.progetto_finale_week8.entities.TipoInteresse;

import jakarta.validation.constraints.NotNull;

public record InteresseRequest(
	@NotNull TipoInteresse tipo
) {
}

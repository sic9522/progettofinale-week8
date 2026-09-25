package com.example.progetto_finale_week8.payloads.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReimpostaPasswordRequest(
	@NotNull UUID token,
	@NotBlank @Size(min = 8, message = "la password deve avere almeno 8 caratteri") String password
) {
}

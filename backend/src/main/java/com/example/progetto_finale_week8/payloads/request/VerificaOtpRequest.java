package com.example.progetto_finale_week8.payloads.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerificaOtpRequest(
	@NotBlank @Email String email,
	@NotBlank @Pattern(regexp = "\\d{6}", message = "il codice deve avere 6 cifre") String codice
) {
}

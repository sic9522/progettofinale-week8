package com.example.progetto_finale_week8.payloads.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// primo passo del login: se password ed email combaciano, parte il codice OTP
// (secondo passo: VerificaOtpRequest)
public record LoginRequest(
	@NotBlank @Email String email,
	@NotBlank String password
) {
}

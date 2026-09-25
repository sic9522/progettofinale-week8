package com.example.progetto_finale_week8.payloads.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// indirizzo/citta/cap sono facoltativi, come sulla User: se mancano la residenza
// sulla patente del profilo resta vuota, niente di piu'
public record RegisterRequest(
	@NotBlank @Email String email,
	@NotBlank String username,
	@NotBlank String nome,
	@NotBlank String cognome,
	@NotBlank @Size(min = 8, message = "la password deve avere almeno 8 caratteri") String password,
	String indirizzo,
	String citta,
	String cap
) {
}

package com.example.progetto_finale_week8.payloads.response;

import java.util.UUID;

import com.example.progetto_finale_week8.entities.Ruolo;
import com.example.progetto_finale_week8.entities.User;

public record UserResponse(
	Long id,
	String email,
	String username,
	String nome,
	String cognome,
	String indirizzo,
	String citta,
	String cap,
	String societa,
	Ruolo ruolo,
	UUID numeroTessera
) {
	public static UserResponse of(User user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getUsername(), user.getNome(), user.getCognome(),
			user.getIndirizzo(), user.getCitta(), user.getCap(), user.getSocieta(), user.getRuolo(),
			user.getNumeroTessera());
	}
}

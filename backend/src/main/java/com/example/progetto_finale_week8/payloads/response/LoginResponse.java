package com.example.progetto_finale_week8.payloads.response;

public record LoginResponse(
	String token,
	String tipo
) {
	public static LoginResponse of(String token) {
		return new LoginResponse(token, "Bearer");
	}
}

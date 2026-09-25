package com.example.progetto_finale_week8.payloads.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordDimenticataRequest(
	@NotBlank @Email String email
) {
}

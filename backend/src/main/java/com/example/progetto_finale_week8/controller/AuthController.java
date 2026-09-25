package com.example.progetto_finale_week8.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.request.LoginRequest;
import com.example.progetto_finale_week8.payloads.request.PasswordDimenticataRequest;
import com.example.progetto_finale_week8.payloads.request.RegisterRequest;
import com.example.progetto_finale_week8.payloads.request.ReimpostaPasswordRequest;
import com.example.progetto_finale_week8.payloads.request.VerificaOtpRequest;
import com.example.progetto_finale_week8.payloads.response.LoginResponse;
import com.example.progetto_finale_week8.service.PasswordResetService;
import com.example.progetto_finale_week8.service.RegistrationTokenService;
import com.example.progetto_finale_week8.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final UserService userService;
	private final RegistrationTokenService registrationTokenService;
	private final PasswordResetService passwordResetService;

	public AuthController(UserService userService, RegistrationTokenService registrationTokenService,
			PasswordResetService passwordResetService) {
		this.userService = userService;
		this.registrationTokenService = registrationTokenService;
		this.passwordResetService = passwordResetService;
	}

	@PreAuthorize("permitAll()")
	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public void register(@Valid @RequestBody RegisterRequest request) {
		userService.registra(request);
	}

	@PreAuthorize("permitAll()")
	@GetMapping("/confirm")
	public void confirm(@RequestParam UUID token) {
		registrationTokenService.conferma(token);
	}

	// primo passo del login: se password ed email combaciano parte il codice OTP,
	// tranne per l'admin che riceve subito il token (nessuna mail da controllare)
	@PreAuthorize("permitAll()")
	@PostMapping("/login")
	public LoginResponse login(@Valid @RequestBody LoginRequest request) {
		return userService.login(request.email(), request.password());
	}

	@PreAuthorize("permitAll()")
	@PostMapping("/login/verifica-otp")
	public LoginResponse verificaOtp(@Valid @RequestBody VerificaOtpRequest request) {
		return userService.verificaOtp(request.email(), request.codice());
	}

	// non rivela se l'email esiste: risponde sempre 200, vedi PasswordResetService.richiedi
	@PreAuthorize("permitAll()")
	@PostMapping("/password-dimenticata")
	public void passwordDimenticata(@Valid @RequestBody PasswordDimenticataRequest request) {
		passwordResetService.richiedi(request.email());
	}

	@PreAuthorize("permitAll()")
	@PostMapping("/reimposta-password")
	public void reimpostaPassword(@Valid @RequestBody ReimpostaPasswordRequest request) {
		passwordResetService.reimposta(request.token(), request.password());
	}

}

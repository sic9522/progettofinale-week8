package com.example.progetto_finale_week8.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.response.NoleggioClienteResponse;
import com.example.progetto_finale_week8.payloads.response.UserResponse;
import com.example.progetto_finale_week8.security.CurrentUser;
import com.example.progetto_finale_week8.service.NoleggioClienteService;
import com.example.progetto_finale_week8.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private final UserService userService;
	private final NoleggioClienteService noleggioClienteService;

	public UserController(UserService userService, NoleggioClienteService noleggioClienteService) {
		this.userService = userService;
		this.noleggioClienteService = noleggioClienteService;
	}

	// dati dell'utente autenticato: serve al frontend per sapere ruolo e nome da mostrare
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/me")
	public UserResponse me() {
		return userService.me(CurrentUser.id());
	}

	// tutti i noleggi attivi del cliente (garage del profilo), lista vuota se nessuno
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/noleggi")
	public List<NoleggioClienteResponse> mieiNoleggi() {
		return noleggioClienteService.mieiNoleggi(CurrentUser.id());
	}

	// "elimina il mio account": cancella avvisi/preferiti, da quel momento non parte più
	// nessuna mail per questo utente
	@PreAuthorize("isAuthenticated()")
	@DeleteMapping("/me")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminaAccount() {
		userService.eliminaAccount(CurrentUser.id());
	}

}

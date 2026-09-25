package com.example.progetto_finale_week8.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.response.UserResponse;
import com.example.progetto_finale_week8.service.UserService;

// ricerca account per numero tessera (patente nel profilo) o per cognome/id/email
// (scelta cliente nel preventivo noleggio)
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/utenti")
public class AdminUserController {

	private final UserService userService;

	public AdminUserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public UserResponse cercaPerTessera(@RequestParam UUID numeroTessera) {
		return userService.trovaPerTessera(numeroTessera);
	}

	@GetMapping("/cerca")
	public List<UserResponse> cerca(@RequestParam String termine) {
		return userService.cercaPerTermine(termine);
	}

}

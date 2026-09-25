package com.example.progetto_finale_week8.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.request.PreferitoRequest;
import com.example.progetto_finale_week8.payloads.response.PreferitoResponse;
import com.example.progetto_finale_week8.security.CurrentUser;
import com.example.progetto_finale_week8.service.PreferitoService;

@RestController
@RequestMapping("/api/preferiti")
public class PreferitoController {

	private final PreferitoService preferitoService;

	public PreferitoController(PreferitoService preferitoService) {
		this.preferitoService = preferitoService;
	}

	@PreAuthorize("isAuthenticated()")
	@GetMapping
	public List<PreferitoResponse> lista() {
		return preferitoService.lista(CurrentUser.id());
	}

	@PreAuthorize("isAuthenticated()")
	@PatchMapping("/{id}")
	public PreferitoResponse aggiorna(@PathVariable Long id, @RequestBody PreferitoRequest request) {
		return preferitoService.aggiorna(CurrentUser.id(), id, request);
	}

	@PreAuthorize("isAuthenticated()")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void rimuovi(@PathVariable Long id) {
		preferitoService.rimuovi(CurrentUser.id(), id);
	}

	// link dalla mail: il token identifica il preferito, mai l'id
	@PreAuthorize("permitAll()")
	@GetMapping("/disiscrivi/prezzo")
	public void disiscriviPrezzo(@RequestParam UUID token) {
		preferitoService.disiscriviPrezzo(token);
	}

	@PreAuthorize("permitAll()")
	@GetMapping("/disiscrivi/disponibilita")
	public void disiscriviDisponibilita(@RequestParam UUID token) {
		preferitoService.disiscriviDisponibilita(token);
	}

}

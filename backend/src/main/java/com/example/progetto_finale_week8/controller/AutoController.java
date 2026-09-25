package com.example.progetto_finale_week8.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.request.AutoSearchParams;
import com.example.progetto_finale_week8.payloads.request.InteresseRequest;
import com.example.progetto_finale_week8.payloads.request.PreferitoRequest;
import com.example.progetto_finale_week8.payloads.response.AutoResponse;
import com.example.progetto_finale_week8.payloads.response.PageResponse;
import com.example.progetto_finale_week8.payloads.response.PreferitoResponse;
import com.example.progetto_finale_week8.security.CurrentUser;
import com.example.progetto_finale_week8.service.AutoService;
import com.example.progetto_finale_week8.service.InteresseService;
import com.example.progetto_finale_week8.service.PreferitoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auto")
public class AutoController {

	private final AutoService autoService;
	private final PreferitoService preferitoService;
	private final InteresseService interesseService;

	public AutoController(AutoService autoService, PreferitoService preferitoService,
			InteresseService interesseService) {
		this.autoService = autoService;
		this.preferitoService = preferitoService;
		this.interesseService = interesseService;
	}

	// catalogo pubblico: solo le PUBBLICATE, ricerca e ordinamento opzionali
	@PreAuthorize("permitAll()")
	@GetMapping
	public PageResponse<AutoResponse> catalogo(@ModelAttribute AutoSearchParams params,
			@PageableDefault(size = 20) Pageable pageable) {
		return autoService.catalogoPubblico(params, pageable);
	}

	@PreAuthorize("permitAll()")
	@GetMapping("/{id}")
	public AutoResponse dettaglio(@PathVariable Long id) {
		return autoService.dettaglio(id, false);
	}

	@PreAuthorize("isAuthenticated()")
	@PostMapping("/{id}/preferiti")
	public PreferitoResponse aggiungiPreferito(@PathVariable Long id, @RequestBody PreferitoRequest request) {
		return preferitoService.aggiungi(CurrentUser.id(), id, request);
	}

	// l'admin la vede nella pagina Notifiche e contatta il cliente a mano
	@PreAuthorize("isAuthenticated()")
	@PostMapping("/{id}/interesse")
	public void segnalaInteresse(@PathVariable Long id, @Valid @RequestBody InteresseRequest request) {
		interesseService.segnala(CurrentUser.id(), id, request.tipo());
	}

}

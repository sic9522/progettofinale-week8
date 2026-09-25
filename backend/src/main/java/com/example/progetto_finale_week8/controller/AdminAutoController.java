package com.example.progetto_finale_week8.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.request.AutoCreateRequest;
import com.example.progetto_finale_week8.payloads.request.AutoUpdateRequest;
import com.example.progetto_finale_week8.payloads.request.ConfermaNoleggioRequest;
import com.example.progetto_finale_week8.payloads.request.NoleggioRequest;
import com.example.progetto_finale_week8.payloads.request.OffertaRequest;
import com.example.progetto_finale_week8.payloads.response.AutoResponse;
import com.example.progetto_finale_week8.payloads.response.NoleggioClienteResponse;
import com.example.progetto_finale_week8.payloads.response.PageResponse;
import com.example.progetto_finale_week8.service.AutoService;
import com.example.progetto_finale_week8.service.NoleggioClienteService;

import jakarta.validation.Valid;

// tutto ciò che tocca prezzo, stato o dati dell'auto spetta solo all'admin
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/auto")
public class AdminAutoController {

	private final AutoService autoService;
	private final NoleggioClienteService noleggioClienteService;

	public AdminAutoController(AutoService autoService, NoleggioClienteService noleggioClienteService) {
		this.autoService = autoService;
		this.noleggioClienteService = noleggioClienteService;
	}

	// comprese le bozze e il prezzo di acquisto
	@GetMapping
	public PageResponse<AutoResponse> lista(@PageableDefault(size = 20) Pageable pageable) {
		return autoService.listaAdmin(pageable);
	}

	// marca/modello/anno/specifiche/foto arrivano da auto.dev tramite il VIN
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AutoResponse crea(@Valid @RequestBody AutoCreateRequest request) {
		return autoService.crea(request);
	}

	@PutMapping("/{id}")
	public AutoResponse modifica(@PathVariable Long id, @Valid @RequestBody AutoUpdateRequest request) {
		return autoService.modifica(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void rimuovi(@PathVariable Long id) {
		autoService.rimuovi(id);
	}

	@PatchMapping("/{id}/offerta")
	public AutoResponse applicaOfferta(@PathVariable Long id, @RequestBody OffertaRequest request) {
		return autoService.applicaOfferta(id, request);
	}

	@DeleteMapping("/{id}/offerta")
	public AutoResponse rimuoviOfferta(@PathVariable Long id) {
		return autoService.rimuoviOfferta(id);
	}

	@PatchMapping("/{id}/noleggio")
	public AutoResponse impostaNoleggio(@PathVariable Long id, @RequestBody NoleggioRequest request) {
		return autoService.impostaNoleggio(id, request.disponibile());
	}

	@PostMapping("/{id}/noleggio-cliente")
	@ResponseStatus(HttpStatus.CREATED)
	public NoleggioClienteResponse confermaNoleggio(@PathVariable Long id, @Valid @RequestBody ConfermaNoleggioRequest request) {
		return noleggioClienteService.conferma(id, request);
	}

}

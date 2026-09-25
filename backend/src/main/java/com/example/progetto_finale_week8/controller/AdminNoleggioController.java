package com.example.progetto_finale_week8.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.response.NoleggioClienteResponse;
import com.example.progetto_finale_week8.service.NoleggioClienteService;

// "Noleggio Clienti": auto gia' confermate a un cliente specifico (distinto da
// /api/admin/auto/{id}/noleggio, che segna solo l'auto come noleggiabile in generale)
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/noleggi")
public class AdminNoleggioController {

	private final NoleggioClienteService noleggioClienteService;

	public AdminNoleggioController(NoleggioClienteService noleggioClienteService) {
		this.noleggioClienteService = noleggioClienteService;
	}

	@GetMapping
	public List<NoleggioClienteResponse> lista() {
		return noleggioClienteService.listaAttivi();
	}

	// chiude il noleggio in anticipo e avvisa il cliente via email
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void revoca(@PathVariable Long id) {
		noleggioClienteService.revoca(id);
	}

}

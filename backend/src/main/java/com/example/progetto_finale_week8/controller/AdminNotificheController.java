package com.example.progetto_finale_week8.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.progetto_finale_week8.payloads.response.RichiestaInteresseResponse;
import com.example.progetto_finale_week8.service.InteresseService;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/notifiche")
public class AdminNotificheController {

	private final InteresseService interesseService;

	public AdminNotificheController(InteresseService interesseService) {
		this.interesseService = interesseService;
	}

	@GetMapping
	public List<RichiestaInteresseResponse> lista() {
		return interesseService.lista();
	}

}

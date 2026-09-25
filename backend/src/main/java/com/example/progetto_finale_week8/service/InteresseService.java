package com.example.progetto_finale_week8.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Foto;
import com.example.progetto_finale_week8.entities.RichiestaInteresse;
import com.example.progetto_finale_week8.entities.TipoInteresse;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.payloads.response.RichiestaInteresseResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.FotoRepository;
import com.example.progetto_finale_week8.repository.RichiestaInteresseRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

// la richiesta finisce nelle Notifiche dell'admin, che ricontatta il cliente a mano;
// al cliente arriva subito un'email di conferma di ricezione
@Service
public class InteresseService {

	private final RichiestaInteresseRepository richiestaInteresseRepository;
	private final AutoRepository autoRepository;
	private final UserRepository userRepository;
	private final FotoRepository fotoRepository;
	private final EmailService emailService;
	private final String frontendUrl;

	public InteresseService(RichiestaInteresseRepository richiestaInteresseRepository, AutoRepository autoRepository,
			UserRepository userRepository, FotoRepository fotoRepository, EmailService emailService,
			@Value("${app.frontend-url}") String frontendUrl) {
		this.richiestaInteresseRepository = richiestaInteresseRepository;
		this.autoRepository = autoRepository;
		this.userRepository = userRepository;
		this.fotoRepository = fotoRepository;
		this.emailService = emailService;
		this.frontendUrl = frontendUrl;
	}

	@Transactional
	public void segnala(Long userId, Long autoId, TipoInteresse tipo) {
		Auto auto = autoRepository.findById(autoId).orElseThrow(() -> new NotFoundException("Auto non trovata"));
		User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("Utente non trovato"));

		RichiestaInteresse richiesta = new RichiestaInteresse();
		richiesta.setUser(user);
		richiesta.setAuto(auto);
		richiesta.setTipo(tipo);
		richiestaInteresseRepository.save(richiesta);

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("marca", auto.getMarca());
		contesto.setVariable("modello", auto.getModello());
		contesto.setVariable("tipo", tipo == TipoInteresse.NOLEGGIO ? "noleggio" : "acquisto");
		contesto.setVariable("foto", fotoRepository.findByAutoIdOrderByOrdineAsc(autoId).stream()
			.findFirst().map(Foto::getUrl).orElse(null));
		contesto.setVariable("link", frontendUrl + "/?auto=" + auto.getId());
		emailService.invia(user.getEmail(), "Abbiamo ricevuto la tua richiesta - " + auto.getMarca() + " " + auto.getModello(),
			"richiesta-informazioni", contesto);
	}

	@Transactional(readOnly = true)
	public List<RichiestaInteresseResponse> lista() {
		return richiestaInteresseRepository.findAllByOrderByCreatedAtDesc().stream()
			.map(RichiestaInteresseResponse::of)
			.toList();
	}

}

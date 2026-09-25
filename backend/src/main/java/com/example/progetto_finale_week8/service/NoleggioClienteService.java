package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.NoleggioAttivo;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.payloads.request.ConfermaNoleggioRequest;
import com.example.progetto_finale_week8.payloads.response.NoleggioClienteResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.NoleggioAttivoRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

// noleggio confermato a un cliente specifico: crea la riga (a differenza del vecchio
// preventivo, che era solo un'email) e manda le email di conferma/revoca - i template
// veri arriveranno dopo, per ora sono minimi
@Service
public class NoleggioClienteService {

	private final AutoRepository autoRepository;
	private final UserRepository userRepository;
	private final NoleggioAttivoRepository noleggioAttivoRepository;
	private final AutoService autoService;
	private final EmailService emailService;
	private final String frontendUrl;

	public NoleggioClienteService(AutoRepository autoRepository, UserRepository userRepository,
			NoleggioAttivoRepository noleggioAttivoRepository, AutoService autoService, EmailService emailService,
			@Value("${app.frontend-url}") String frontendUrl) {
		this.autoRepository = autoRepository;
		this.userRepository = userRepository;
		this.noleggioAttivoRepository = noleggioAttivoRepository;
		this.autoService = autoService;
		this.emailService = emailService;
		this.frontendUrl = frontendUrl;
	}

	@Transactional
	public NoleggioClienteResponse conferma(Long autoId, ConfermaNoleggioRequest r) {
		Auto auto = autoRepository.findById(autoId).orElseThrow(() -> new NotFoundException("Auto non trovata"));
		User user = userRepository.findById(r.userId()).orElseThrow(() -> new NotFoundException("Cliente non trovato"));

		if (r.percentualeSconto() != null && r.percentualeSconto() != 10 && r.percentualeSconto() != 15
				&& r.percentualeSconto() != 20) {
			throw new BadRequestException("Sconto non valido: solo 10, 15 o 20");
		}
		if (noleggioAttivoRepository.existsByAutoIdAndAttivoTrue(autoId)) {
			throw new BadRequestException("Questa auto è già noleggiata a un cliente");
		}

		BigDecimal prezzoScontato = r.percentualeSconto() == null
			? auto.getPrezzo()
			: auto.getPrezzo().multiply(BigDecimal.valueOf(100 - r.percentualeSconto()))
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

		if (r.anticipo().compareTo(prezzoScontato) >= 0) {
			throw new BadRequestException("L'anticipo non può coprire o superare il prezzo dell'auto");
		}

		BigDecimal rata = prezzoScontato.subtract(r.anticipo())
			.divide(BigDecimal.valueOf(r.mesi()), 2, RoundingMode.HALF_UP);

		NoleggioAttivo noleggio = new NoleggioAttivo();
		noleggio.setAuto(auto);
		noleggio.setUser(user);
		noleggio.setMesi(r.mesi());
		noleggio.setAnticipo(r.anticipo());
		noleggio.setPercentualeSconto(r.percentualeSconto());
		noleggio.setRata(rata);
		noleggioAttivoRepository.save(noleggio);

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("marca", auto.getMarca());
		contesto.setVariable("modello", auto.getModello());
		contesto.setVariable("mesi", noleggio.getMesi());
		contesto.setVariable("anticipo", noleggio.getAnticipo());
		contesto.setVariable("rata", rata);
		contesto.setVariable("link", frontendUrl + "/auto/" + auto.getId());
		emailService.invia(user.getEmail(), "Conferma noleggio - " + auto.getMarca() + " " + auto.getModello(),
			"conferma-noleggio", contesto);

		return NoleggioClienteResponse.of(noleggio, autoService.dettaglio(autoId, true));
	}

	@Transactional(readOnly = true)
	public List<NoleggioClienteResponse> listaAttivi() {
		return noleggioAttivoRepository.findByAttivoTrueOrderByCreatedAtDesc().stream()
			.map(n -> NoleggioClienteResponse.of(n, autoService.dettaglio(n.getAuto().getId(), true)))
			.toList();
	}

	@Transactional(readOnly = true)
	public Optional<NoleggioClienteResponse> mioNoleggio(Long userId) {
		return noleggioAttivoRepository.findByUserIdAndAttivoTrue(userId)
			.map(n -> NoleggioClienteResponse.of(n, autoService.dettaglio(n.getAuto().getId(), false)));
	}

	@Transactional
	public void revoca(Long id) {
		NoleggioAttivo noleggio = noleggioAttivoRepository.findById(id)
			.filter(NoleggioAttivo::isAttivo)
			.orElseThrow(() -> new NotFoundException("Noleggio non trovato"));
		noleggio.setAttivo(false);
		noleggio.setDataRevoca(Instant.now());

		Context contesto = new Context();
		contesto.setVariable("nome", noleggio.getUser().getNome());
		contesto.setVariable("marca", noleggio.getAuto().getMarca());
		contesto.setVariable("modello", noleggio.getAuto().getModello());
		emailService.invia(noleggio.getUser().getEmail(),
			"Il tuo noleggio è stato chiuso - " + noleggio.getAuto().getMarca() + " " + noleggio.getAuto().getModello(),
			"revoca-noleggio", contesto);
	}

}

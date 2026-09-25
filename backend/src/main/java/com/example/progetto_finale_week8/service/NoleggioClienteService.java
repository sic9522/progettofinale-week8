package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
import com.example.progetto_finale_week8.payloads.response.AutoResponse;
import com.example.progetto_finale_week8.payloads.response.NoleggioClienteResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.NoleggioAttivoRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

// noleggio confermato a un cliente specifico: crea la riga (a differenza del vecchio
// preventivo, che era solo un'email) e manda le email di conferma/revoca - i template
// veri arriveranno dopo, per ora sono minimi
@Service
public class NoleggioClienteService {

	private static final ObjectMapper JSON = new ObjectMapper();
	private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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

		AutoResponse dettaglio = autoService.dettaglio(autoId, true);
		LocalDate inizio = LocalDate.now();

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("marca", auto.getMarca());
		contesto.setVariable("modello", auto.getModello());
		contesto.setVariable("anno", auto.getAnno());
		contesto.setVariable("foto", dettaglio.foto().isEmpty() ? null : dettaglio.foto().get(0).url());
		contesto.setVariable("prezzoListino", auto.getPrezzo());
		contesto.setVariable("sconto", r.percentualeSconto());
		contesto.setVariable("mesi", noleggio.getMesi());
		contesto.setVariable("anticipo", noleggio.getAnticipo());
		contesto.setVariable("rata", rata);
		contesto.setVariable("totale", noleggio.getAnticipo().add(rata.multiply(BigDecimal.valueOf(r.mesi()))));
		contesto.setVariable("dataInizio", inizio.format(DATA));
		contesto.setVariable("dataFine", inizio.plusMonths(r.mesi()).format(DATA));
		contesto.setVariable("caratteristiche", caratteristiche(auto.getSpecificheJson()));
		contesto.setVariable("link", frontendUrl + "/?auto=" + auto.getId());
		emailService.invia(user.getEmail(), "Conferma noleggio - " + auto.getMarca() + " " + auto.getModello(),
			"conferma-noleggio", contesto);

		return NoleggioClienteResponse.of(noleggio, dettaglio);
	}

	// stesse voci mostrate nel retro della modale auto (CarModal.estraiSpecifiche), dal JSON
	// grezzo NHTSA: solo quelle valorizzate, nell'ordine in cui le legge un cliente
	private static Map<String, String> caratteristiche(String specificheJson) {
		Map<String, String> voci = new LinkedHashMap<>();
		if (specificheJson == null || specificheJson.isBlank()) {
			return voci;
		}
		JsonNode s;
		try {
			s = JSON.readTree(specificheJson);
		} catch (JacksonException e) {
			return voci;
		}
		aggiungi(voci, "Carrozzeria", s.path("BodyClass").asString(""));
		aggiungi(voci, "Cilindri", s.path("EngineCylinders").asString(""));
		aggiungi(voci, "Cilindrata", conUnita(s.path("DisplacementL").asString(""), " L"));
		aggiungi(voci, "Potenza", conUnita(s.path("EngineHP").asString(""), " CV"));
		aggiungi(voci, "Trazione", s.path("DriveType").asString(""));
		String trasmissione = s.path("TransmissionStyle").asString("");
		String marce = s.path("TransmissionSpeeds").asString("");
		aggiungi(voci, "Trasmissione", marce.isBlank() ? trasmissione : trasmissione + " - " + marce + " marce");
		aggiungi(voci, "Alimentazione", s.path("FuelTypePrimary").asString(""));
		aggiungi(voci, "Porte", s.path("Doors").asString(""));
		aggiungi(voci, "Posti", s.path("Seats").asString(""));
		aggiungi(voci, "Allestimento", s.path("Trim").asString(""));
		return voci;
	}

	private static void aggiungi(Map<String, String> voci, String etichetta, String valore) {
		if (valore != null && !valore.isBlank() && !valore.strip().startsWith("-")) {
			voci.put(etichetta, valore.strip());
		}
	}

	private static String conUnita(String valore, String unita) {
		return valore.isBlank() ? "" : valore + unita;
	}

	@Transactional(readOnly = true)
	public List<NoleggioClienteResponse> listaAttivi() {
		return noleggioAttivoRepository.findByAttivoTrueOrderByCreatedAtDesc().stream()
			.map(n -> NoleggioClienteResponse.of(n, autoService.dettaglio(n.getAuto().getId(), true)))
			.toList();
	}

	@Transactional(readOnly = true)
	public List<NoleggioClienteResponse> mieiNoleggi(Long userId) {
		return noleggioAttivoRepository.findByUserIdAndAttivoTrueOrderByCreatedAtAsc(userId).stream()
			.map(n -> NoleggioClienteResponse.of(n, autoService.dettaglio(n.getAuto().getId(), false)))
			.toList();
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

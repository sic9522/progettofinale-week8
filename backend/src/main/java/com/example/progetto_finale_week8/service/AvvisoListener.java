package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Preferito;
import com.example.progetto_finale_week8.entities.Foto;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.FotoRepository;
import com.example.progetto_finale_week8.repository.PreferitoRepository;

import static org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT;

// ascolta gli eventi pubblicati da AutoService dopo il commit: se il salvataggio
// dell'auto fallisce non parte nessuna mail, e chi ha fatto la modifica non aspetta
// l'invio per avere la risposta HTTP
@Component
public class AvvisoListener {

	private final PreferitoRepository preferitoRepository;
	private final AutoRepository autoRepository;
	private final FotoRepository fotoRepository;
	private final EmailService emailService;
	private final String frontendUrl;

	public AvvisoListener(PreferitoRepository preferitoRepository, AutoRepository autoRepository,
			FotoRepository fotoRepository, EmailService emailService, @Value("${app.frontend-url}") String frontendUrl) {
		this.preferitoRepository = preferitoRepository;
		this.autoRepository = autoRepository;
		this.fotoRepository = fotoRepository;
		this.emailService = emailService;
		this.frontendUrl = frontendUrl;
	}

	@Async
	@TransactionalEventListener(phase = AFTER_COMMIT)
	public void onPrezzoCambiato(PrezzoCambiatoEvent event) {
		// solo i ribassi: un aumento (o la rimozione di un'offerta) non e' una buona notizia
		if (event.nuovoPrezzo().compareTo(event.prezzoPrecedente()) >= 0) {
			return;
		}
		Auto auto = autoRepository.findById(event.autoId()).orElse(null);
		if (auto == null) {
			return;
		}
		String foto = copertina(auto.getId());

		// ogni ribasso e' un evento a se': a chi ha l'auto nei preferiti arriva una mail per
		// ciascuno. La soglia, se il cliente l'ha impostata, filtra i ribassi troppo piccoli
		for (Preferito preferito : preferitoRepository.findByAutoIdAndNotificaPrezzoTrue(event.autoId())) {
			BigDecimal soglia = preferito.getSogliaPrezzo();
			if (soglia != null && event.nuovoPrezzo().compareTo(soglia) > 0) {
				continue;
			}
			Context contesto = new Context();
			contesto.setVariable("nome", preferito.getUser().getNome());
			contesto.setVariable("marca", auto.getMarca());
			contesto.setVariable("modello", auto.getModello());
			contesto.setVariable("foto", foto);
			contesto.setVariable("prezzoPrecedente", event.prezzoPrecedente());
			contesto.setVariable("prezzo", event.nuovoPrezzo());
			contesto.setVariable("link", frontendUrl + "/?auto=" + auto.getId());
			contesto.setVariable("linkDisiscrizione",
				frontendUrl + "/disiscrivi/prezzo?token=" + preferito.getTokenDisiscrizionePrezzo());
			emailService.invia(preferito.getUser().getEmail(), "Il prezzo è sceso: " + auto.getMarca() + " " + auto.getModello(),
				"avviso-prezzo", contesto);
		}
	}

	@Async
	@TransactionalEventListener(phase = AFTER_COMMIT)
	public void onDisponibilitaCambiata(DisponibilitaCambiataEvent event) {
		Auto auto = autoRepository.findById(event.autoId()).orElse(null);
		if (auto == null) {
			return;
		}
		List<Preferito> preferiti = preferitoRepository
			.findByAutoIdAndNotificaDisponibilitaTrueAndDisponibilitaInviataFalse(event.autoId());

		for (Preferito preferito : preferiti) {
			if (preferitoRepository.segnaDisponibilitaInviata(preferito.getId()) == 1) {
				Context contesto = new Context();
				contesto.setVariable("nome", preferito.getUser().getNome());
				contesto.setVariable("marca", auto.getMarca());
				contesto.setVariable("modello", auto.getModello());
				contesto.setVariable("foto", copertina(auto.getId()));
				contesto.setVariable("linkVetrina", frontendUrl + "/");
				contesto.setVariable("linkDisiscrizione",
					frontendUrl + "/disiscrivi/disponibilita?token=" + preferito.getTokenDisiscrizioneDisponibilita());
				emailService.invia(preferito.getUser().getEmail(), "Non più disponibile: " + auto.getMarca() + " " + auto.getModello(),
					"avviso-disponibilita", contesto);
			}
		}
	}

	// la foto con ordine piu' basso e' la copertina (vedi Foto.ordine)
	private String copertina(Long autoId) {
		return fotoRepository.findByAutoIdOrderByOrdineAsc(autoId).stream().findFirst().map(Foto::getUrl).orElse(null);
	}

}

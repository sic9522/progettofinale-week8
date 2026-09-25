package com.example.progetto_finale_week8.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Preferito;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.PreferitoRepository;

import static org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT;

// ascolta gli eventi pubblicati da AutoService dopo il commit: se il salvataggio
// dell'auto fallisce non parte nessuna mail, e chi ha fatto la modifica non aspetta
// l'invio per avere la risposta HTTP
@Component
public class AvvisoListener {

	private final PreferitoRepository preferitoRepository;
	private final AutoRepository autoRepository;
	private final EmailService emailService;
	private final String frontendUrl;

	public AvvisoListener(PreferitoRepository preferitoRepository, AutoRepository autoRepository,
			EmailService emailService, @Value("${app.frontend-url}") String frontendUrl) {
		this.preferitoRepository = preferitoRepository;
		this.autoRepository = autoRepository;
		this.emailService = emailService;
		this.frontendUrl = frontendUrl;
	}

	@Async
	@TransactionalEventListener(phase = AFTER_COMMIT)
	public void onPrezzoCambiato(PrezzoCambiatoEvent event) {
		Auto auto = autoRepository.findById(event.autoId()).orElse(null);
		if (auto == null) {
			return;
		}
		List<Preferito> preferiti = preferitoRepository
			.findByAutoIdAndSogliaPrezzoGreaterThanEqualAndPrezzoInviatoFalse(event.autoId(), event.nuovoPrezzo());

		for (Preferito preferito : preferiti) {
			// UPDATE condizionato: se due eventi arrivano quasi insieme, solo uno dei due
			// aggiorna davvero la riga e quindi manda la mail
			if (preferitoRepository.segnaPrezzoInviato(preferito.getId()) == 1) {
				Context contesto = new Context();
				contesto.setVariable("marca", auto.getMarca());
				contesto.setVariable("modello", auto.getModello());
				contesto.setVariable("prezzo", event.nuovoPrezzo());
				contesto.setVariable("link", frontendUrl + "/auto/" + auto.getId());
				contesto.setVariable("linkDisiscrizione",
					frontendUrl + "/disiscrivi/prezzo?token=" + preferito.getTokenDisiscrizionePrezzo());
				emailService.invia(preferito.getUser().getEmail(), "Il prezzo è sceso: " + auto.getMarca() + " " + auto.getModello(),
					"avviso-prezzo", contesto);
			}
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
				contesto.setVariable("marca", auto.getMarca());
				contesto.setVariable("modello", auto.getModello());
				contesto.setVariable("linkDisiscrizione",
					frontendUrl + "/disiscrivi/disponibilita?token=" + preferito.getTokenDisiscrizioneDisponibilita());
				emailService.invia(preferito.getUser().getEmail(), "Non più disponibile: " + auto.getMarca() + " " + auto.getModello(),
					"avviso-disponibilita", contesto);
			}
		}
	}

}

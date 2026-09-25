package com.example.progetto_finale_week8.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Preferito;
import com.example.progetto_finale_week8.entities.StatoAuto;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.payloads.request.PreferitoRequest;
import com.example.progetto_finale_week8.payloads.response.PreferitoResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.PreferitoRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

@Service
public class PreferitoService {

	private final PreferitoRepository preferitoRepository;
	private final AutoRepository autoRepository;
	private final UserRepository userRepository;
	private final AutoService autoService;

	public PreferitoService(PreferitoRepository preferitoRepository, AutoRepository autoRepository,
			UserRepository userRepository, AutoService autoService) {
		this.preferitoRepository = preferitoRepository;
		this.autoRepository = autoRepository;
		this.userRepository = userRepository;
		this.autoService = autoService;
	}

	@Transactional(readOnly = true)
	public List<PreferitoResponse> lista(Long userId) {
		return preferitoRepository.findByUserId(userId).stream()
			.map(p -> PreferitoResponse.of(p, autoService.dettaglio(p.getAuto().getId(), false)))
			.toList();
	}

	@Transactional
	public PreferitoResponse aggiungi(Long userId, Long autoId, PreferitoRequest r) {
		if (preferitoRepository.findByUserIdAndAutoId(userId, autoId).isPresent()) {
			throw new BadRequestException("Auto già nei preferiti");
		}
		Auto auto = autoRepository.findById(autoId).orElseThrow(() -> new NotFoundException("Auto non trovata"));
		if (auto.getStato() == StatoAuto.BOZZA) {
			throw new NotFoundException("Auto non trovata");
		}
		User user = userRepository.getReferenceById(userId);

		Preferito preferito = new Preferito();
		preferito.setUser(user);
		preferito.setAuto(auto);
		preferito.setSogliaPrezzo(r.sogliaPrezzo());
		if (r.notificaDisponibilita() != null) {
			preferito.setNotificaDisponibilita(r.notificaDisponibilita());
		}
		preferitoRepository.save(preferito);

		return PreferitoResponse.of(preferito, autoService.dettaglio(autoId, false));
	}

	@Transactional
	public PreferitoResponse aggiorna(Long userId, Long preferitoId, PreferitoRequest r) {
		Preferito preferito = trova(preferitoId, userId);

		if (!Objects.equals(preferito.getSogliaPrezzo(), r.sogliaPrezzo())) {
			// chi imposta una soglia vuole gli avvisi: li riaccende anche se li aveva disattivati
			preferito.setSogliaPrezzo(r.sogliaPrezzo());
			preferito.setNotificaPrezzo(true);
		}
		if (r.notificaDisponibilita() != null && r.notificaDisponibilita() && !preferito.isNotificaDisponibilita()) {
			preferito.setDisponibilitaInviata(false);
		}
		if (r.notificaDisponibilita() != null) {
			preferito.setNotificaDisponibilita(r.notificaDisponibilita());
		}

		return PreferitoResponse.of(preferito, autoService.dettaglio(preferito.getAuto().getId(), false));
	}

	@Transactional
	public void rimuovi(Long userId, Long preferitoId) {
		preferitoRepository.delete(trova(preferitoId, userId));
	}

	@Transactional
	public void disiscriviPrezzo(UUID token) {
		Preferito preferito = preferitoRepository.findByTokenDisiscrizionePrezzo(token)
			.orElseThrow(() -> new BadRequestException("Link non valido"));
		preferito.setNotificaPrezzo(false);
	}

	@Transactional
	public void disiscriviDisponibilita(UUID token) {
		Preferito preferito = preferitoRepository.findByTokenDisiscrizioneDisponibilita(token)
			.orElseThrow(() -> new BadRequestException("Link non valido"));
		preferito.setNotificaDisponibilita(false);
	}

	private Preferito trova(Long id, Long userId) {
		// per id e proprietario insieme: un id che non appartiene al chiamante non deve
		// nemmeno risultare che esiste
		return preferitoRepository.findByIdAndUserId(id, userId)
			.orElseThrow(() -> new NotFoundException("Preferito non trovato"));
	}

}

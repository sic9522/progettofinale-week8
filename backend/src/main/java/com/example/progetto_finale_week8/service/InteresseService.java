package com.example.progetto_finale_week8.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.RichiestaInteresse;
import com.example.progetto_finale_week8.entities.TipoInteresse;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.payloads.response.RichiestaInteresseResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.RichiestaInteresseRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

@Service
public class InteresseService {

	private final RichiestaInteresseRepository richiestaInteresseRepository;
	private final AutoRepository autoRepository;
	private final UserRepository userRepository;

	public InteresseService(RichiestaInteresseRepository richiestaInteresseRepository, AutoRepository autoRepository,
			UserRepository userRepository) {
		this.richiestaInteresseRepository = richiestaInteresseRepository;
		this.autoRepository = autoRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public void segnala(Long userId, Long autoId, TipoInteresse tipo) {
		Auto auto = autoRepository.findById(autoId).orElseThrow(() -> new NotFoundException("Auto non trovata"));
		User user = userRepository.getReferenceById(userId);

		RichiestaInteresse richiesta = new RichiestaInteresse();
		richiesta.setUser(user);
		richiesta.setAuto(auto);
		richiesta.setTipo(tipo);
		richiestaInteresseRepository.save(richiesta);
	}

	@Transactional(readOnly = true)
	public List<RichiestaInteresseResponse> lista() {
		return richiestaInteresseRepository.findAllByOrderByCreatedAtDesc().stream()
			.map(RichiestaInteresseResponse::of)
			.toList();
	}

}

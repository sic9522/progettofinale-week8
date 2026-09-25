package com.example.progetto_finale_week8.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.RegistrationToken;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.repository.RegistrationTokenRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

@Service
public class RegistrationTokenService {

	private final RegistrationTokenRepository registrationTokenRepository;
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final String frontendUrl;

	public RegistrationTokenService(RegistrationTokenRepository registrationTokenRepository,
			UserRepository userRepository, EmailService emailService,
			@Value("${app.frontend-url}") String frontendUrl) {
		this.registrationTokenRepository = registrationTokenRepository;
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.frontendUrl = frontendUrl;
	}

	@Transactional
	public void creaEInvia(User user) {
		RegistrationToken token = new RegistrationToken();
		token.setUser(user);
		registrationTokenRepository.save(token);

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("link", frontendUrl + "/conferma?token=" + token.getId());
		emailService.invia(user.getEmail(), "Conferma la tua registrazione", "conferma-registrazione", contesto);
	}

	@Transactional
	public void conferma(UUID token) {
		RegistrationToken registrationToken = registrationTokenRepository.findById(token)
			.orElseThrow(() -> new BadRequestException("Link di conferma non valido"));
		if (registrationToken.isUsed() || registrationToken.getExpireAt().isBefore(Instant.now())) {
			throw new BadRequestException("Link di conferma scaduto o già usato");
		}
		registrationToken.setUsed(true);
		User user = registrationToken.getUser();
		user.setVerified(true);
		userRepository.save(user);
	}

}

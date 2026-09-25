package com.example.progetto_finale_week8.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.PasswordResetToken;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.repository.PasswordResetTokenRepository;
import com.example.progetto_finale_week8.repository.UserRepository;

@Service
public class PasswordResetService {

	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;
	private final String frontendUrl;

	public PasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository, UserRepository userRepository,
			EmailService emailService, PasswordEncoder passwordEncoder, @Value("${app.frontend-url}") String frontendUrl) {
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.passwordEncoder = passwordEncoder;
		this.frontendUrl = frontendUrl;
	}

	// email inesistente non deve rivelarsi: stesso principio di UserService.login,
	// per questo il metodo non lancia mai un errore legato all'email
	@Transactional
	public void richiedi(String email) {
		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null) {
			return;
		}
		PasswordResetToken token = new PasswordResetToken();
		token.setUser(user);
		passwordResetTokenRepository.save(token);

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("link", frontendUrl + "/reimposta-password?token=" + token.getId());
		emailService.invia(user.getEmail(), "Reimposta la tua password", "reimposta-password", contesto);
	}

	@Transactional
	public void reimposta(UUID token, String nuovaPassword) {
		PasswordResetToken resetToken = passwordResetTokenRepository.findById(token)
			.orElseThrow(() -> new BadRequestException("Link non valido"));
		if (resetToken.isUsed() || resetToken.getExpireAt().isBefore(Instant.now())) {
			throw new BadRequestException("Link scaduto o già usato");
		}
		resetToken.setUsed(true);
		User user = resetToken.getUser();
		user.setPassword(passwordEncoder.encode(nuovaPassword));
		userRepository.save(user);
	}

}

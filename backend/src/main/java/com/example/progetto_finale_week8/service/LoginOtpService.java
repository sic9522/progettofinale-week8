package com.example.progetto_finale_week8.service;

import java.security.SecureRandom;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.example.progetto_finale_week8.entities.LoginOtp;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.UnauthorizedException;
import com.example.progetto_finale_week8.repository.LoginOtpRepository;

@Service
public class LoginOtpService {

	private static final SecureRandom RANDOM = new SecureRandom();

	private final LoginOtpRepository loginOtpRepository;
	private final EmailService emailService;

	public LoginOtpService(LoginOtpRepository loginOtpRepository, EmailService emailService) {
		this.loginOtpRepository = loginOtpRepository;
		this.emailService = emailService;
	}

	@Transactional
	public void generaEInvia(User user) {
		LoginOtp otp = new LoginOtp();
		otp.setUser(user);
		otp.setCodice(codiceCasuale());
		loginOtpRepository.save(otp);

		Context contesto = new Context();
		contesto.setVariable("nome", user.getNome());
		contesto.setVariable("codice", otp.getCodice());
		emailService.invia(user.getEmail(), "Il tuo codice di accesso", "codice-otp", contesto);
	}

	@Transactional
	public void verifica(User user, String codice) {
		LoginOtp otp = loginOtpRepository.findTopByUserOrderByCreatedAtDesc(user)
			.orElseThrow(() -> new UnauthorizedException("Codice non valido o scaduto"));
		if (otp.isUsed() || otp.getExpireAt().isBefore(Instant.now()) || !otp.getCodice().equals(codice)) {
			throw new UnauthorizedException("Codice non valido o scaduto");
		}
		otp.setUsed(true);
	}

	private String codiceCasuale() {
		return String.format("%06d", RANDOM.nextInt(1_000_000));
	}

}

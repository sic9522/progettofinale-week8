package com.example.progetto_finale_week8.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Ruolo;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.repository.UserRepository;

// crea l'unico admin se non esiste già: nessuna registrazione admin, login sempre password+OTP come tutti
@Component
public class DataInitializer implements ApplicationRunner {

	// identità fissa di questo progetto, non un valore di deploy: non ha senso configurarla per ambiente
	private static final String ADMIN_SOCIETA = "SicLuxuryCars";
	private static final String ADMIN_INDIRIZZO = "Via Appia Nuova 194";
	private static final String ADMIN_CITTA = "Roma";
	private static final String ADMIN_CAP = "00183";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.admin.email}")
	private String adminEmail;

	@Value("${app.admin.username}")
	private String adminUsername;

	@Value("${app.admin.nome}")
	private String adminNome;

	@Value("${app.admin.cognome}")
	private String adminCognome;

	@Value("${app.admin.password}")
	private String adminPassword;

	public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (userRepository.existsByEmail(adminEmail)) {
			return;
		}
		User admin = new User();
		admin.setEmail(adminEmail);
		admin.setUsername(adminUsername);
		admin.setNome(adminNome);
		admin.setCognome(adminCognome);
		admin.setPassword(passwordEncoder.encode(adminPassword));
		admin.setRuolo(Ruolo.ADMIN);
		admin.setVerified(true);
		admin.setSocieta(ADMIN_SOCIETA);
		admin.setIndirizzo(ADMIN_INDIRIZZO);
		admin.setCitta(ADMIN_CITTA);
		admin.setCap(ADMIN_CAP);
		userRepository.save(admin);
	}

}

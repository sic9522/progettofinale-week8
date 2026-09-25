package com.example.progetto_finale_week8.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Ruolo;
import com.example.progetto_finale_week8.entities.User;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.exceptions.UnauthorizedException;
import com.example.progetto_finale_week8.payloads.request.RegisterRequest;
import com.example.progetto_finale_week8.payloads.response.LoginResponse;
import com.example.progetto_finale_week8.payloads.response.UserResponse;
import com.example.progetto_finale_week8.repository.LoginOtpRepository;
import com.example.progetto_finale_week8.repository.PasswordResetTokenRepository;
import com.example.progetto_finale_week8.repository.PreferitoRepository;
import com.example.progetto_finale_week8.repository.RegistrationTokenRepository;
import com.example.progetto_finale_week8.repository.UserRepository;
import com.example.progetto_finale_week8.security.JwtService;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PreferitoRepository preferitoRepository;
	private final LoginOtpRepository loginOtpRepository;
	private final RegistrationTokenRepository registrationTokenRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final RegistrationTokenService registrationTokenService;
	private final LoginOtpService loginOtpService;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PreferitoRepository preferitoRepository,
			LoginOtpRepository loginOtpRepository, RegistrationTokenRepository registrationTokenRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			RegistrationTokenService registrationTokenService, LoginOtpService loginOtpService,
			JwtService jwtService, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.preferitoRepository = preferitoRepository;
		this.loginOtpRepository = loginOtpRepository;
		this.registrationTokenRepository = registrationTokenRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.registrationTokenService = registrationTokenService;
		this.loginOtpService = loginOtpService;
		this.jwtService = jwtService;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public void registra(RegisterRequest r) {
		if (userRepository.existsByEmail(r.email())) {
			throw new BadRequestException("Email già registrata");
		}
		if (userRepository.existsByUsername(r.username())) {
			throw new BadRequestException("Username già in uso");
		}
		User user = new User();
		user.setEmail(r.email());
		user.setUsername(r.username());
		user.setNome(r.nome());
		user.setCognome(r.cognome());
		user.setPassword(passwordEncoder.encode(r.password()));
		user.setIndirizzo(r.indirizzo());
		user.setCitta(r.citta());
		user.setCap(r.cap());
		userRepository.save(user);
		registrationTokenService.creaEInvia(user);
	}

	// primo passo del login: password corretta -> parte l'OTP che completa l'accesso.
	// email inesistente ed email esistente con password sbagliata danno lo stesso errore:
	// non deve trapelare quali email sono registrate.
	// L'admin e' unico e non ha una casella di posta da controllare per l'OTP: password
	// corretta gli basta, riceve subito il token
	@Transactional
	public LoginResponse login(String email, String password) {
		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
			throw new UnauthorizedException("Credenziali non valide");
		}
		if (!user.isVerified()) {
			throw new BadRequestException("Conferma prima la registrazione dal link ricevuto via email");
		}
		if (user.getRuolo() == Ruolo.ADMIN) {
			return LoginResponse.of(jwtService.generateToken(user.getId(), user.getRuolo()));
		}
		loginOtpService.generaEInvia(user);
		return null;
	}

	@Transactional
	public LoginResponse verificaOtp(String email, String codice) {
		User user = trovaPerEmail(email);
		loginOtpService.verifica(user, codice);
		return LoginResponse.of(jwtService.generateToken(user.getId(), user.getRuolo()));
	}

	@Transactional(readOnly = true)
	public UserResponse me(Long id) {
		return UserResponse.of(userRepository.findById(id).orElseThrow(() -> new NotFoundException("Utente non trovato")));
	}

	// numero tessera stampato sulla patente nel profilo: l'admin lo usa per trovare
	// l'account senza chiedere email o username
	@Transactional(readOnly = true)
	public UserResponse trovaPerTessera(UUID numeroTessera) {
		return UserResponse.of(userRepository.findByNumeroTessera(numeroTessera)
			.orElseThrow(() -> new NotFoundException("Nessun account con questo numero tessera")));
	}

	// per la ricerca cliente nel preventivo noleggio: id numerico esatto, email esatta,
	// altrimenti cognome (puo' dare piu' risultati, l'admin sceglie quello giusto)
	@Transactional(readOnly = true)
	public List<UserResponse> cercaPerTermine(String termine) {
		String pulito = termine.trim();
		if (pulito.matches("\\d+")) {
			return userRepository.findById(Long.valueOf(pulito)).map(UserResponse::of).map(List::of).orElse(List.of());
		}
		if (pulito.contains("@")) {
			return userRepository.findByEmail(pulito).map(UserResponse::of).map(List::of).orElse(List.of());
		}
		return userRepository.findByCognomeContainingIgnoreCase(pulito).stream().map(UserResponse::of).toList();
	}

	// cancella preferiti/avvisi prima dell'utente: da quel momento non parte più nessuna mail
	@Transactional
	public void eliminaAccount(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Utente non trovato"));
		if (user.getRuolo() == Ruolo.ADMIN) {
			throw new BadRequestException("L'account amministratore non può essere eliminato da qui");
		}
		preferitoRepository.deleteByUserId(id);
		loginOtpRepository.deleteByUserId(id);
		registrationTokenRepository.deleteByUserId(id);
		passwordResetTokenRepository.deleteByUserId(id);
		userRepository.delete(user);
	}

	private User trovaPerEmail(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Utente non trovato"));
	}

}

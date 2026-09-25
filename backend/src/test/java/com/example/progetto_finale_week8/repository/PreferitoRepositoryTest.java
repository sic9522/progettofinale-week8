package com.example.progetto_finale_week8.repository;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Preferito;
import com.example.progetto_finale_week8.entities.StatoAuto;
import com.example.progetto_finale_week8.entities.User;

import static org.assertj.core.api.Assertions.assertThat;

// gira su H2 in memoria (@DataJpaTest sostituisce il datasource), non serve un Postgres locale.
// Verifica l'unica cosa che conta per non mandare due mail per lo stesso avviso: il secondo
// UPDATE condizionato su una riga già segnata non aggiorna niente.
@DataJpaTest
class PreferitoRepositoryTest {

	@Autowired
	private PreferitoRepository preferitoRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private AutoRepository autoRepository;

	@Test
	void segnaInviatoEIdempotente() {
		User user = new User();
		user.setEmail("mario@example.com");
		user.setUsername("mario");
		user.setNome("Mario");
		user.setCognome("Rossi");
		user.setPassword("hash");
		userRepository.save(user);

		Auto auto = new Auto();
		auto.setVin("WP0AA2990WS321225");
		auto.setMarca("Porsche");
		auto.setModello("911");
		auto.setAnno(2019);
		auto.setPrezzo(new BigDecimal("120000.00"));
		auto.setPrezzoAcquisto(new BigDecimal("100000.00"));
		auto.setStato(StatoAuto.PUBBLICATA);
		autoRepository.save(auto);

		Preferito preferito = new Preferito();
		preferito.setUser(user);
		preferito.setAuto(auto);
		preferito.setSogliaPrezzo(new BigDecimal("130000.00"));
		preferitoRepository.save(preferito);

		int primoDisponibilita = preferitoRepository.segnaDisponibilitaInviata(preferito.getId());
		int secondoDisponibilita = preferitoRepository.segnaDisponibilitaInviata(preferito.getId());

		assertThat(primoDisponibilita).isEqualTo(1);
		assertThat(secondoDisponibilita).isEqualTo(0);
	}

}

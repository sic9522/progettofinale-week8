package com.example.progetto_finale_week8.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Preferito;

public interface PreferitoRepository extends JpaRepository<Preferito, Long> {

	List<Preferito> findByUserId(Long userId);

	void deleteByUserId(Long userId);

	Optional<Preferito> findByIdAndUserId(Long id, Long userId);

	Optional<Preferito> findByUserIdAndAutoId(Long userId, Long autoId);

	Optional<Preferito> findByTokenDisiscrizionePrezzo(UUID token);

	Optional<Preferito> findByTokenDisiscrizioneDisponibilita(UUID token);

	List<Preferito> findByAutoIdAndNotificaPrezzoTrue(Long autoId);

	List<Preferito> findByAutoIdAndNotificaDisponibilitaTrueAndDisponibilitaInviataFalse(Long autoId);

	// UPDATE atomico: due eventi ravvicinati sullo stesso preferito non mandano due mail.
	// @Transactional qui: AvvisoListener gira dopo il commit, fuori da ogni transazione,
	// e senza una propria l'UPDATE falliva (TransactionRequiredException) prima dell'email
	@Transactional
	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("UPDATE Preferito p SET p.disponibilitaInviata = true WHERE p.id = :id AND p.disponibilitaInviata = false")
	int segnaDisponibilitaInviata(@Param("id") Long id);

}

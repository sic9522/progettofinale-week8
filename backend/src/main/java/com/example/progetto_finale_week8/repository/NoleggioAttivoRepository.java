package com.example.progetto_finale_week8.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.NoleggioAttivo;

public interface NoleggioAttivoRepository extends JpaRepository<NoleggioAttivo, Long> {

	boolean existsByAutoIdAndAttivoTrue(Long autoId);

	List<NoleggioAttivo> findByAttivoTrueOrderByCreatedAtDesc();

	// un cliente puo' avere piu' auto a noleggio insieme: dalla prima confermata in poi
	List<NoleggioAttivo> findByUserIdAndAttivoTrueOrderByCreatedAtAsc(Long userId);

}

package com.example.progetto_finale_week8.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.NoleggioAttivo;

public interface NoleggioAttivoRepository extends JpaRepository<NoleggioAttivo, Long> {

	boolean existsByAutoIdAndAttivoTrue(Long autoId);

	List<NoleggioAttivo> findByAttivoTrueOrderByCreatedAtDesc();

	Optional<NoleggioAttivo> findByUserIdAndAttivoTrue(Long userId);

}

package com.example.progetto_finale_week8.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.StoricoPrezzo;

public interface StoricoPrezzoRepository extends JpaRepository<StoricoPrezzo, Long> {

	List<StoricoPrezzo> findByAutoIdOrderByCambiatoAtDesc(Long autoId);

}

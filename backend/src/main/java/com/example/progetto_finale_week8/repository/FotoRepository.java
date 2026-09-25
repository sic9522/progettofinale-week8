package com.example.progetto_finale_week8.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.Foto;

public interface FotoRepository extends JpaRepository<Foto, Long> {

	List<Foto> findByAutoIdOrderByOrdineAsc(Long autoId);

	void deleteByAutoId(Long autoId);

}

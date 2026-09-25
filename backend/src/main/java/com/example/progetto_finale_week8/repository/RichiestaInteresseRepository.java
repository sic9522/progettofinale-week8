package com.example.progetto_finale_week8.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.RichiestaInteresse;

public interface RichiestaInteresseRepository extends JpaRepository<RichiestaInteresse, Long> {

	List<RichiestaInteresse> findAllByOrderByCreatedAtDesc();

}

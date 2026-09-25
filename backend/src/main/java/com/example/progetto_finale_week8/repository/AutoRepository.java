package com.example.progetto_finale_week8.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.progetto_finale_week8.entities.Auto;

public interface AutoRepository extends JpaRepository<Auto, Long>, JpaSpecificationExecutor<Auto> {

	boolean existsByVin(String vin);

}

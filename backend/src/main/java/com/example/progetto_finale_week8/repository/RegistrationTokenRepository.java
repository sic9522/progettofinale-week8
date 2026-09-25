package com.example.progetto_finale_week8.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.RegistrationToken;

public interface RegistrationTokenRepository extends JpaRepository<RegistrationToken, UUID> {

	void deleteByUserId(Long userId);

}

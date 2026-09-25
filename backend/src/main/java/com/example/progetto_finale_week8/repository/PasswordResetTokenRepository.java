package com.example.progetto_finale_week8.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

	void deleteByUserId(Long userId);

}

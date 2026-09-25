package com.example.progetto_finale_week8.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.LoginOtp;
import com.example.progetto_finale_week8.entities.User;

public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {

	Optional<LoginOtp> findTopByUserOrderByCreatedAtDesc(User user);

	void deleteByUserId(Long userId);

}

package com.example.progetto_finale_week8.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.progetto_finale_week8.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByUsername(String username);

	Optional<User> findByNumeroTessera(UUID numeroTessera);

	List<User> findByCognomeContainingIgnoreCaseOrNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(
		String cognome, String nome, String email);

}

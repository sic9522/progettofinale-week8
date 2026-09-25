package com.example.progetto_finale_week8;

import com.example.progetto_finale_week8.config.DatabaseUrl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ProgettoFinaleWeek8Application {

	public static void main(String[] args) {
		// Su Render le credenziali arrivano in DATABASE_URL, formato non JDBC:
		// la traduzione va fatta prima che parta il contesto Spring.
		DatabaseUrl.applicaSePresente();

		SpringApplication.run(ProgettoFinaleWeek8Application.class, args);
	}

}

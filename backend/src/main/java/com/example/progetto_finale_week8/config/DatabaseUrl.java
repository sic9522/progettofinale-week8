package com.example.progetto_finale_week8.config;

import java.net.URI;

/**
 * Render consegna il database in DATABASE_URL (postgresql://utente:password@host:5432/nome_db),
 * ma il driver JDBC vuole tre proprieta' separate e un indirizzo jdbc:postgresql://.
 * La traduzione va fatta prima che parta il contesto Spring, scrivendo nelle system
 * property (hanno precedenza su application.properties). In locale la variabile non
 * esiste e il metodo non fa niente.
 */
public final class DatabaseUrl {

	private DatabaseUrl() {
	}

	public static void applicaSePresente() {
		String grezzo = System.getenv("DATABASE_URL");
		if (grezzo == null || grezzo.isBlank()) {
			return;
		}
		if (grezzo.startsWith("jdbc:")) {
			System.setProperty("spring.datasource.url", grezzo);
			return;
		}

		URI uri = URI.create(grezzo.trim());
		String[] credenziali = uri.getUserInfo() == null ? new String[0] : uri.getUserInfo().split(":", 2);
		int porta = uri.getPort() == -1 ? 5432 : uri.getPort();

		String jdbc = "jdbc:postgresql://%s:%d%s?sslmode=require".formatted(uri.getHost(), porta, uri.getPath());

		System.setProperty("spring.datasource.url", jdbc);
		if (credenziali.length > 0) {
			System.setProperty("spring.datasource.username", credenziali[0]);
		}
		if (credenziali.length > 1) {
			System.setProperty("spring.datasource.password", credenziali[1]);
		}

		System.out.println("[database] DATABASE_URL tradotta in " + jdbc);
	}
}

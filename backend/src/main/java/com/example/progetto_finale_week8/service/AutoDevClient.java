package com.example.progetto_finale_week8.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.example.progetto_finale_week8.exceptions.BadRequestException;

import tools.jackson.databind.JsonNode;

// specifiche da NHTSA vPIC (vpic.nhtsa.dot.gov): gratuito, nessuna chiave, nessun limite
// pratico. L'endpoint /specs di auto.dev e' passato al piano Growth (259$/mese) e non e'
// piu' incluso nel piano gratuito, nonostante quanto scritto in precedenza in Decisioni.txt
// Foto da auto.dev (/photos), unica fonte gratuita di foto vere trovata: la copertura non
// e' garantita per ogni VIN, va verificata prima di creare l'auto (foto() puo' tornare vuoto)
@Service
public class AutoDevClient {

	private static final String AUTODEV_BASE_URL = "https://api.auto.dev";
	private static final String NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

	private final RestClient autoDevClient;
	private final RestClient nhtsaClient;

	public AutoDevClient(@Value("${autodev.api-key}") String apiKey) {
		this.autoDevClient = RestClient.builder()
			.baseUrl(AUTODEV_BASE_URL)
			.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
			.build();
		this.nhtsaClient = RestClient.builder()
			.baseUrl(NHTSA_BASE_URL)
			.build();
	}

	public SpecificheAuto specifiche(String vin) {
		JsonNode risultato = decodificaVin(vin);
		if (!"0".equals(risultato.path("ErrorCode").asString(""))) {
			throw new BadRequestException("VIN non valido: " + risultato.path("ErrorText").asString(""));
		}
		String marca = risultato.path("Make").asString();
		String modello = risultato.path("Model").asString();
		int anno = risultato.path("ModelYear").asInt(0);
		if (marca.isBlank() || modello.isBlank() || anno == 0) {
			throw new BadRequestException("VIN senza dati sufficienti su NHTSA: " + vin);
		}
		return new SpecificheAuto(marca, modello, anno, risultato.toString());
	}

	public List<String> foto(String vin) {
		JsonNode retail = chiamaAutoDev("/photos/" + vin).path("data").path("retail");
		List<String> urls = new ArrayList<>();
		retail.forEach(nodo -> urls.add(nodo.asString()));
		return urls;
	}

	private JsonNode decodificaVin(String vin) {
		try {
			JsonNode body = nhtsaClient.get().uri("/DecodeVinValues/" + vin + "?format=json").retrieve().body(JsonNode.class);
			return body.path("Results").get(0);
		} catch (RestClientResponseException e) {
			throw new BadRequestException("VIN non valido: " + vin);
		}
	}

	private JsonNode chiamaAutoDev(String path) {
		try {
			return autoDevClient.get().uri(path).retrieve().body(JsonNode.class);
		} catch (RestClientResponseException e) {
			throw new BadRequestException("Foto non disponibili su auto.dev per il VIN: " + vinDaPath(path));
		}
	}

	private String vinDaPath(String path) {
		return path.substring(path.lastIndexOf('/') + 1);
	}

}

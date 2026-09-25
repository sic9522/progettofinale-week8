package com.example.progetto_finale_week8.payloads.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.progetto_finale_week8.entities.NoleggioAttivo;

public record NoleggioClienteResponse(
	Long id,
	AutoResponse auto,
	String clienteNome,
	String clienteCognome,
	String clienteEmail,
	Integer mesi,
	BigDecimal anticipo,
	BigDecimal rata,
	Instant dataInizio
) {
	public static NoleggioClienteResponse of(NoleggioAttivo n, AutoResponse auto) {
		return new NoleggioClienteResponse(
			n.getId(),
			auto,
			n.getUser().getNome(),
			n.getUser().getCognome(),
			n.getUser().getEmail(),
			n.getMesi(),
			n.getAnticipo(),
			n.getRata(),
			n.getCreatedAt()
		);
	}
}

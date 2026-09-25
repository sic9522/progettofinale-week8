package com.example.progetto_finale_week8.payloads.response;

import java.time.Instant;

import com.example.progetto_finale_week8.entities.RichiestaInteresse;
import com.example.progetto_finale_week8.entities.TipoInteresse;

// piatta apposta: alla pagina Notifiche serve solo comporre la frase, non oggetti annidati
public record RichiestaInteresseResponse(
	Long id,
	String utenteNome,
	String utenteCognome,
	String utenteEmail,
	Long autoId,
	String autoMarca,
	String autoModello,
	TipoInteresse tipo,
	Instant createdAt
) {
	public static RichiestaInteresseResponse of(RichiestaInteresse r) {
		return new RichiestaInteresseResponse(
			r.getId(),
			r.getUser().getNome(),
			r.getUser().getCognome(),
			r.getUser().getEmail(),
			r.getAuto().getId(),
			r.getAuto().getMarca(),
			r.getAuto().getModello(),
			r.getTipo(),
			r.getCreatedAt()
		);
	}
}

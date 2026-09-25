package com.example.progetto_finale_week8.payloads.response;

import com.example.progetto_finale_week8.entities.Foto;

public record FotoResponse(
	Long id,
	String url,
	int ordine
) {
	public static FotoResponse of(Foto foto) {
		return new FotoResponse(foto.getId(), foto.getUrl(), foto.getOrdine());
	}
}

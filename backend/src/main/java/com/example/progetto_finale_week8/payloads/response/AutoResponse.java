package com.example.progetto_finale_week8.payloads.response;

import java.math.BigDecimal;
import java.util.List;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Foto;
import com.example.progetto_finale_week8.entities.StatoAuto;
import com.example.progetto_finale_week8.entities.StoricoPrezzo;

// prezzoAcquisto è null nella vista pubblica: lo storico e l'admin lo popolano con of(..., admin=true)
public record AutoResponse(
	Long id,
	String vin,
	String marca,
	String modello,
	int anno,
	String descrizione,
	String specifiche,
	BigDecimal prezzo,
	BigDecimal prezzoAcquisto,
	StatoAuto stato,
	boolean disponibileNoleggio,
	boolean inOfferta,
	BigDecimal prezzoOriginale,
	List<FotoResponse> foto,
	List<StoricoPrezzoResponse> storicoPrezzi
) {
	public static AutoResponse of(Auto auto, List<Foto> foto, List<StoricoPrezzo> storico, boolean admin) {
		return new AutoResponse(
			auto.getId(),
			auto.getVin(),
			auto.getMarca(),
			auto.getModello(),
			auto.getAnno(),
			auto.getDescrizione(),
			auto.getSpecificheJson(),
			auto.getPrezzo(),
			admin ? auto.getPrezzoAcquisto() : null,
			auto.getStato(),
			auto.isDisponibileNoleggio(),
			auto.isInOfferta(),
			auto.getPrezzoOriginale(),
			foto.stream().map(FotoResponse::of).toList(),
			storico.stream().map(StoricoPrezzoResponse::of).toList()
		);
	}
}

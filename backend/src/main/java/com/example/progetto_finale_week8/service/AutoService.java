package com.example.progetto_finale_week8.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.Foto;
import com.example.progetto_finale_week8.entities.StatoAuto;
import com.example.progetto_finale_week8.entities.StoricoPrezzo;
import com.example.progetto_finale_week8.exceptions.BadRequestException;
import com.example.progetto_finale_week8.exceptions.NotFoundException;
import com.example.progetto_finale_week8.payloads.request.AutoCreateRequest;
import com.example.progetto_finale_week8.payloads.request.AutoSearchParams;
import com.example.progetto_finale_week8.payloads.request.AutoUpdateRequest;
import com.example.progetto_finale_week8.payloads.request.OffertaRequest;
import com.example.progetto_finale_week8.payloads.response.AutoResponse;
import com.example.progetto_finale_week8.payloads.response.PageResponse;
import com.example.progetto_finale_week8.repository.AutoRepository;
import com.example.progetto_finale_week8.repository.FotoRepository;
import com.example.progetto_finale_week8.repository.StoricoPrezzoRepository;

@Service
public class AutoService {

	private static final Map<String, String> SORT_CONSENTITI = Map.of(
		"prezzo", "prezzo",
		"anno", "anno",
		"marca", "marca",
		"createdAt", "createdAt");
	private static final Sort SORT_PREDEFINITO = Sort.by(Sort.Direction.DESC, "createdAt");

	private final AutoRepository autoRepository;
	private final FotoRepository fotoRepository;
	private final StoricoPrezzoRepository storicoPrezzoRepository;
	private final AutoDevClient autoDevClient;
	private final ApplicationEventPublisher eventi;

	public AutoService(AutoRepository autoRepository, FotoRepository fotoRepository,
			StoricoPrezzoRepository storicoPrezzoRepository, AutoDevClient autoDevClient,
			ApplicationEventPublisher eventi) {
		this.autoRepository = autoRepository;
		this.fotoRepository = fotoRepository;
		this.storicoPrezzoRepository = storicoPrezzoRepository;
		this.autoDevClient = autoDevClient;
		this.eventi = eventi;
	}

	@Transactional(readOnly = true)
	public PageResponse<AutoResponse> catalogoPubblico(AutoSearchParams params, Pageable pageable) {
		Sort sort = SearchUtils.traduciSort(pageable.getSort(), SORT_CONSENTITI, SORT_PREDEFINITO);
		Pageable richiesta = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
		return PageResponse.of(autoRepository.findAll(AutoSpecifications.da(params, true), richiesta)
			.map(auto -> mappaResponse(auto, false)));
	}

	@Transactional(readOnly = true)
	public PageResponse<AutoResponse> listaAdmin(Pageable pageable) {
		return PageResponse.of(autoRepository.findAll(pageable).map(auto -> mappaResponse(auto, true)));
	}

	@Transactional(readOnly = true)
	public AutoResponse dettaglio(Long id, boolean admin) {
		Auto auto = trova(id);
		if (!admin && auto.getStato() == StatoAuto.BOZZA) {
			// una bozza non deve nemmeno risultare che esiste per chi non è admin;
			// un'auto venduta invece resta visibile, serve a chi l'aveva nei preferiti
			throw new NotFoundException("Auto non trovata");
		}
		return mappaResponse(auto, admin);
	}

	// una sola chiamata ad auto.dev alla creazione: specifiche e foto restano nel nostro
	// database, non dipendono dall'uptime di auto.dev né consumano quota a ogni visita
	@Transactional
	public AutoResponse crea(AutoCreateRequest r) {
		if (autoRepository.existsByVin(r.vin())) {
			throw new BadRequestException("VIN già presente nel catalogo");
		}
		SpecificheAuto specifiche = autoDevClient.specifiche(r.vin());

		Auto auto = new Auto();
		auto.setVin(r.vin());
		auto.setMarca(specifiche.marca());
		auto.setModello(specifiche.modello());
		auto.setAnno(specifiche.anno());
		auto.setSpecificheJson(specifiche.specificheJson());
		auto.setDescrizione(r.descrizione());
		auto.setPrezzo(r.prezzo());
		auto.setPrezzoAcquisto(r.prezzoAcquisto());
		auto.setStato(r.stato());
		autoRepository.save(auto);

		List<String> foto = autoDevClient.foto(r.vin());
		for (int i = 0; i < foto.size(); i++) {
			Foto f = new Foto();
			f.setAuto(auto);
			f.setUrl(foto.get(i));
			f.setOrdine(i);
			fotoRepository.save(f);
		}

		return mappaResponse(auto, true);
	}

	@Transactional
	public AutoResponse modifica(Long id, AutoUpdateRequest r) {
		Auto auto = trova(id);
		StatoAuto statoPrecedente = auto.getStato();

		auto.setDescrizione(r.descrizione());
		cambiaPrezzo(auto, r.prezzo());
		auto.setPrezzoAcquisto(r.prezzoAcquisto());
		auto.setStato(r.stato());

		if (statoPrecedente != StatoAuto.VENDUTA && r.stato() == StatoAuto.VENDUTA) {
			eventi.publishEvent(new DisponibilitaCambiataEvent(auto.getId()));
		}

		return mappaResponse(auto, true);
	}

	// tasto dedicato "Offerta": esattamente sconto (10/15/20%) oppure un prezzo scelto
	// a mano, mai entrambi. Salva il prezzo di prima come riferimento per la riga rossa
	// in card, solo la prima volta che l'offerta parte (una seconda offerta non deve
	// sovrascrivere il prezzo "vero" con quello gia' scontato)
	@Transactional
	public AutoResponse applicaOfferta(Long id, OffertaRequest r) {
		boolean haSconto = r.percentualeSconto() != null;
		boolean haPrezzo = r.nuovoPrezzo() != null;
		if (haSconto == haPrezzo) {
			throw new BadRequestException("Indica uno sconto (10, 15 o 20) oppure un nuovo prezzo, non entrambi");
		}
		if (haSconto && r.percentualeSconto() != 10 && r.percentualeSconto() != 15 && r.percentualeSconto() != 20) {
			throw new BadRequestException("Sconto non valido: solo 10, 15 o 20");
		}

		Auto auto = trova(id);
		BigDecimal riferimento = auto.isInOfferta() ? auto.getPrezzoOriginale() : auto.getPrezzo();
		BigDecimal nuovoPrezzo = haSconto
			? riferimento.multiply(BigDecimal.valueOf(100 - r.percentualeSconto()))
				.divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP)
			: r.nuovoPrezzo();

		if (!auto.isInOfferta()) {
			auto.setPrezzoOriginale(riferimento);
			auto.setInOfferta(true);
		}
		cambiaPrezzo(auto, nuovoPrezzo);

		return mappaResponse(auto, true);
	}

	@Transactional
	public AutoResponse rimuoviOfferta(Long id) {
		Auto auto = trova(id);
		rimuoviOffertaSeAttiva(auto);
		return mappaResponse(auto, true);
	}

	// un'auto a noleggio non resta anche in offerta: le due vetrine (vendita scontata,
	// noleggio) sono alternative, non cumulabili
	@Transactional
	public AutoResponse impostaNoleggio(Long id, boolean disponibile) {
		Auto auto = trova(id);
		auto.setDisponibileNoleggio(disponibile);
		if (disponibile) {
			rimuoviOffertaSeAttiva(auto);
		}
		return mappaResponse(auto, true);
	}

	private void rimuoviOffertaSeAttiva(Auto auto) {
		if (auto.isInOfferta()) {
			cambiaPrezzo(auto, auto.getPrezzoOriginale());
			auto.setInOfferta(false);
			auto.setPrezzoOriginale(null);
		}
	}

	@Transactional
	public void rimuovi(Long id) {
		Auto auto = trova(id);
		if (auto.getStato() != StatoAuto.VENDUTA) {
			auto.setStato(StatoAuto.VENDUTA);
			eventi.publishEvent(new DisponibilitaCambiataEvent(auto.getId()));
		}
	}

	// storico prezzi + evento di avviso: stesso comportamento sia per una modifica
	// prezzo normale sia per un'offerta o la sua rimozione
	private void cambiaPrezzo(Auto auto, BigDecimal nuovoPrezzo) {
		BigDecimal prezzoPrecedente = auto.getPrezzo();
		if (prezzoPrecedente.compareTo(nuovoPrezzo) == 0) {
			return;
		}
		auto.setPrezzo(nuovoPrezzo);
		StoricoPrezzo storico = new StoricoPrezzo();
		storico.setAuto(auto);
		storico.setPrezzoPrecedente(prezzoPrecedente);
		storico.setPrezzoNuovo(nuovoPrezzo);
		storicoPrezzoRepository.save(storico);
		eventi.publishEvent(new PrezzoCambiatoEvent(auto.getId(), prezzoPrecedente, nuovoPrezzo));
	}

	private Auto trova(Long id) {
		return autoRepository.findById(id).orElseThrow(() -> new NotFoundException("Auto non trovata"));
	}

	private AutoResponse mappaResponse(Auto auto, boolean admin) {
		List<Foto> foto = fotoRepository.findByAutoIdOrderByOrdineAsc(auto.getId());
		List<StoricoPrezzo> storico = storicoPrezzoRepository.findByAutoIdOrderByCambiatoAtDesc(auto.getId());
		return AutoResponse.of(auto, foto, storico, admin);
	}

}

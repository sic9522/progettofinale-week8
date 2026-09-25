package com.example.progetto_finale_week8.service;

import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Sort;

import com.example.progetto_finale_week8.exceptions.BadRequestException;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

final class SearchUtils {

	private SearchUtils() {
	}

	static Predicate like(CriteriaBuilder cb, Expression<String> campo, String testo) {
		return cb.like(cb.lower(campo), "%" + testo.trim().toLowerCase(Locale.ROOT) + "%");
	}

	static boolean presente(String s) {
		return s != null && !s.isBlank();
	}

	// traduce il sort richiesto (nomi pubblici) in proprietà JPA; colonne non in whitelist -> 400
	static Sort traduciSort(Sort richiesto, Map<String, String> consentiti, Sort predefinito) {
		if (richiesto.isUnsorted()) {
			return predefinito;
		}
		return Sort.by(richiesto.stream()
			.map(o -> {
				String proprieta = consentiti.get(o.getProperty());
				if (proprieta == null) {
					throw new BadRequestException(
						"Ordinamento non consentito: " + o.getProperty() + ". Valori ammessi: " + consentiti.keySet());
				}
				return new Sort.Order(o.getDirection(), proprieta);
			})
			.toList());
	}

}

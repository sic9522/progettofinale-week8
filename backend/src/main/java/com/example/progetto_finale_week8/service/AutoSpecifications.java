package com.example.progetto_finale_week8.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.progetto_finale_week8.entities.Auto;
import com.example.progetto_finale_week8.entities.StatoAuto;
import com.example.progetto_finale_week8.payloads.request.AutoSearchParams;

import jakarta.persistence.criteria.Predicate;

import static com.example.progetto_finale_week8.service.SearchUtils.like;
import static com.example.progetto_finale_week8.service.SearchUtils.presente;

final class AutoSpecifications {

	private AutoSpecifications() {
	}

	static Specification<Auto> da(AutoSearchParams p, boolean soloPubblicate) {
		return (root, query, cb) -> {
			List<Predicate> filtri = new ArrayList<>();

			if (soloPubblicate) {
				filtri.add(cb.equal(root.get("stato"), StatoAuto.PUBBLICATA));
			}
			if (presente(p.q())) {
				filtri.add(cb.or(
					like(cb, root.get("marca"), p.q()),
					like(cb, root.get("modello"), p.q()),
					like(cb, root.get("descrizione"), p.q())));
			}
			if (presente(p.marca())) {
				filtri.add(like(cb, root.get("marca"), p.marca()));
			}
			if (p.annoDa() != null) {
				filtri.add(cb.greaterThanOrEqualTo(root.get("anno"), p.annoDa()));
			}
			if (p.annoA() != null) {
				filtri.add(cb.lessThanOrEqualTo(root.get("anno"), p.annoA()));
			}
			if (p.prezzoMin() != null) {
				filtri.add(cb.greaterThanOrEqualTo(root.get("prezzo"), p.prezzoMin()));
			}
			if (p.prezzoMax() != null) {
				filtri.add(cb.lessThanOrEqualTo(root.get("prezzo"), p.prezzoMax()));
			}
			if (p.inOfferta() != null) {
				filtri.add(cb.equal(root.get("inOfferta"), p.inOfferta()));
			}
			if (p.disponibileNoleggio() != null) {
				filtri.add(cb.equal(root.get("disponibileNoleggio"), p.disponibileNoleggio()));
			}

			return cb.and(filtri.toArray(Predicate[]::new));
		};
	}

}

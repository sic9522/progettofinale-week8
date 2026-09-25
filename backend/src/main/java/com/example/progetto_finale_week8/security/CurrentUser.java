package com.example.progetto_finale_week8.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

	private CurrentUser() {
	}

	public static Long id() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		return auth == null ? null : (Long) auth.getPrincipal();
	}

}

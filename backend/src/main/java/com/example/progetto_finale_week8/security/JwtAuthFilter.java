package com.example.progetto_finale_week8.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	public JwtAuthFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader("Authorization");

		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);

			if (jwtService.isValid(token)) {
				Long userId = jwtService.extractUserId(token);
				String ruolo = jwtService.extractRuolo(token).name();
				var authority = new SimpleGrantedAuthority("ROLE_" + ruolo);
				var auth = new UsernamePasswordAuthenticationToken(userId, null, List.of(authority));
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		}

		filterChain.doFilter(request, response);
	}

}

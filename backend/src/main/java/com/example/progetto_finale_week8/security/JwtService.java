package com.example.progetto_finale_week8.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.progetto_finale_week8.entities.Ruolo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private static final String CLAIM_RUOLO = "ruolo";

	private final SecretKey key;
	private final long expirationMs;

	public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
		this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
		this.expirationMs = expirationMs;
	}

	public String generateToken(Long userId, Ruolo ruolo) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.subject(userId.toString())
			.claim(CLAIM_RUOLO, ruolo.name())
			.issuedAt(now)
			.expiration(expiry)
			.signWith(key)
			.compact();
	}

	public Long extractUserId(String token) {
		return Long.valueOf(parseClaims(token).getSubject());
	}

	public Ruolo extractRuolo(String token) {
		return Ruolo.valueOf(parseClaims(token).get(CLAIM_RUOLO, String.class));
	}

	public boolean isValid(String token) {
		try {
			Claims claims = parseClaims(token);
			return claims.getExpiration().after(new Date());
		} catch (Exception e) {
			return false;
		}
	}

	private Claims parseClaims(String token) {
		return Jwts.parser()
			.verifyWith(key)
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}

}

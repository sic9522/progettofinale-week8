package com.example.progetto_finale_week8.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

	private final Resend resend;
	private final TemplateEngine templateEngine;
	private final String mittente;

	public EmailService(@Value("${resend.api-key}") String apiKey, TemplateEngine templateEngine,
			@Value("${app.mail.mittente}") String mittente) {
		this.resend = new Resend(apiKey);
		this.templateEngine = templateEngine;
		this.mittente = mittente;
	}

	// asincrono: un fallimento di invio si logga soltanto, non risale al chiamante
	@Async
	public void invia(String destinatario, String oggetto, String template, Context contesto) {
		String html = templateEngine.process("email/" + template, contesto);
		CreateEmailOptions params = CreateEmailOptions.builder()
			.from(mittente)
			.to(destinatario)
			.subject(oggetto)
			.html(html)
			.build();
		try {
			CreateEmailResponse risposta = resend.emails().send(params);
			// mai l'indirizzo email nei log: solo l'id assegnato da Resend
			log.info("Email inviata, id {}", risposta.getId());
		} catch (Exception e) {
			log.error("Invio email fallito", e);
		}
	}

}

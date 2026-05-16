package com.documents_service.d.service;

import org.springframework.stereotype.Service;

@Service
public class TranslationService {

    public String translateTitleToFrench(String title) {
        if (title == null || title.isBlank()) {
            return title;
        }
        return switch (title.trim()) {
            case "IT Security Policy" -> "Politique de sécurité informatique";
            case "Finance Budget Report" -> "Rapport budgétaire financier";
            case "Training Manual" -> "Manuel de formation";
            default -> title + " (traduit)";
        };
    }
}

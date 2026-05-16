package com.documents_service.d;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DApplication {

	public static void main(String[] args) {
		SpringApplication.run(DApplication.class, args);
	}

}

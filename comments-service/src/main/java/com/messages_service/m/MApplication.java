package com.messages_service.m;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.cassandra.repository.config.EnableCassandraRepositories;

@SpringBootApplication
@EnableCassandraRepositories
public class MApplication {

	public static void main(String[] args) {
		SpringApplication.run(MApplication.class, args);
	}

}

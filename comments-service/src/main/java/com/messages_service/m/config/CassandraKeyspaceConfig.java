package com.messages_service.m.config;

import com.datastax.oss.driver.api.core.CqlSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.cassandra.autoconfigure.CassandraAutoConfiguration;
import org.springframework.boot.cassandra.autoconfigure.CassandraProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.InetSocketAddress;

@Configuration
@AutoConfigureBefore(CassandraAutoConfiguration.class)
public class CassandraKeyspaceConfig {

    private static final Logger log = LoggerFactory.getLogger(CassandraKeyspaceConfig.class);

    @Bean
    Object cassandraKeyspaceBootstrap(CassandraProperties properties) {
        String keyspace = properties.getKeyspaceName();
        if (keyspace == null || keyspace.isBlank()) {
            return new Object();
        }

        String host = properties.getContactPoints().get(0);
        int port = properties.getPort();

        try (CqlSession session = CqlSession.builder()
                .addContactPoint(new InetSocketAddress(host, port))
                .withLocalDatacenter(properties.getLocalDatacenter())
                .build()) {

            session.execute("""
                    CREATE KEYSPACE IF NOT EXISTS %s
                    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
                    """.formatted(keyspace));

            log.info("Cassandra keyspace '{}' is ready", keyspace);
        }

        return new Object();
    }
}

package com.messages_service.m.repository;

import com.messages_service.m.model.Comment;
import com.messages_service.m.model.CommentKey;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends CassandraRepository<Comment, CommentKey> {

    @Query("SELECT * FROM comments WHERE doc_id = ?0")
    List<Comment> findByDocId(UUID docId);
}

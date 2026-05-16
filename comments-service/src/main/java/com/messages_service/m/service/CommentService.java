package com.messages_service.m.service;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.messages_service.m.model.Comment;
import com.messages_service.m.model.CommentKey;
import com.messages_service.m.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> getCommentsByDocId(String docId) {
        return commentRepository.findByDocId(UUID.fromString(docId));
    }

    public Comment addComment(Comment comment) {
        UUID docUuid = UUID.fromString(comment.getDocId());
        UUID commentId = Uuids.timeBased();

        CommentKey key = new CommentKey(docUuid, commentId);
        Comment toSave = new Comment(key, comment.getContent(), comment.getAuthor());
        return commentRepository.save(toSave);
    }
}

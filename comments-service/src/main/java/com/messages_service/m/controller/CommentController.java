package com.messages_service.m.controller;

import com.messages_service.m.model.Comment;
import com.messages_service.m.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private static final Logger log = LoggerFactory.getLogger(CommentController.class);

    @Autowired
    private CommentService commentService;

    @GetMapping("/list/{docId}")
    public List<Comment> getCommentsByDocId(@PathVariable String docId) {
        log.debug("Getting comments for docId={}", docId);
        List<Comment> result = commentService.getCommentsByDocId(docId);
        log.debug("Found {} comments for docId={}", result.size(), docId);
        return result;
    }

    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment, jakarta.servlet.http.HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        if (userEmail != null && !userEmail.isBlank()) {
            comment.setAuthor(userEmail.split("@")[0]);
        }
        log.debug("Received comment to add: {}", comment);
        Comment saved = commentService.addComment(comment);
        log.debug("Comment stored with id={}", saved.getId());
        return saved;
    }
}

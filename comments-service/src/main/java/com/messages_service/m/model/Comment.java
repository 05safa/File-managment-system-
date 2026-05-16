package com.messages_service.m.model;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Table("comments")
public class Comment {

    @PrimaryKey
    private CommentKey key;

    @Column("content")
    private String content;

    @Column("author")
    private String author;

    public Comment() {
    }

    public Comment(CommentKey key, String content, String author) {
        this.key = key;
        this.content = content;
        this.author = author;
    }

    @JsonIgnore
    public CommentKey getKey() {
        return key;
    }

    @JsonIgnore
    public void setKey(CommentKey key) {
        this.key = key;
    }

    @JsonProperty("id")
    public String getId() {
        return key != null && key.getCommentId() != null ? key.getCommentId().toString() : null;
    }

    @JsonProperty("id")
    public void setId(String id) {
        if (key == null) {
            key = new CommentKey();
        }
        key.setCommentId(UUID.fromString(id));
    }

    @JsonProperty("docId")
    public String getDocId() {
        return key != null && key.getDocId() != null ? key.getDocId().toString() : null;
    }

    @JsonProperty("docId")
    public void setDocId(String docId) {
        if (key == null) {
            key = new CommentKey();
        }
        key.setDocId(UUID.fromString(docId));
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    @JsonProperty("timestamp")
    public LocalDateTime getTimestamp() {
        if (key == null || key.getCommentId() == null) {
            return null;
        }
        long millis = Uuids.unixTimestamp(key.getCommentId());
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(millis), ZoneId.systemDefault());
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id='" + getId() + '\'' +
                ", docId='" + getDocId() + '\'' +
                ", author='" + author + '\'' +
                ", content='" + content + '\'' +
                ", timestamp=" + getTimestamp() +
                '}';
    }
}

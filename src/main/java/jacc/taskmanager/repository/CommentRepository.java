package jacc.taskmanager.repository;

import jacc.taskmanager.model.Comment;
import jacc.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTaskOrderByCreatedAtAsc(Task task);
}

package jacc.taskmanager.repository;

import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Task;
import jacc.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectOrderByPositionAsc(Project project);
    List<Task> findByAssignee(User assignee);
}

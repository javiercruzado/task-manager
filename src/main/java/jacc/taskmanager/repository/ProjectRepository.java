package jacc.taskmanager.repository;

import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByOwner(User owner);
    Optional<Project> findByOwnerAndName(User owner, String name);
    Optional<Project> findByIdempotencyKey(String idempotencyKey);
}

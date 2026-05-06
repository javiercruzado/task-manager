package jacc.taskmanager.repository;

import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    List<Tag> findByProject(Project project);
    Optional<Tag> findByProjectAndName(Project project, String name);
}

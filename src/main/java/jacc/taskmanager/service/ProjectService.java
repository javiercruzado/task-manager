package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.ProjectRequest;
import jacc.taskmanager.dto.response.ProjectResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RedisTemplate<String, UUID> redisTemplate;

    private static final String IDEMPOTENCY_KEY_PREFIX = "project_creation_idempotency:";

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, 
                          UserService userService, RedisTemplate<String, UUID> redisTemplate) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.redisTemplate = redisTemplate;
    }

    public List<ProjectResponse> findAll() {
        return projectRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> findByOwner(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return projectRepository.findByOwner(owner).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse findResponseById(UUID id) {
        return convertToResponse(findById(id));
    }

    public Project findById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    public ProjectResponse create(ProjectRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Handle Idempotency via Redis
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            String redisKey = IDEMPOTENCY_KEY_PREFIX + request.getIdempotencyKey();
            UUID existingId = redisTemplate.opsForValue().get(redisKey);
            if (existingId != null) {
                return findResponseById(existingId);
            }
        }

        // Prevent duplicate names for the same owner
        if (projectRepository.findByOwnerAndName(owner, request.getName()).isPresent()) {
            throw new ConflictException("You already have a project with the name: " + request.getName());
        }

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);

        // Store Idempotency result in Redis for 24 hours
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            String redisKey = IDEMPOTENCY_KEY_PREFIX + request.getIdempotencyKey();
            redisTemplate.opsForValue().set(redisKey, savedProject.getId(), Duration.ofHours(24));
        }

        return convertToResponse(savedProject);
    }

    public ProjectResponse update(UUID id, ProjectRequest request, String ownerEmail) {
        Project project = findById(id);
        
        if (!project.getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Project not found or access denied");
        }

        Optional<Project> existing = projectRepository.findByOwnerAndName(project.getOwner(), request.getName());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new ConflictException("You already have a project with the name: " + request.getName());
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        return convertToResponse(projectRepository.save(project));
    }

    public ProjectResponse archive(UUID id, String ownerEmail) {
        Project project = findById(id);
        if (!project.getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Project not found or access denied");
        }
        project.setArchived(true);
        return convertToResponse(projectRepository.save(project));
    }

    public void delete(UUID id, String ownerEmail) {
        Project project = findById(id);
        if (!project.getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Project not found or access denied");
        }
        projectRepository.delete(project);
    }

    private ProjectResponse convertToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setArchived(project.isArchived());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        response.setOwner(userService.convertToResponse(project.getOwner()));
        return response;
    }
}

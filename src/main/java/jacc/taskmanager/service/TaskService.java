package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.TaskRequest;
import jacc.taskmanager.dto.response.TaskResponse;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Task;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.TaskRepository;
import jacc.taskmanager.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RedisTemplate<String, UUID> redisTemplate;

    private static final String IDEMPOTENCY_KEY_PREFIX = "task_creation_idempotency:";

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, 
                       UserRepository userRepository, UserService userService, 
                       RedisTemplate<String, UUID> redisTemplate) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.redisTemplate = redisTemplate;
    }

    public List<TaskResponse> findByProjectId(UUID projectId, String userEmail) {
        Project project = getProjectIfOwner(projectId, userEmail);
        return taskRepository.findByProjectOrderByPositionAsc(project).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse findResponseById(UUID id, String userEmail) {
        return convertToResponse(findByIdAndVerifyAccess(id, userEmail));
    }

    public TaskResponse create(UUID projectId, TaskRequest request, String creatorEmail) {
        Project project = getProjectIfOwner(projectId, creatorEmail);

        // Handle Idempotency via Redis
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            String redisKey = IDEMPOTENCY_KEY_PREFIX + request.getIdempotencyKey();
            UUID existingId = redisTemplate.opsForValue().get(redisKey);
            if (existingId != null) {
                return convertToResponse(taskRepository.findById(existingId)
                        .orElseThrow(() -> new ResourceNotFoundException("Task not found")));
            }
        }

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = new Task();
        task.setProject(project);
        task.setCreatedBy(creator);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setPosition(request.getPosition() != null ? request.getPosition() : 0);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        Task savedTask = taskRepository.save(task);

        // Store Idempotency result in Redis for 24 hours
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            String redisKey = IDEMPOTENCY_KEY_PREFIX + request.getIdempotencyKey();
            redisTemplate.opsForValue().set(redisKey, savedTask.getId(), Duration.ofHours(24));
        }

        return convertToResponse(savedTask);
    }

    public TaskResponse update(UUID id, TaskRequest request, String userEmail) {
        Task task = findByIdAndVerifyAccess(id, userEmail);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        return convertToResponse(taskRepository.save(task));
    }

    public void delete(UUID id, String userEmail) {
        Task task = findByIdAndVerifyAccess(id, userEmail);
        taskRepository.delete(task);
    }

    private Project getProjectIfOwner(UUID projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getOwner().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Project not found or access denied");
        }
        return project;
    }

    private Task findByIdAndVerifyAccess(UUID id, String email) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getProject().getOwner().getEmail().equals(email) && 
            !task.getCreatedBy().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Task not found or access denied");
        }
        return task;
    }

    private TaskResponse convertToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setProjectId(task.getProject().getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDueDate(task.getDueDate());
        response.setPosition(task.getPosition());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        if (task.getAssignee() != null) {
            response.setAssignee(userService.convertToResponse(task.getAssignee()));
        }
        response.setCreatedBy(userService.convertToResponse(task.getCreatedBy()));
        return response;
    }
}

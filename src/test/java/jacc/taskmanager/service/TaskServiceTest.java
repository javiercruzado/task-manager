package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.TaskRequest;
import jacc.taskmanager.dto.response.TaskResponse;
import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Task;
import jacc.taskmanager.model.User;
import jacc.taskmanager.model.enums.TaskPriority;
import jacc.taskmanager.model.enums.TaskStatus;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.TagRepository;
import jacc.taskmanager.repository.TaskRepository;
import jacc.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private UserService userService;

    @Mock
    private TagService tagService;

    @Mock
    private RedisTemplate<String, UUID> redisTemplate;

    @InjectMocks
    private TaskService taskService;

    private User owner;
    private Project project;
    private Task task;
    private UUID projectId;
    private UUID taskId;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setEmail("owner@example.com");

        projectId = UUID.randomUUID();
        project = new Project();
        project.setId(projectId);
        project.setOwner(owner);

        taskId = UUID.randomUUID();
        task = new Task();
        task.setId(taskId);
        task.setProject(project);
        task.setCreatedBy(owner);
        task.setTitle("Test Task");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM);
    }

    @Test
    void findByProjectId_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(taskRepository.findByProjectOrderByPositionAsc(project)).thenReturn(List.of(task));
        when(userService.convertToResponse(owner)).thenReturn(new UserResponse());

        List<TaskResponse> result = taskService.findByProjectId(projectId, "owner@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).getTitle());
    }

    @Test
    void create_Success() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.HIGH);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> {
            Task t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });
        when(userService.convertToResponse(owner)).thenReturn(new UserResponse());

        TaskResponse response = taskService.create(projectId, request, "owner@example.com");

        assertNotNull(response);
        assertEquals("New Task", response.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void delete_Success() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        taskService.delete(taskId, "owner@example.com");

        verify(taskRepository).delete(task);
    }

    @Test
    void delete_UnauthorizedUser_ThrowsResourceNotFoundException() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        assertThrows(ResourceNotFoundException.class, () -> taskService.delete(taskId, "unauthorized@example.com"));
    }
}

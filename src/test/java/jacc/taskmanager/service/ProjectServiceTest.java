package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.ProjectRequest;
import jacc.taskmanager.dto.response.ProjectResponse;
import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private RedisTemplate<String, UUID> redisTemplate;

    @Mock
    private ValueOperations<String, UUID> valueOperations;

    @InjectMocks
    private ProjectService projectService;

    private User owner;
    private Project project;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setEmail("owner@example.com");

        projectId = UUID.randomUUID();
        project = new Project();
        project.setId(projectId);
        project.setName("Test Project");
        project.setDescription("Project Description");
        project.setOwner(owner);
    }

    @Test
    void findByOwner_Success() {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(projectRepository.findByOwner(owner)).thenReturn(List.of(project));
        when(userService.convertToResponse(owner)).thenReturn(new UserResponse());

        List<ProjectResponse> result = projectService.findByOwner("owner@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Project", result.get(0).getName());
    }

    @Test
    void create_Success() {
        ProjectRequest request = new ProjectRequest();
        request.setName("New Project");
        request.setDescription("New Desc");

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(projectRepository.findByOwnerAndName(owner, "New Project")).thenReturn(Optional.empty());
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> {
            Project p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(userService.convertToResponse(owner)).thenReturn(new UserResponse());

        ProjectResponse response = projectService.create(request, "owner@example.com");

        assertNotNull(response);
        assertEquals("New Project", response.getName());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void create_DuplicateName_ThrowsConflictException() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Test Project");

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(projectRepository.findByOwnerAndName(owner, "Test Project")).thenReturn(Optional.of(project));

        assertThrows(ConflictException.class, () -> projectService.create(request, "owner@example.com"));
    }

    @Test
    void update_UnauthorizedOwner_ThrowsResourceNotFoundException() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Updated");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        assertThrows(ResourceNotFoundException.class, () -> projectService.update(projectId, request, "other@example.com"));
    }

    @Test
    void delete_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        projectService.delete(projectId, "owner@example.com");

        verify(projectRepository).delete(project);
    }
}

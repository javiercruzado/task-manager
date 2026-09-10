package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.CommentRequest;
import jacc.taskmanager.dto.response.CommentResponse;
import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Comment;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Task;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.CommentRepository;
import jacc.taskmanager.repository.TaskRepository;
import jacc.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CommentService commentService;

    private User user;
    private Project project;
    private Task task;
    private Comment comment;
    private UUID taskId;
    private UUID commentId;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");

        project = new Project();
        project.setId(UUID.randomUUID());
        project.setOwner(user);

        taskId = UUID.randomUUID();
        task = new Task();
        task.setId(taskId);
        task.setProject(project);
        task.setCreatedBy(user);

        commentId = UUID.randomUUID();
        comment = new Comment();
        comment.setId(commentId);
        comment.setTask(task);
        comment.setAuthor(user);
        comment.setBody("Test comment");
    }

    @Test
    void findByTaskId_Success() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(commentRepository.findByTaskOrderByCreatedAtAsc(task)).thenReturn(List.of(comment));
        when(userService.convertToResponse(user)).thenReturn(new UserResponse());

        List<CommentResponse> result = commentService.findByTaskId(taskId, "user@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test comment", result.get(0).getBody());
    }

    @Test
    void create_Success() {
        CommentRequest request = new CommentRequest();
        request.setBody("New Comment");

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
        when(userService.convertToResponse(user)).thenReturn(new UserResponse());

        CommentResponse response = commentService.create(taskId, request, "user@example.com");

        assertNotNull(response);
        assertEquals("New Comment", response.getBody());
    }

    @Test
    void delete_Success() {
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        commentService.delete(commentId, "user@example.com");

        verify(commentRepository).delete(comment);
    }
}

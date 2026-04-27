package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.CommentRequest;
import jacc.taskmanager.dto.response.CommentResponse;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Comment;
import jacc.taskmanager.model.Task;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.CommentRepository;
import jacc.taskmanager.repository.TaskRepository;
import jacc.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository, TaskRepository taskRepository, 
                          UserRepository userRepository, UserService userService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<CommentResponse> findByTaskId(UUID taskId, String userEmail) {
        Task task = getTaskWithAccess(taskId, userEmail);
        return commentRepository.findByTaskOrderByCreatedAtAsc(task).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public CommentResponse create(UUID taskId, CommentRequest request, String userEmail) {
        Task task = getTaskWithAccess(taskId, userEmail);
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setBody(request.getBody());

        return convertToResponse(commentRepository.save(comment));
    }

    public CommentResponse update(UUID id, CommentRequest request, String userEmail) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthor().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Comment not found or access denied");
        }

        comment.setBody(request.getBody());
        return convertToResponse(commentRepository.save(comment));
    }

    public void delete(UUID id, String userEmail) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Author can delete their own comment, or the project owner can delete any comment on the task
        if (!comment.getAuthor().getEmail().equals(userEmail) && 
            !comment.getTask().getProject().getOwner().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Comment not found or access denied");
        }

        commentRepository.delete(comment);
    }

    private Task getTaskWithAccess(UUID taskId, String email) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        // Access allowed if user is project owner, creator, or assignee
        if (!task.getProject().getOwner().getEmail().equals(email) && 
            !task.getCreatedBy().getEmail().equals(email) && 
            (task.getAssignee() == null || !task.getAssignee().getEmail().equals(email))) {
            throw new ResourceNotFoundException("Task not found or access denied");
        }
        return task;
    }

    private CommentResponse convertToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setTaskId(comment.getTask().getId());
        response.setBody(comment.getBody());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        response.setAuthor(userService.convertToResponse(comment.getAuthor()));
        return response;
    }
}

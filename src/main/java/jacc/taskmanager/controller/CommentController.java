package jacc.taskmanager.controller;

import jacc.taskmanager.dto.request.CommentRequest;
import jacc.taskmanager.dto.response.CommentResponse;
import jacc.taskmanager.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> getCommentsByTask(@PathVariable UUID taskId, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return commentService.findByTaskId(taskId, userDetails.getUsername());
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@PathVariable UUID taskId, 
                                                       @Valid @RequestBody CommentRequest request, 
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return new ResponseEntity<>(commentService.create(taskId, request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable UUID commentId, 
                                                       @Valid @RequestBody CommentRequest request, 
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(commentService.update(commentId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId, 
                                            @AuthenticationPrincipal UserDetails userDetails) {
        commentService.delete(commentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

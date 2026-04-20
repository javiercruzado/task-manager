package jacc.taskmanager.controller;

import jacc.taskmanager.dto.request.TaskRequest;
import jacc.taskmanager.dto.response.TaskResponse;
import jacc.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> getTasksByProject(@PathVariable UUID projectId, 
                                              @AuthenticationPrincipal UserDetails userDetails) {
        return taskService.findByProjectId(projectId, userDetails.getUsername());
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable UUID taskId, 
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.findResponseById(taskId, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@PathVariable UUID projectId, 
                                                 @Valid @RequestBody TaskRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return new ResponseEntity<>(taskService.create(projectId, request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable UUID taskId, 
                                                 @Valid @RequestBody TaskRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.update(taskId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId, 
                                         @AuthenticationPrincipal UserDetails userDetails) {
        taskService.delete(taskId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

package jacc.taskmanager.controller;

import jacc.taskmanager.dto.request.ProjectRequest;
import jacc.taskmanager.dto.response.ProjectResponse;
import jacc.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> getMyProjects(@AuthenticationPrincipal UserDetails userDetails) {
        return projectService.findByOwner(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.findResponseById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request, 
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return new ResponseEntity<>(projectService.create(request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable UUID id, 
                                                       @Valid @RequestBody ProjectRequest request, 
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.update(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ProjectResponse> archiveProject(@PathVariable UUID id, 
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.archive(id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id, 
                                            @AuthenticationPrincipal UserDetails userDetails) {
        projectService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

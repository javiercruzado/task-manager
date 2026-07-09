package jacc.taskmanager.controller;

import jacc.taskmanager.dto.request.TagRequest;
import jacc.taskmanager.dto.response.TagResponse;
import jacc.taskmanager.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagResponse> getTagsByProject(@PathVariable UUID projectId, 
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return tagService.findByProjectId(projectId, userDetails.getUsername());
    }

    @PostMapping
    public ResponseEntity<TagResponse> createTag(@PathVariable UUID projectId, 
                                               @Valid @RequestBody TagRequest request, 
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return new ResponseEntity<>(tagService.create(projectId, request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @PutMapping("/{tagId}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable UUID tagId, 
                                               @Valid @RequestBody TagRequest request, 
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tagService.update(tagId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteTag(@PathVariable UUID tagId, 
                                        @AuthenticationPrincipal UserDetails userDetails) {
        tagService.delete(tagId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

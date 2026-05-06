package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.TagRequest;
import jacc.taskmanager.dto.response.TagResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Tag;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TagService {

    private final TagRepository tagRepository;
    private final ProjectRepository projectRepository;

    public TagService(TagRepository tagRepository, ProjectRepository projectRepository) {
        this.tagRepository = tagRepository;
        this.projectRepository = projectRepository;
    }

    public List<TagResponse> findByProjectId(UUID projectId, String userEmail) {
        Project project = getProjectIfOwner(projectId, userEmail);
        return tagRepository.findByProject(project).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TagResponse create(UUID projectId, TagRequest request, String userEmail) {
        Project project = getProjectIfOwner(projectId, userEmail);

        if (tagRepository.findByProjectAndName(project, request.getName()).isPresent()) {
            throw new ConflictException("Tag with name '" + request.getName() + "' already exists in this project");
        }

        Tag tag = new Tag();
        tag.setProject(project);
        tag.setName(request.getName());
        tag.setColorHex(request.getColorHex());

        return convertToResponse(tagRepository.save(tag));
    }

    public TagResponse update(UUID tagId, TagRequest request, String userEmail) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        if (!tag.getProject().getOwner().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Tag not found or access denied");
        }

        Optional<Tag> existing = tagRepository.findByProjectAndName(tag.getProject(), request.getName());
        if (existing.isPresent() && !existing.get().getId().equals(tagId)) {
            throw new ConflictException("Tag with name '" + request.getName() + "' already exists in this project");
        }

        tag.setName(request.getName());
        tag.setColorHex(request.getColorHex());

        return convertToResponse(tagRepository.save(tag));
    }

    public void delete(UUID tagId, String userEmail) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        if (!tag.getProject().getOwner().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Tag not found or access denied");
        }

        tagRepository.delete(tag);
    }

    private Project getProjectIfOwner(UUID projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getOwner().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Project not found or access denied");
        }
        return project;
    }

    public TagResponse convertToResponse(Tag tag) {
        TagResponse response = new TagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setColorHex(tag.getColorHex());
        return response;
    }
}

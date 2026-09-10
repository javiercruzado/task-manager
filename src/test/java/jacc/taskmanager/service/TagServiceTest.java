package jacc.taskmanager.service;

import jacc.taskmanager.dto.request.TagRequest;
import jacc.taskmanager.dto.response.TagResponse;
import jacc.taskmanager.exception.ConflictException;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.Project;
import jacc.taskmanager.model.Tag;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.ProjectRepository;
import jacc.taskmanager.repository.TagRepository;
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
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private TagService tagService;

    private User owner;
    private Project project;
    private Tag tag;
    private UUID projectId;
    private UUID tagId;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setEmail("owner@example.com");

        projectId = UUID.randomUUID();
        project = new Project();
        project.setId(projectId);
        project.setOwner(owner);

        tagId = UUID.randomUUID();
        tag = new Tag();
        tag.setId(tagId);
        tag.setProject(project);
        tag.setName("Frontend");
        tag.setColorHex("#6366F1");
    }

    @Test
    void findByProjectId_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(tagRepository.findByProject(project)).thenReturn(List.of(tag));

        List<TagResponse> result = tagService.findByProjectId(projectId, "owner@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Frontend", result.get(0).getName());
    }

    @Test
    void create_Success() {
        TagRequest request = new TagRequest();
        request.setName("Backend");
        request.setColorHex("#10B981");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(tagRepository.findByProjectAndName(project, "Backend")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(i -> {
            Tag t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TagResponse response = tagService.create(projectId, request, "owner@example.com");

        assertNotNull(response);
        assertEquals("Backend", response.getName());
        assertEquals("#10B981", response.getColorHex());
    }

    @Test
    void create_DuplicateName_ThrowsConflictException() {
        TagRequest request = new TagRequest();
        request.setName("Frontend");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(tagRepository.findByProjectAndName(project, "Frontend")).thenReturn(Optional.of(tag));

        assertThrows(ConflictException.class, () -> tagService.create(projectId, request, "owner@example.com"));
    }

    @Test
    void delete_Success() {
        when(tagRepository.findById(tagId)).thenReturn(Optional.of(tag));

        tagService.delete(tagId, "owner@example.com");

        verify(tagRepository).delete(tag);
    }
}

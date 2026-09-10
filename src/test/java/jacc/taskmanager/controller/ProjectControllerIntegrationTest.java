package jacc.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jacc.taskmanager.dto.request.ProjectRequest;
import jacc.taskmanager.dto.response.ProjectResponse;
import jacc.taskmanager.security.JwtTokenProvider;
import jacc.taskmanager.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "owner@example.com")
    void getMyProjects_ShouldReturn200() throws Exception {
        ProjectResponse response = new ProjectResponse();
        response.setId(UUID.randomUUID());
        response.setName("My Project");

        when(projectService.findByOwner("owner@example.com")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("My Project"));
    }

    @Test
    @WithMockUser(username = "owner@example.com")
    void createProject_ShouldReturn201() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setName("New Project");
        request.setDescription("Desc");

        ProjectResponse response = new ProjectResponse();
        response.setId(UUID.randomUUID());
        response.setName("New Project");

        when(projectService.create(any(ProjectRequest.class), eq("owner@example.com"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Project"));
    }

    @Test
    @WithMockUser(username = "owner@example.com")
    void deleteProject_ShouldReturn204() throws Exception {
        UUID projectId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/projects/" + projectId))
                .andExpect(status().isNoContent());
    }
}

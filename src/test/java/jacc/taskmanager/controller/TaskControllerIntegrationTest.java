package jacc.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jacc.taskmanager.dto.request.TaskRequest;
import jacc.taskmanager.dto.response.TaskResponse;
import jacc.taskmanager.model.enums.TaskPriority;
import jacc.taskmanager.model.enums.TaskStatus;
import jacc.taskmanager.security.JwtTokenProvider;
import jacc.taskmanager.service.TaskService;
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

@WebMvcTest(TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "owner@example.com")
    void getTasksByProject_ShouldReturn200() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskResponse response = new TaskResponse();
        response.setId(UUID.randomUUID());
        response.setTitle("Task 1");

        when(taskService.findByProjectId(eq(projectId), eq("owner@example.com"))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/projects/" + projectId + "/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Task 1"));
    }

    @Test
    @WithMockUser(username = "owner@example.com")
    void createTask_ShouldReturn201() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.MEDIUM);

        TaskResponse response = new TaskResponse();
        response.setId(UUID.randomUUID());
        response.setTitle("New Task");

        when(taskService.create(eq(projectId), any(TaskRequest.class), eq("owner@example.com"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Task"));
    }
}

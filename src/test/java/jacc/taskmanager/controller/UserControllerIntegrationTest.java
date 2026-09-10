package jacc.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.security.JwtTokenProvider;
import jacc.taskmanager.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void getAllUsers_ShouldReturn200AndList() throws Exception {
        UserResponse response = new UserResponse();
        response.setId(UUID.randomUUID());
        response.setEmail("user@example.com");

        when(userService.findAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user@example.com"));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getCurrentUser_ShouldReturn200() throws Exception {
        UserResponse response = new UserResponse();
        response.setEmail("user@example.com");

        when(userService.getUserResponseByEmail("user@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }
}

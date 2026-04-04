package jacc.taskmanager.controller;

import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.model.User;
import jacc.taskmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserResponseById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserResponseByEmail(userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.update(id, userDetails));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody User userDetailsRequest) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(userService.update(user.getId(), userDetailsRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

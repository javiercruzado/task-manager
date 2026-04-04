package jacc.taskmanager.service;

import jacc.taskmanager.dto.response.UserResponse;
import jacc.taskmanager.exception.ResourceNotFoundException;
import jacc.taskmanager.model.User;
import jacc.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserResponseById(UUID id) {
        return convertToResponse(findById(id));
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserResponse getUserResponseByEmail(String email) {
        return convertToResponse(findByEmail(email));
    }

    public UserResponse save(User user) {
        return convertToResponse(userRepository.save(user));
    }

    public UserResponse update(UUID id, User userDetails) {
        User user = findById(id);
        user.setEmail(userDetails.getEmail());
        user.setFullName(userDetails.getFullName());
        user.setAvatarUrl(userDetails.getAvatarUrl());
        if (userDetails.getPasswordHash() != null && !userDetails.getPasswordHash().isBlank()) {
            user.setPasswordHash(userDetails.getPasswordHash());
        }
        return convertToResponse(userRepository.save(user));
    }

    public void delete(UUID id) {
        User user = findById(id);
        userRepository.delete(user);
    }

    public UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}

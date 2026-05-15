package jacc.taskmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendVerificationEmail(String to, String username, String verificationLink) {
        // In a real application, you would integrate with an email sending service (e.g., SendGrid, Mailgun, JavaMailSender)
        // For now, we'll just log the email content.
        logger.info("Sending verification email to: {}", to);
        logger.info("Subject: Account Verification for Task Manager");
        logger.info("Body: Hello {}, please verify your account by clicking on the link: {}", username, verificationLink);
        logger.info("--- End of Email Content ---");
    }
}

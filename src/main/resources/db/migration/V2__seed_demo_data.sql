-- V2__seed_demo_data.sql
-- Automated seed data for demonstration and testing environments

-- ============================================================
-- 1. USERS
-- Password for all demo users is: Password123!
-- BCrypt Hash: $2a$10$ot9eK2ihPBTKdyF7szwrS.QKyk/5V1vjeVHj1aKNBMOF6.MCGRdUW
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, avatar_url, enabled, created_at, updated_at)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'demo@example.com',
        '$2a$10$ot9eK2ihPBTKdyF7szwrS.QKyk/5V1vjeVHj1aKNBMOF6.MCGRdUW',
        'Alex Morgan (Demo Admin)',
        NULL,
        true,
        now() - INTERVAL '14 days',
        now() - INTERVAL '14 days'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'sarah.chen@example.com',
        '$2a$10$ot9eK2ihPBTKdyF7szwrS.QKyk/5V1vjeVHj1aKNBMOF6.MCGRdUW',
        'Sarah Chen',
        NULL,
        true,
        now() - INTERVAL '12 days',
        now() - INTERVAL '12 days'
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'marcus.taylor@example.com',
        '$2a$10$ot9eK2ihPBTKdyF7szwrS.QKyk/5V1vjeVHj1aKNBMOF6.MCGRdUW',
        'Marcus Taylor',
        NULL,
        true,
        now() - INTERVAL '10 days',
        now() - INTERVAL '10 days'
    )
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. PROJECTS (Owned by demo@example.com)
-- ============================================================
INSERT INTO projects (id, owner_id, name, description, archived, created_at, updated_at)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'SaaS Platform Redesign',
        'Complete frontend revamp with modern responsive layouts, WCAG AA accessibility compliance, and performance optimizations.',
        false,
        now() - INTERVAL '10 days',
        now() - INTERVAL '1 day'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'Mobile Companion App (iOS & Android)',
        'Native mobile applications providing real-time task notifications, offline sync, and fast status toggles.',
        false,
        now() - INTERVAL '7 days',
        now() - INTERVAL '2 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'Customer Onboarding & API Docs',
        'Interactive developer portal, OpenAPI specifications, and onboarding guides for engineering teams.',
        false,
        now() - INTERVAL '5 days',
        now() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. TAGS
-- ============================================================
INSERT INTO tags (id, project_id, name, color_hex)
VALUES 
    -- Tags for Project 1 (SaaS Platform Redesign)
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Frontend', '#3B82F6'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Backend',  '#10B981'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'UI/UX',    '#F59E0B'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'DevOps',   '#8B5CF6'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Bug',      '#EF4444'),

    -- Tags for Project 2 (Mobile Companion App)
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Mobile',   '#06B6D4'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'API',      '#6366F1'),
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'Offline',  '#EC4899'),

    -- Tags for Project 3 (Customer Onboarding & Docs)
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'Docs',     '#14B8A6'),
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'Security', '#F97316')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. TASKS
-- ============================================================
INSERT INTO tasks (id, project_id, assignee_id, created_by, title, description, status, priority, due_date, position, created_at, updated_at)
VALUES 
    -- Tasks for Project 1: SaaS Platform Redesign
    (
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003', -- Marcus Taylor
        'a0000000-0000-0000-0000-000000000001',
        'Migrate navigation to responsive sidebar',
        'Implement collapsible navigation drawer with active route indicators, badge notifications, and keyboard shortcuts.',
        'DONE',
        'HIGH',
        CURRENT_DATE - INTERVAL '3 days',
        0,
        now() - INTERVAL '8 days',
        now() - INTERVAL '3 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002', -- Sarah Chen
        'a0000000-0000-0000-0000-000000000001',
        'Implement JWT refresh token rotation',
        'Store hashed refresh tokens in PostgreSQL and add automated revocation with Redis blacklist on reuse detection.',
        'DONE',
        'URGENT',
        CURRENT_DATE - INTERVAL '1 day',
        1,
        now() - INTERVAL '6 days',
        now() - INTERVAL '1 day'
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003', -- Marcus Taylor
        'a0000000-0000-0000-0000-000000000001',
        'Audit color contrast and accessibility (WCAG AA)',
        'Verify color ratios across light and dark theme components using axe-core accessibility scanner.',
        'IN_PROGRESS',
        'MEDIUM',
        CURRENT_DATE + INTERVAL '2 days',
        0,
        now() - INTERVAL '4 days',
        now() - INTERVAL '4 hours'
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001', -- Alex Morgan
        'a0000000-0000-0000-0000-000000000001',
        'Set up Redis token blacklist & rate limiting',
        'Configure Bucket4j with Redis store to protect public authentication endpoints against brute-force attacks.',
        'IN_PROGRESS',
        'HIGH',
        CURRENT_DATE + INTERVAL '4 days',
        1,
        now() - INTERVAL '3 days',
        now() - INTERVAL '2 hours'
    ),
    (
        'd0000000-0000-0000-0000-000000000005',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002', -- Sarah Chen
        'a0000000-0000-0000-0000-000000000001',
        'Write automated integration test suite for Task lifecycle',
        'Add MockMvc tests covering task CRUD, status transitions, role permissions, and validation rules.',
        'IN_REVIEW',
        'MEDIUM',
        CURRENT_DATE + INTERVAL '6 days',
        0,
        now() - INTERVAL '2 days',
        now() - INTERVAL '1 hour'
    ),
    (
        'd0000000-0000-0000-0000-000000000006',
        'b0000000-0000-0000-0000-000000000001',
        NULL, -- Unassigned
        'a0000000-0000-0000-0000-000000000001',
        'Add dark mode toggle and theme persistence',
        'Store user theme preference in local storage and match system OS preferences by default.',
        'TODO',
        'LOW',
        CURRENT_DATE + INTERVAL '10 days',
        0,
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ),
    (
        'd0000000-0000-0000-0000-000000000007',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001', -- Alex Morgan
        'a0000000-0000-0000-0000-000000000001',
        'Optimize database indexes for task filtering queries',
        'Benchmark task queries by project status and position with EXPLAIN ANALYZE on large datasets.',
        'TODO',
        'HIGH',
        CURRENT_DATE + INTERVAL '14 days',
        1,
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ),

    -- Tasks for Project 2: Mobile Companion App
    (
        'd0000000-0000-0000-0000-000000000008',
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001', -- Alex Morgan
        'a0000000-0000-0000-0000-000000000001',
        'Define Push Notification payload schema',
        'Set up FCM/APNS payloads for task assignment, due date reminders, and mention alerts.',
        'DONE',
        'HIGH',
        CURRENT_DATE - INTERVAL '2 days',
        0,
        now() - INTERVAL '5 days',
        now() - INTERVAL '2 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000009',
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003', -- Marcus Taylor
        'a0000000-0000-0000-0000-000000000001',
        'Draft Figma mockups for task board swipe gestures',
        'Design swipe-to-complete and swipe-to-archive gestures with tactile haptic feedback.',
        'IN_PROGRESS',
        'MEDIUM',
        CURRENT_DATE + INTERVAL '3 days',
        0,
        now() - INTERVAL '3 days',
        now() - INTERVAL '6 hours'
    ),
    (
        'd0000000-0000-0000-0000-000000000010',
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002', -- Sarah Chen
        'a0000000-0000-0000-0000-000000000001',
        'Build offline SQLite sync queue',
        'Queue local task modifications while offline and replay actions with conflict resolution upon reconnect.',
        'TODO',
        'URGENT',
        CURRENT_DATE + INTERVAL '8 days',
        0,
        now() - INTERVAL '2 days',
        now() - INTERVAL '2 days'
    ),

    -- Tasks for Project 3: Customer Onboarding & Docs
    (
        'd0000000-0000-0000-0000-000000000011',
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001', -- Alex Morgan
        'a0000000-0000-0000-0000-000000000001',
        'Publish Swagger / OpenAPI documentation endpoint',
        'Expose /swagger-ui and /api-docs with JWT authentication authorization scheme definitions.',
        'DONE',
        'MEDIUM',
        CURRENT_DATE - INTERVAL '4 days',
        0,
        now() - INTERVAL '4 days',
        now() - INTERVAL '4 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000012',
        'b0000000-0000-0000-0000-000000000003',
        NULL, -- Unassigned
        'a0000000-0000-0000-0000-000000000001',
        'Create quickstart walkthrough video and guide',
        'Record a 3-minute product overview walking through registration, project setup, and task collaboration.',
        'TODO',
        'LOW',
        CURRENT_DATE + INTERVAL '12 days',
        0,
        now() - INTERVAL '3 days',
        now() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. TASK_TAGS (Many-to-Many Associations)
-- ============================================================
INSERT INTO task_tags (task_id, tag_id)
VALUES 
    -- Task 1: Navigation
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'), -- Frontend
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003'), -- UI/UX

    -- Task 2: JWT
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'), -- Backend

    -- Task 3: Accessibility
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003'), -- UI/UX

    -- Task 4: Rate Limiting
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002'), -- Backend
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004'), -- DevOps

    -- Task 5: Tests
    ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001'), -- Frontend
    ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002'), -- Backend

    -- Task 6: Dark Mode
    ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001'), -- Frontend

    -- Task 7: Indexes
    ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002'), -- Backend

    -- Task 8: Push Notifications
    ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000006'), -- Mobile
    ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007'), -- API

    -- Task 9: Figma Gestures
    ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000006'), -- Mobile

    -- Task 10: SQLite
    ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000006'), -- Mobile
    ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000008'), -- Offline

    -- Task 11: Swagger
    ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000009'), -- Docs

    -- Task 12: Walkthrough Video
    ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000009')  -- Docs
ON CONFLICT (task_id, tag_id) DO NOTHING;

-- ============================================================
-- 6. COMMENTS
-- ============================================================
INSERT INTO comments (id, task_id, author_id, body, created_at, updated_at)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002', -- JWT rotation task
        'a0000000-0000-0000-0000-000000000002', -- Sarah Chen
        'JWT refresh token rotation is fully verified against Redis blacklist. Invalidating family chains upon token reuse works as expected.',
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000003', -- Accessibility audit task
        'a0000000-0000-0000-0000-000000000003', -- Marcus Taylor
        'Adjusted color contrast for priority pills and form borders. Axe DevTools reports 0 violations on the dashboard view.',
        now() - INTERVAL '5 hours',
        now() - INTERVAL '5 hours'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000004', -- Rate limiting task
        'a0000000-0000-0000-0000-000000000001', -- Alex Morgan
        'Configured rate limiting: 10 req/min on /api/v1/auth/* and 100 req/min for authenticated workspace routes.',
        now() - INTERVAL '2 hours',
        now() - INTERVAL '2 hours'
    )
ON CONFLICT (id) DO NOTHING;

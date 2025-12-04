-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    work_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}'::jsonb,
    productive_hours JSONB DEFAULT '["10:00-12:00", "15:00-17:00"]'::jsonb,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    priority CHAR(1),
    deadline DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    is_in_top_3 BOOLEAN DEFAULT FALSE,
    key_result_area VARCHAR(100),
    smart_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_priority CHECK (priority IN ('A', 'B', 'C')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'archived'))
);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority CHAR(1) DEFAULT 'C',
    status VARCHAR(20) DEFAULT 'todo',
    category VARCHAR(50),
    estimated_minutes INTEGER,
    actual_minutes INTEGER DEFAULT 0,
    deadline TIMESTAMP,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    completed_at TIMESTAMP,
    postpone_count INTEGER DEFAULT 0,
    focus_sessions_count INTEGER DEFAULT 0,
    is_frog BOOLEAN DEFAULT FALSE,
    blocking_tasks UUID[],
    blocks_tasks UUID[],
    parent_task_id UUID REFERENCES tasks(id),
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_priority CHECK (priority IN ('A', 'B', 'C', 'D', 'E')),
    CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked'))
);

-- FOCUS_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    planned_duration INTEGER,
    actual_duration INTEGER,
    interruption_count INTEGER DEFAULT 0,
    quality_score INTEGER,
    was_successful BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER_ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_tasks INTEGER DEFAULT 0,
    completed_a_tasks INTEGER DEFAULT 0,
    completed_b_tasks INTEGER DEFAULT 0,
    total_focus_minutes INTEGER DEFAULT 0,
    productivity_score DECIMAL(5,2),
    streak_maintained BOOLEAN DEFAULT TRUE,
    top_distractor_app VARCHAR(100),
    distraction_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- BOTTLENECKS TABLE
CREATE TABLE IF NOT EXISTS bottlenecks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    bottleneck_type VARCHAR(50),
    description TEXT,
    suggested_solution TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- DAILY_PLANS TABLE
CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    plan_data JSONB,
    was_followed BOOLEAN DEFAULT FALSE,
    actual_completion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, plan_date)
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

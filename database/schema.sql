-- GuardPoint Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    current_state VARCHAR(100) DEFAULT 'California',
    preferred_language VARCHAR(50) DEFAULT 'English',
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_type VARCHAR(50),
    subscription_id VARCHAR(255),
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- State guides table
CREATE TABLE IF NOT EXISTS state_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_name VARCHAR(100) NOT NULL,
    rights_summary TEXT NOT NULL,
    relevant_laws JSONB,
    sections JSONB NOT NULL,
    resources JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_ai_generated BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    UNIQUE(state_name, version)
);

-- Scenario scripts table
CREATE TABLE IF NOT EXISTS scenario_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_name VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    script_content JSONB NOT NULL,
    state_specific VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_ai_generated BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    UNIQUE(scenario_name, language, state_specific)
);

-- Incident logs table
CREATE TABLE IF NOT EXISTS incident_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location JSONB,
    recording_url TEXT,
    ipfs_hash VARCHAR(255),
    summary_card_content JSONB,
    ai_summary TEXT,
    notes TEXT,
    incident_type VARCHAR(100),
    duration INTEGER, -- in seconds
    is_shared BOOLEAN DEFAULT false,
    share_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(incident_id)
);

-- User purchases table (for micro-transactions)
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_key VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(10) DEFAULT 'usd',
    stripe_payment_intent_id VARCHAR(255),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_key)
);

-- User sessions table (for analytics)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    pages_visited JSONB,
    features_used JSONB,
    location_data JSONB,
    user_agent TEXT,
    ip_address INET
);

-- Content cache table (for offline functionality)
CREATE TABLE IF NOT EXISTS content_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cache_key)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'bug', 'feature', 'general'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    page_url VARCHAR(500),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_state_guides_state_name ON state_guides(state_name);
CREATE INDEX IF NOT EXISTS idx_scenario_scripts_scenario_language ON scenario_scripts(scenario_name, language);
CREATE INDEX IF NOT EXISTS idx_incident_logs_user_id ON incident_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_logs_timestamp ON incident_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_cache_key ON content_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_cache_updated_at BEFORE UPDATE ON content_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feedback_updated_at BEFORE UPDATE ON user_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

-- Incident logs policies
CREATE POLICY "Users can view own incidents" ON incident_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incidents" ON incident_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON incident_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- User purchases policies
CREATE POLICY "Users can view own purchases" ON user_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON user_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User feedback policies
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for state guides and scenario scripts
CREATE POLICY "Anyone can view state guides" ON state_guides
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view scenario scripts" ON scenario_scripts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view content cache" ON content_cache
    FOR SELECT USING (true);

-- Insert default state guides
INSERT INTO state_guides (state_name, rights_summary, sections, resources, is_ai_generated) VALUES
('California', 
 'In California, you have specific constitutional rights during police interactions. Understanding these rights can help protect you and ensure fair treatment.',
 '[
   {
     "id": "traffic-stops",
     "title": "Traffic Stops",
     "icon": "🚗",
     "content": [
       "You must provide your driver''s license, registration, and proof of insurance when requested.",
       "You have the right to remain silent beyond providing required documents.",
       "You do not have to consent to a vehicle search unless there''s probable cause.",
       "You can ask if you''re free to leave.",
       "Record the interaction if you can do so safely."
     ]
   },
   {
     "id": "questioning",
     "title": "Police Questioning",
     "icon": "❓",
     "content": [
       "You have the right to remain silent (5th Amendment).",
       "You have the right to an attorney (6th Amendment).",
       "You must clearly state: ''I am invoking my right to remain silent and want an attorney.''",
       "Police can''t punish you for exercising these rights.",
       "You don''t have to answer questions without an attorney present."
     ]
   }
 ]',
 '["ACLU Know Your Rights: aclu.org", "California Legal Aid: calegaladvocates.org", "Emergency: 911"]',
 false
) ON CONFLICT (state_name, version) DO NOTHING;

-- Insert default scenario scripts
INSERT INTO scenario_scripts (scenario_name, language, script_content, is_ai_generated) VALUES
('traffic-stop', 'English', 
 '["Good [morning/afternoon/evening], officer.", "I understand you''ve stopped me. May I ask why?", "Here are my license, registration, and insurance.", "I prefer to exercise my right to remain silent.", "Am I free to leave?", "I do not consent to any searches of my vehicle."]',
 false
),
('traffic-stop', 'Spanish',
 '["Buenos [días/tardes/noches], oficial.", "Entiendo que me detuvo. ¿Puedo preguntar por qué?", "Aquí están mi licencia, registro y seguro.", "Prefiero ejercer mi derecho a permanecer en silencio.", "¿Soy libre de irme?", "No consiento a ningún registro de mi vehículo."]',
 false
) ON CONFLICT (scenario_name, language, state_specific) DO NOTHING;

-- Migration: Create user_branches table for multi-branch support
-- Description: Allows specialists and receptionists to work in multiple branches
-- Date: 2025-10-10

-- Create user_branches table
CREATE TABLE IF NOT EXISTS user_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "isDefault" BOOLEAN DEFAULT FALSE,
  "canManageSchedule" BOOLEAN DEFAULT TRUE,
  "canCreateAppointments" BOOLEAN DEFAULT TRUE,
  "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "assignedBy" UUID,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_user_branch_user FOREIGN KEY ("userId") 
    REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_branch_branch FOREIGN KEY ("branchId") 
    REFERENCES "Branches"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_branch_assigned_by FOREIGN KEY ("assignedBy") 
    REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Unique constraint: a user can only be assigned to a branch once
  CONSTRAINT unique_user_branch UNIQUE ("userId", "branchId")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_branch_user ON user_branches("userId");
CREATE INDEX IF NOT EXISTS idx_user_branch_branch ON user_branches("branchId");
CREATE INDEX IF NOT EXISTS idx_user_branch_default ON user_branches("isDefault");

-- Add comments
COMMENT ON TABLE user_branches IS 'Many-to-many relationship between users and branches';
COMMENT ON COLUMN user_branches."isDefault" IS 'Indicates if this is the user main branch';
COMMENT ON COLUMN user_branches."canManageSchedule" IS 'If user can manage their schedule in this branch';
COMMENT ON COLUMN user_branches."canCreateAppointments" IS 'If user can create appointments in this branch';
COMMENT ON COLUMN user_branches."assignedAt" IS 'Date when user was assigned to this branch';
COMMENT ON COLUMN user_branches."assignedBy" IS 'User who made the assignment';
COMMENT ON COLUMN user_branches.notes IS 'Notes about the user assignment to this branch';

-- Migration success
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: user_branches table created successfully';
END $$;

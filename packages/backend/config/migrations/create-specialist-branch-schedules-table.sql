-- Crear tabla specialist_branch_schedules
CREATE TABLE IF NOT EXISTS specialist_branch_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_profile_id UUID NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Para ordenar horarios cuando hay conflictos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricción única: un especialista no puede tener múltiples horarios en la misma sucursal el mismo día
    UNIQUE(specialist_profile_id, branch_id, day_of_week),

    -- Validación de tiempo: hora de fin debe ser posterior a hora de inicio
    CHECK (end_time > start_time)
);

-- Índices para optimización de consultas
CREATE INDEX idx_specialist_branch_schedules_specialist ON specialist_branch_schedules(specialist_profile_id);
CREATE INDEX idx_specialist_branch_schedules_branch ON specialist_branch_schedules(branch_id);
CREATE INDEX idx_specialist_branch_schedules_day ON specialist_branch_schedules(day_of_week);
CREATE INDEX idx_specialist_branch_schedules_active ON specialist_branch_schedules(is_active);
CREATE INDEX idx_specialist_branch_schedules_branch_day ON specialist_branch_schedules(branch_id, day_of_week);

-- Comentarios en la tabla
COMMENT ON TABLE specialist_branch_schedules IS 'Tabla intermedia que define los horarios de trabajo de especialistas en cada sucursal por día de semana';
COMMENT ON COLUMN specialist_branch_schedules.specialist_profile_id IS 'Referencia al perfil del especialista';
COMMENT ON COLUMN specialist_branch_schedules.branch_id IS 'Referencia a la sucursal';
COMMENT ON COLUMN specialist_branch_schedules.day_of_week IS 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)';
COMMENT ON COLUMN specialist_branch_schedules.start_time IS 'Hora de inicio del turno';
COMMENT ON COLUMN specialist_branch_schedules.end_time IS 'Hora de fin del turno';
COMMENT ON COLUMN specialist_branch_schedules.priority IS 'Prioridad para resolver conflictos de horarios (mayor número = mayor prioridad)';
COMMENT ON COLUMN specialist_branch_schedules.is_active IS 'Indica si este horario está activo';
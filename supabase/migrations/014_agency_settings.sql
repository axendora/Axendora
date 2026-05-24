-- Tabla de configuración global de la agencia (una sola fila)
CREATE TABLE IF NOT EXISTS agency_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_agencia text NOT NULL DEFAULT 'Axendora',
  slogan text,
  email_contacto text,
  telefono text,
  whatsapp text,
  website text,
  instagram text,
  facebook text,
  -- Preferencias de notificaciones por email
  notif_bienvenida boolean NOT NULL DEFAULT true,
  notif_solicitud_aprobada boolean NOT NULL DEFAULT true,
  notif_solicitud_rechazada boolean NOT NULL DEFAULT true,
  notif_factura_emitida boolean NOT NULL DEFAULT true,
  notif_campana_iniciada boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer y modificar
CREATE POLICY "admin_select" ON agency_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update" ON agency_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insertar fila por defecto al ejecutar la migración
INSERT INTO agency_settings (nombre_agencia)
VALUES ('Axendora')
ON CONFLICT DO NOTHING;

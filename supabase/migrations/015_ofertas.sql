-- Tabla de ofertas y promociones
CREATE TABLE IF NOT EXISTS public.ofertas (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           TEXT          NOT NULL,
  descripcion      TEXT,
  tipo_descuento   TEXT          NOT NULL DEFAULT 'porcentaje'
    CONSTRAINT ofertas_tipo_check CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo')),
  valor_descuento  NUMERIC(10,2) NOT NULL DEFAULT 0,
  moneda           TEXT          NOT NULL DEFAULT 'USD'
    CONSTRAINT ofertas_moneda_check CHECK (moneda IN ('USD', 'COP')),
  codigo_promo     TEXT,
  plan_id          UUID          REFERENCES public.plans(id) ON DELETE SET NULL,
  fecha_inicio     DATE          NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin        DATE,
  activo           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;

-- Admins: acceso total
CREATE POLICY "admin_all_ofertas"
  ON public.ofertas FOR ALL TO authenticated
  USING   ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Clientes: solo leer ofertas activas (uso futuro desde panel de cliente)
CREATE POLICY "client_read_active_ofertas"
  ON public.ofertas FOR SELECT TO authenticated
  USING (activo = TRUE);

-- Corregir función get_admin_whatsapp para que lea de agency_settings
-- (antes leía de profiles, pero el admin guarda el WhatsApp en agency_settings)
CREATE OR REPLACE FUNCTION public.get_admin_whatsapp()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT whatsapp
  FROM public.agency_settings
  WHERE whatsapp IS NOT NULL
    AND whatsapp <> ''
  ORDER BY updated_at DESC
  LIMIT 1
$$;

-- Asegurar que cualquier usuario autenticado pueda llamar la función
GRANT EXECUTE ON FUNCTION public.get_admin_whatsapp() TO authenticated;


CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin_platform(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_tenant(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unit_tenant_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_unit(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_tenant_registration(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_tenant_registration(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_platform(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_tenant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unit_tenant_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_unit(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_tenant_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_tenant_registration(uuid, text) TO authenticated;

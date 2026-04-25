CREATE TABLE IF NOT EXISTS public.domain_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'domain_batches' AND policyname = 'domain_batches_owner_all'
  ) THEN
    CREATE POLICY "domain_batches_owner_all"
    ON public.domain_batches
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'domain_batches_set_updated_at'
  ) THEN
    CREATE TRIGGER domain_batches_set_updated_at
    BEFORE UPDATE ON public.domain_batches
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.job_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subdomain_prefixes TEXT[] NOT NULL DEFAULT '{}',
  person_names TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_templates' AND policyname = 'job_templates_owner_all'
  ) THEN
    CREATE POLICY "job_templates_owner_all"
    ON public.job_templates
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'job_templates_set_updated_at'
  ) THEN
    CREATE TRIGGER job_templates_set_updated_at
    BEFORE UPDATE ON public.job_templates
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.domain_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS domains_batch_id_idx ON public.domains(batch_id);
CREATE INDEX IF NOT EXISTS domain_batches_user_id_idx ON public.domain_batches(user_id);
CREATE INDEX IF NOT EXISTS job_templates_user_id_idx ON public.job_templates(user_id);
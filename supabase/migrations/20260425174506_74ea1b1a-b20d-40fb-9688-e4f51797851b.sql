DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'domain_batches_template_id_fkey'
      AND conrelid = 'public.domain_batches'::regclass
  ) THEN
    ALTER TABLE public.domain_batches
      ADD CONSTRAINT domain_batches_template_id_fkey
      FOREIGN KEY (template_id)
      REFERENCES public.job_templates(id)
      ON DELETE SET NULL;
  END IF;
END $$;
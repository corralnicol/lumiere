-- Allow the owner to overwrite their avatar (UPDATE covers upsert on an existing object).
-- INSERT policy (in create_profiles.sql) handles the first upload;
-- this policy handles all subsequent replacements at the same fixed path.
CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name = 'avatars/' || (select auth.uid())::text || '.png'
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND name = 'avatars/' || (select auth.uid())::text || '.png'
  );

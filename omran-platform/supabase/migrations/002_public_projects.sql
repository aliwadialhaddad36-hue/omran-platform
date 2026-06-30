-- Allow anyone (unauthenticated) to read approved projects for public pages
CREATE POLICY "Public can view approved projects"
  ON projects FOR SELECT
  USING (status = 'approved');

-- Allow anyone to read profiles of approved project owners (for display name)
CREATE POLICY "Public can view profiles of approved project owners"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM projects WHERE status = 'approved'
    )
  );

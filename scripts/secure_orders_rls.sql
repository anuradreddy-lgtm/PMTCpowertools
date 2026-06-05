-- ========================================================
-- Enable RLS and Secure policies on public.orders table
-- ========================================================

-- 1. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing conflicting policies
DROP POLICY IF EXISTS "Allow anyone to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated admins to select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated admins to update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated admins to delete orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to manage orders" ON public.orders;

-- 3. Create Checkout Policy
-- Permits anonymous checkout creations (anonymous INSERTs)
CREATE POLICY "Allow anyone to insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- 4. Create Administrative Ledger Policies
-- Restricts read (SELECT), edit (UPDATE), and removal (DELETE) operations
-- strictly to authenticated users who are administrators.
CREATE POLICY "Allow authenticated admins to select orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ));

CREATE POLICY "Allow authenticated admins to update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ))
  WITH CHECK (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ));

CREATE POLICY "Allow authenticated admins to delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ));


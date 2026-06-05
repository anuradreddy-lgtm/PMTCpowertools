-- Run this in Supabase SQL editor to create the orders table if it does not already exist.
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  email text,
  customer_phone text,
  product_name text,
  product_id text,
  quantity integer,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders (order_number);

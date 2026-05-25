import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mxkncgqmsoaobbcbsmtd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mqluX_Ho-EFh0AbhxGRFRA_OcxYqysS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

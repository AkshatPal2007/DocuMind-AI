-- Create the files table linked to auth.users
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT,
    pages INTEGER DEFAULT 0,
    chunks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own files
CREATE POLICY "Users can only view their own files" 
    ON public.files 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own files
CREATE POLICY "Users can insert their own files" 
    ON public.files 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own files" 
    ON public.files 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files" 
    ON public.files 
    FOR DELETE 
    USING (auth.uid() = user_id);

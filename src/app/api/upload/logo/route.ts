import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('logo') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `logo_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const logoUrl = `/uploads/logos/${filename}`;

    return NextResponse.json({ 
      success: true, 
      logoUrl,
      message: 'Logo uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
}

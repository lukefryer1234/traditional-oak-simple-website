import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// GET handler to fetch the privacy policy content
export async function GET() {
  try {
    // In a real app, this would fetch from a database
    // For now, we'll simulate by reading the file content
    const privacyPolicyPath = path.join(process.cwd(), 'src/app/privacy/page.tsx');
    const fileContent = await fs.readFile(privacyPolicyPath, 'utf8');
    
    // Extract the content from the file
    // This is a simplified approach - in a real app, you'd use a more robust method
    const contentMatch = fileContent.match(/return \(\s*<div[^>]*>([\s\S]*?)<\/div>\s*\);/);
    const content = contentMatch ? contentMatch[1].trim() : '';
    
    // Extract metadata
    const titleMatch = fileContent.match(/title: "([^"]+)"/);
    const descriptionMatch = fileContent.match(/description: "([^"]+)"/);
    
    return NextResponse.json({
      title: titleMatch ? titleMatch[1] : 'Privacy Policy',
      description: descriptionMatch ? descriptionMatch[1] : 'Privacy Policy for Oak Structures website',
      content: content,
      lastUpdated: new Date().toISOString().split('T')[0] // Today's date
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy policy' },
      { status: 500 }
    );
  }
}

// POST handler to update the privacy policy content
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, content } = data;
    
    // Validate the data
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real app, this would update a database
    // For now, we'll simulate by updating the file content
    const privacyPolicyPath = path.join(process.cwd(), 'src/app/privacy/page.tsx');
    const fileContent = await fs.readFile(privacyPolicyPath, 'utf8');
    
    // Update the metadata
    let updatedContent = fileContent
      .replace(/title: "[^"]+"/, `title: "${title}"`)
      .replace(/description: "[^"]+"/, `description: "${description}"`);
    
    // Update the content
    // This is a simplified approach - in a real app, you'd use a more robust method
    updatedContent = updatedContent.replace(
      /return \(\s*<div[^>]*>([\s\S]*?)<\/div>\s*\);/,
      `return (\n    <div className="container mx-auto py-12 px-4 md:px-6">\n      <div className="max-w-4xl mx-auto prose prose-lg">\n        ${content}\n      </div>\n    </div>\n  );`
    );
    
    await fs.writeFile(privacyPolicyPath, updatedContent, 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'Privacy policy updated successfully',
      lastUpdated: new Date().toISOString().split('T')[0] // Today's date
    });
  } catch (error) {
    console.error('Error updating privacy policy:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy policy' },
      { status: 500 }
    );
  }
}

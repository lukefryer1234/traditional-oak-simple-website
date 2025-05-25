import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// GET handler to fetch the terms of service content
export async function GET() {
  try {
    // In a real app, this would fetch from a database
    // For now, we'll simulate by reading the file content
    const termsPath = path.join(process.cwd(), 'src/app/terms/page.tsx');
    const fileContent = await fs.readFile(termsPath, 'utf8');
    
    // Extract the content from the file
    // This is a simplified approach - in a real app, you'd use a more robust method
    const contentMatch = fileContent.match(/return \(\s*<div[^>]*>([\s\S]*?)<\/div>\s*\);/);
    const content = contentMatch ? contentMatch[1].trim() : '';
    
    // Extract metadata
    const titleMatch = fileContent.match(/title: "([^"]+)"/);
    const descriptionMatch = fileContent.match(/description: "([^"]+)"/);
    
    return NextResponse.json({
      title: titleMatch ? titleMatch[1] : 'Terms and Conditions',
      description: descriptionMatch ? descriptionMatch[1] : 'Terms and Conditions for Oak Structures website',
      content: content,
      lastUpdated: new Date().toISOString().split('T')[0] // Today's date
    });
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms of service' },
      { status: 500 }
    );
  }
}

// POST handler to update the terms of service content
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
    const termsPath = path.join(process.cwd(), 'src/app/terms/page.tsx');
    const fileContent = await fs.readFile(termsPath, 'utf8');
    
    // Update the metadata
    let updatedContent = fileContent
      .replace(/title: "[^"]+"/, `title: "${title}"`)
      .replace(/description: "[^"]+"/, `description: "${description}"`);
    
    // Update the content
    // This is a simplified approach - in a real app, you'd use a more robust method
    updatedContent = updatedContent.replace(
      /return \(\s*<div[^>]*>([\s\S]*?)<\/div>\s*\);/,
      `return (\n     <div>\n        <div className="container mx-auto px-4 py-12 md:py-16">\n           <div className="max-w-3xl mx-auto prose prose-lg lg:prose-xl text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-p:leading-relaxed prose-p:mb-4">\n             ${content}\n          </div>\n        </div>\n    </div>\n  );`
    );
    
    await fs.writeFile(termsPath, updatedContent, 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'Terms of service updated successfully',
      lastUpdated: new Date().toISOString().split('T')[0] // Today's date
    });
  } catch (error) {
    console.error('Error updating terms of service:', error);
    return NextResponse.json(
      { error: 'Failed to update terms of service' },
      { status: 500 }
    );
  }
}

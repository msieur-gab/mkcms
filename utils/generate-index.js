// scripts/generate-index.js
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

async function generateIndex() {
    const contentDir = path.join(process.cwd(), 'content');
    const files = await fs.readdir(contentDir);
    
    const contentIndex = await Promise.all(
        files
            .filter(file => file.endsWith('.md'))
            .map(async file => {
                const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
                const { data, content: markdown } = matter(content);
                
                // Get first paragraph for excerpt
                const excerpt = markdown
                    .split('\n')
                    .find(line => line.trim().length > 0)
                    ?.slice(0, 150) + '...' || '';

                return {
                    title: data.title || file.replace('.md', ''),
                    file: file,
                    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                    tags: data.tags || [],
                    excerpt: excerpt
                };
            })
    );

    // Sort by date, newest first
    contentIndex.sort((a, b) => new Date(b.date) - new Date(a.date));

    await fs.writeFile(
        path.join(contentDir, 'index.json'),
        JSON.stringify(contentIndex, null, 2)
    );
}

generateIndex().catch(console.error);

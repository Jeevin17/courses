import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roadmapShData } from '../src/data/roadmap-sh-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read courses.json
const coursesPath = path.join(__dirname, '../src/data/courses.json');
const roadmapPath = path.join(__dirname, '../src/data/roadmap-sh-data.js');

const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// Create a lookup map
const courseLookup = new Map();
for (const [key, value] of Object.entries(coursesData)) {
    courseLookup.set(key.toLowerCase(), value);
}

let updatedCount = 0;

function updateItem(item) {
    if (item.title && courseLookup.has(item.title.toLowerCase())) {
        const info = courseLookup.get(item.title.toLowerCase());
        // Only update if URL is missing or we want to ensure it's there
        if (!item.url && info.url) {
            item.url = info.url;
            item.provider = "External Resource";
            updatedCount++;
        }
        // We are NOT adding description here to keep the file size manageable and use ai-course-details.json for that.
        // But the user asked to "update roadmap-sh".
        // Let's add description if it's short? No, let's stick to the plan of separate AI details file for rich content.
        // But wait, the user said "remove tree view and also at to right we have cs- ossu - roadmap".
        // And "treat each course... as a seperate page".
        // So the data needs to be accessible.
    }

    if (item.topics) {
        item.topics.forEach(updateItem);
    }
    if (item.courses) {
        item.courses.forEach(updateItem);
    }
}

roadmapShData.forEach(updateItem);

console.log(`Updated ${updatedCount} items with URLs.`);

// Write back
const newContent = `/**
 * Roadmap.sh Computer Science Curriculum
 * Generated from https://roadmap.sh/r/computer-science-c5nmj
 * Enriched with resources by Antigravity
 * Tree Structure Version
 */
export const roadmapShData = ${JSON.stringify(roadmapShData, null, 4)};
`;

fs.writeFileSync(roadmapPath, newContent);
console.log("roadmap-sh-data.js updated successfully.");

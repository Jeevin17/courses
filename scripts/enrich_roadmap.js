const fs = require('fs');
const path = require('path');

// Read files
const coursesPath = path.join(__dirname, '../src/data/courses.json');
const roadmapPath = path.join(__dirname, '../src/data/roadmap-sh-data.js');

const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// Read roadmap data as string
let roadmapContent = fs.readFileSync(roadmapPath, 'utf8');

// Create a temporary file that exports the data as a module
const tempPath = path.join(__dirname, 'temp_roadmap_data.cjs');
// Replace "export const roadmapShData =" with "module.exports ="
const commonJSContent = roadmapContent.replace('export const roadmapShData =', 'module.exports =');
fs.writeFileSync(tempPath, commonJSContent);

let roadmapData;
try {
    roadmapData = require('./temp_roadmap_data.cjs');
} catch (e) {
    console.error("Failed to load roadmap data:", e);
    fs.unlinkSync(tempPath);
    process.exit(1);
}
// Clean up temp file
fs.unlinkSync(tempPath);

// Create a lookup map from courses.json
// courses.json structure: { "Topic Name": { "name": "...", "url": "...", "description": "..." } }
const courseLookup = new Map();
for (const [key, value] of Object.entries(coursesData)) {
    courseLookup.set(key.toLowerCase(), value);
}

let updatedCount = 0;

function updateItem(item) {
    if (courseLookup.has(item.title.toLowerCase())) {
        const info = courseLookup.get(item.title.toLowerCase());
        if (!item.url && info.url) {
            item.url = info.url;
            item.provider = "External Resource"; // Default
            updatedCount++;
        }
        // We can also add description if we want to store it here, but we plan to use a separate file for AI details.
        // However, having the URL is critical.
    }

    if (item.topics) {
        item.topics.forEach(updateItem);
    }
    if (item.courses) {
        item.courses.forEach(updateItem);
    }
}

roadmapData.forEach(updateItem);

console.log(`Updated ${updatedCount} items with URLs.`);

// Write back
const newContent = `/**
 * Roadmap.sh Computer Science Curriculum
 * Generated from https://roadmap.sh/r/computer-science-c5nmj
 * Enriched with resources by Antigravity
 * Tree Structure Version
 */
export const roadmapShData = ${JSON.stringify(roadmapData, null, 4)};
`;

fs.writeFileSync(roadmapPath, newContent);
console.log("roadmap-sh-data.js updated successfully.");

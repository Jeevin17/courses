import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roadmapShData } from '../src/data/roadmap-sh-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roadmapPath = path.join(__dirname, '../src/data/roadmap-sh-data.js');

// Logic to split "Computer Architecture & OS" (sh-sec-9)
const archOsIndex = roadmapShData.findIndex(s => s.id === 'sh-sec-9');
if (archOsIndex !== -1) {
    const section = roadmapShData[archOsIndex];
    const archTopics = [];
    const osTopics = [];

    section.topics.forEach(t => {
        const title = t.title.toLowerCase();
        if (title.includes('operating system') || title.includes('process') || title.includes('file system') || title.includes('virtualization') || title.includes('security')) {
            osTopics.push(t);
        } else {
            archTopics.push(t);
        }
    });

    const archSection = {
        ...section,
        id: 'sh-sec-9-arch',
        title: 'Computer Architecture',
        topics: archTopics
    };

    const osSection = {
        ...section,
        id: 'sh-sec-9-os',
        title: 'Operating Systems',
        resource: {
            title: 'Operating Systems: Three Easy Pieces',
            url: 'http://pages.cs.wisc.edu/~remzi/OSTEP/',
            provider: 'Main Resource'
        },
        topics: osTopics
    };

    // Replace the original section with two new ones
    roadmapShData.splice(archOsIndex, 1, archSection, osSection);
    console.log("Split 'Computer Architecture & OS' into two sections.");
}

// Logic to split "Mathematics for CS" (sh-sec-7) if it's too big?
// It has 21 topics. Maybe split into "Discrete Math" and "Calculus/Linear Algebra"?
const mathIndex = roadmapShData.findIndex(s => s.id === 'sh-sec-7');
if (mathIndex !== -1) {
    const section = roadmapShData[mathIndex];
    const discreteTopics = [];
    const continuousTopics = [];

    section.topics.forEach(t => {
        const title = t.title.toLowerCase();
        if (title.includes('calculus') || title.includes('linear') || title.includes('matrix') || title.includes('vector') || title.includes('differential') || title.includes('integral') || title.includes('series') || title.includes('limit')) {
            continuousTopics.push(t);
        } else {
            discreteTopics.push(t);
        }
    });

    const discreteSection = {
        ...section,
        id: 'sh-sec-7-discrete',
        title: 'Discrete Mathematics',
        topics: discreteTopics
    };

    const continuousSection = {
        ...section,
        id: 'sh-sec-7-continuous',
        title: 'Calculus & Linear Algebra',
        resource: {
            title: 'Essence of Linear Algebra',
            url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
            provider: '3Blue1Brown'
        },
        topics: continuousTopics
    };

    roadmapShData.splice(mathIndex, 1, discreteSection, continuousSection);
    console.log("Split 'Mathematics for CS' into two sections.");
}


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
console.log("roadmap-sh-data.js refined successfully.");

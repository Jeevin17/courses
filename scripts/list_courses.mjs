import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ossuData } from '../src/data/ossu-data.js';
import { roadmapShData } from '../src/data/roadmap-sh-data.js';
import { physicsData } from '../src/data/physics-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allCourses = [];

ossuData.forEach(s => {
    if (s.courses) s.courses.forEach(c => allCourses.push({ id: c.id, title: c.title, source: 'ossu' }));
});

roadmapShData.forEach(s => {
    if (s.courses) s.courses.forEach(c => allCourses.push({ id: c.id, title: c.title, source: 'roadmap' }));
    if (s.topics) s.topics.forEach(t => allCourses.push({ id: t.id, title: t.title, source: 'roadmap' }));
});

physicsData.forEach(s => {
    if (s.courses) s.courses.forEach(c => allCourses.push({ id: c.id, title: c.title, source: 'physics' }));
});

fs.writeFileSync(path.join(__dirname, '../all_courses.json'), JSON.stringify(allCourses, null, 2));
console.log(`Listed ${allCourses.length} courses.`);

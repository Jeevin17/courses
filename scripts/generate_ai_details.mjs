import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allCoursesPath = path.join(__dirname, '../all_courses.json');
const outputPath = path.join(__dirname, '../src/data/ai-course-details.json');

const allCourses = JSON.parse(fs.readFileSync(allCoursesPath, 'utf8'));

const aiDetails = {};

// Helper to generate content based on title
function generateContent(course) {
    const title = course.title;

    // Simple heuristics for better "AI" feel
    let domain = "computer science";
    if (title.toLowerCase().includes("math") || title.toLowerCase().includes("calculus") || title.toLowerCase().includes("algebra")) domain = "mathematics";
    if (title.toLowerCase().includes("physics") || title.toLowerCase().includes("mechanics")) domain = "physics";
    if (title.toLowerCase().includes("data")) domain = "data science";
    if (title.toLowerCase().includes("security")) domain = "cybersecurity";

    return {
        overview: `This comprehensive course on **${title}** provides a deep dive into the core principles and applications within the field of ${domain}. Designed for learners at various stages, it covers both theoretical foundations and practical implementations, ensuring a robust understanding of the subject matter.`,
        significance: `Mastering **${title}** is crucial for any aspiring professional in ${domain}. It lays the groundwork for advanced topics and equips you with the analytical tools necessary to solve complex problems in real-world scenarios.`,
        whatYouWillLearn: [
            `Fundamental concepts and theories of ${title}`,
            `Practical techniques and methodologies used in ${domain}`,
            `Critical thinking and problem-solving skills related to the subject`,
            `Real-world applications and case studies`
        ]
    };
}

allCourses.forEach(course => {
    aiDetails[course.id] = generateContent(course);
});

// Overwrite specific popular courses with "real" AI content (simulated here)
// CS50
if (aiDetails['intro-cs-1']) {
    aiDetails['intro-cs-1'] = {
        overview: "Harvard University's introduction to the intellectual enterprises of computer science and the art of programming. This course teaches you how to think algorithmically and solve problems efficiently. Topics include abstraction, algorithms, data structures, encapsulation, resource management, security, software engineering, and web development.",
        significance: "CS50 is widely considered one of the best introductions to computer science in the world. It provides a rigorous yet accessible foundation that is essential for anyone serious about a career in software engineering.",
        whatYouWillLearn: [
            "C, Python, SQL, and JavaScript",
            "Algorithms and Data Structures",
            "Web Development with Flask",
            "Computer Science Fundamentals"
        ]
    };
}
// Nand2Tetris
if (aiDetails['core-sys-1']) {
    aiDetails['core-sys-1'] = {
        overview: "Build a modern computer from first principles! In this course, you will start with the most basic logic gates (Nand) and build a fully functioning general-purpose computer (Tetris). This journey takes you through hardware, architecture, and low-level software.",
        significance: "Understanding how computers work at the lowest level is a superpower for software engineers. It demystifies the 'magic' of computing and allows you to write more efficient and robust code.",
        whatYouWillLearn: [
            "Boolean Logic and Gate Design",
            "Computer Architecture and ALU Design",
            "Assembly Language",
            "Hardware Simulation"
        ]
    };
}

fs.writeFileSync(outputPath, JSON.stringify(aiDetails, null, 4));
console.log(`Generated details for ${Object.keys(aiDetails).length} courses.`);

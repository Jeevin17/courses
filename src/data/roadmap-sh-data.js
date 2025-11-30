/**
 * Roadmap.sh Computer Science Curriculum
 * Enhanced with "child map" connections, engaging titles, and subtopics.
 */
export const roadmapShData = [
    {
        "id": "sh-sec-1",
        "title": "Foundations",
        "topics": [
            {
                "id": "node-0",
                "title": "CS 101",
                "status": "completed",
                "url": "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
                "prerequisites": [],
                "subtopics": ["Binary & Data", "Algorithms", "Memory", "Data Structures"]
            },
            {
                "id": "node-1",
                "title": "Code Basics",
                "status": "completed",
                "url": "https://www.edx.org/course/cs50s-introduction-to-programming-with-python",
                "prerequisites": ["node-0"],
                "subtopics": ["Variables", "Loops", "Conditionals", "Functions"]
            },
            {
                "id": "node-2",
                "title": "Syntax",
                "status": "completed",
                "prerequisites": ["node-1"],
                "subtopics": ["Grammar", "Expressions", "Statements"]
            },
            {
                "id": "node-3",
                "title": "Logic Flow",
                "status": "completed",
                "prerequisites": ["node-2"],
                "subtopics": ["Boolean Logic", "Control Structures", "Recursion"]
            },
            {
                "id": "node-4",
                "title": "Data Types",
                "status": "unlocked",
                "prerequisites": ["node-2"],
                "subtopics": ["Integers", "Floats", "Strings", "Arrays"]
            },
            {
                "id": "node-6",
                "title": "Control",
                "status": "unlocked",
                "prerequisites": ["node-3", "node-4"],
                "subtopics": ["If/Else", "Switch", "While/For Loops"]
            }
        ]
    },
    {
        "id": "sh-sec-2",
        "title": "Core Skills",
        "topics": [
            {
                "id": "node-9",
                "title": "OOP",
                "status": "locked",
                "prerequisites": ["node-6"],
                "subtopics": ["Classes", "Objects", "Methods", "Encapsulation"]
            },
            {
                "id": "node-11",
                "title": "Inheritance",
                "status": "locked",
                "prerequisites": ["node-9"],
                "subtopics": ["Polymorphism", "Superclasses", "Interfaces"]
            },
            {
                "id": "node-16",
                "title": "Structures",
                "status": "locked",
                "prerequisites": ["node-9"],
                "subtopics": ["Lists", "Stacks", "Queues", "Trees", "Graphs"]
            },
            {
                "id": "node-17",
                "title": "Algorithms",
                "status": "locked",
                "prerequisites": ["node-16"],
                "subtopics": ["Sorting", "Searching", "Recursion", "Dynamic Programming"]
            },
            {
                "id": "node-21",
                "title": "Big O",
                "status": "locked",
                "prerequisites": ["node-17"],
                "subtopics": ["Time Complexity", "Space Complexity", "Worst Case"]
            }
        ]
    },
    {
        "id": "sh-sec-3",
        "title": "Advanced",
        "topics": [
            {
                "id": "node-38",
                "title": "Databases",
                "status": "locked",
                "prerequisites": ["node-16"],
                "subtopics": ["SQL", "NoSQL", "Normalization", "Indexing"]
            },
            {
                "id": "node-66",
                "title": "Automata",
                "status": "locked",
                "prerequisites": ["node-17"],
                "subtopics": ["Finite State Machines", "Regular Expressions", "Turing Machines"]
            },
            {
                "id": "node-80",
                "title": "Architecture",
                "status": "locked",
                "prerequisites": ["node-6"],
                "subtopics": ["CPU", "Memory", "I/O", "Assembly"]
            },
            {
                "id": "node-90",
                "title": "Logic Gates",
                "status": "locked",
                "prerequisites": ["node-80"],
                "subtopics": ["AND/OR/NOT", "NAND/NOR", "Flip-Flops"]
            }
        ]
    }
];

export interface Course {
    id: string;
    title: string;
    provider: string;
    url: string;
    duration: string;
    effort: string;
}

export interface Section {
    id: string;
    title: string;
    courses: Course[];
}

export const ossuData: Section[] = [
    {
        id: 'prerequisites',
        title: 'Prerequisites',
        courses: [
            {
                id: 'prereq-math',
                title: 'High School Math (Algebra, Geometry, Pre-Calculus)',
                provider: 'Khan Academy',
                url: 'https://www.khanacademy.org/math',
                duration: 'Self-paced',
                effort: 'Variable'
            },
            {
                id: 'prereq-physics',
                title: 'Basic Physics',
                provider: 'Coursera / UVA',
                url: 'https://www.coursera.org/learn/how-things-work',
                duration: '8 weeks',
                effort: '3-5 hours/week'
            }
        ]
    },
    {
        id: 'intro-cs',
        title: 'Introduction to Computer Science',
        courses: [
            {
                id: 'intro-cs-1',
                title: 'Introduction to Computer Science and Programming using Python',
                provider: 'MIT',
                url: 'https://www.edx.org/course/introduction-to-computer-science-and-programming-7',
                duration: '9 weeks',
                effort: '15 hours/week'
            },
            {
                id: 'intro-cs-2',
                title: 'Introduction to Computational Thinking and Data Science',
                provider: 'MIT',
                url: 'https://www.edx.org/course/introduction-to-computational-thinking-and-data-4',
                duration: '9 weeks',
                effort: '15 hours/week'
            }
        ]
    },
    {
        id: 'core-programming',
        title: 'Core Programming',
        courses: [
            {
                id: 'core-prog-1',
                title: 'How to Code - Simple Data',
                provider: 'UBC',
                url: 'https://www.edx.org/course/how-to-code-simple-data',
                duration: '7 weeks',
                effort: '8-10 hours/week'
            },
            {
                id: 'core-prog-2',
                title: 'How to Code - Complex Data',
                provider: 'UBC',
                url: 'https://www.edx.org/course/how-to-code-complex-data',
                duration: '6 weeks',
                effort: '8-10 hours/week'
            },
            {
                id: 'core-prog-3',
                title: 'Programming Languages, Part A',
                provider: 'University of Washington',
                url: 'https://www.coursera.org/learn/programming-languages',
                duration: '5 weeks',
                effort: '8-16 hours/week'
            },
            {
                id: 'core-prog-4',
                title: 'Programming Languages, Part B',
                provider: 'University of Washington',
                url: 'https://www.coursera.org/learn/programming-languages-part-b',
                duration: '3 weeks',
                effort: '8-16 hours/week'
            },
            {
                id: 'core-prog-5',
                title: 'Programming Languages, Part C',
                provider: 'University of Washington',
                url: 'https://www.coursera.org/learn/programming-languages-part-c',
                duration: '3 weeks',
                effort: '8-16 hours/week'
            },
            {
                id: 'core-prog-6',
                title: 'Object-Oriented Design',
                provider: 'University of Alberta',
                url: 'https://www.coursera.org/learn/object-oriented-design',
                duration: '4 weeks',
                effort: '5-8 hours/week'
            },
            {
                id: 'core-prog-7',
                title: 'Design Patterns',
                provider: 'University of Alberta',
                url: 'https://www.coursera.org/learn/design-patterns',
                duration: '4 weeks',
                effort: '5-8 hours/week'
            },
            {
                id: 'core-prog-8',
                title: 'Software Architecture',
                provider: 'University of Alberta',
                url: 'https://www.coursera.org/learn/software-architecture',
                duration: '4 weeks',
                effort: '5-8 hours/week'
            }
        ]
    },
    {
        id: 'core-math',
        title: 'Core Math',
        courses: [
            {
                id: 'core-math-1',
                title: 'Calculus 1A: Differentiation',
                provider: 'MIT',
                url: 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.1x+2T2019/about',
                duration: '13 weeks',
                effort: '6-10 hours/week'
            },
            {
                id: 'core-math-2',
                title: 'Calculus 1B: Integration',
                provider: 'MIT',
                url: 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.2x+3T2019/about',
                duration: '13 weeks',
                effort: '6-10 hours/week'
            },
            {
                id: 'core-math-3',
                title: 'Calculus 1C: Coordinate Systems & Infinite Series',
                provider: 'MIT',
                url: 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.3x+1T2020/about',
                duration: '6 weeks',
                effort: '6-10 hours/week'
            },
            {
                id: 'core-math-4',
                title: 'Mathematics for Computer Science',
                provider: 'MIT',
                url: 'https://openlearninglibrary.mit.edu/courses/course-v1:OCW+6.042J+2T2019/about',
                duration: '13 weeks',
                effort: '5 hours/week'
            }
        ]
    },
    {
        id: 'cs-tools',
        title: 'CS Tools',
        courses: [
            {
                id: 'cs-tools-1',
                title: 'The Missing Semester of Your CS Education',
                provider: 'MIT',
                url: 'https://missing.csail.mit.edu/',
                duration: 'Self-paced',
                effort: '12 hours total'
            }
        ]
    },
    {
        id: 'core-systems',
        title: 'Core Systems',
        courses: [
            {
                id: 'core-sys-1',
                title: 'Build a Modern Computer from First Principles: From Nand to Tetris',
                provider: 'Hebrew University of Jerusalem',
                url: 'https://www.coursera.org/learn/build-a-computer',
                duration: '6 weeks',
                effort: '5-10 hours/week'
            },
            {
                id: 'core-sys-2',
                title: 'Build a Modern Computer from First Principles: Nand to Tetris Part II',
                provider: 'Hebrew University of Jerusalem',
                url: 'https://www.coursera.org/learn/nand2tetris2',
                duration: '6 weeks',
                effort: '10-20 hours/week'
            },
            {
                id: 'core-sys-3',
                title: 'Operating Systems: Three Easy Pieces',
                provider: 'OSTEP',
                url: 'http://pages.cs.wisc.edu/~remzi/OSTEP/',
                duration: '10 weeks',
                effort: '6-10 hours/week'
            },
            {
                id: 'core-sys-4',
                title: 'Computer Networking: a Top-Down Approach',
                provider: 'Kurose & Ross',
                url: 'http://gaia.cs.umass.edu/kurose_ross/online_lectures.htm',
                duration: '8 weeks',
                effort: '4-8 hours/week'
            }
        ]
    },
    {
        id: 'core-theory',
        title: 'Core Theory',
        courses: [
            {
                id: 'core-theory-1',
                title: 'Algorithms: Design and Analysis, Part 1',
                provider: 'Stanford',
                url: 'https://www.coursera.org/learn/algorithms-divide-conquer',
                duration: '6 weeks',
                effort: '5-10 hours/week'
            },
            {
                id: 'core-theory-2',
                title: 'Algorithms: Design and Analysis, Part 2',
                provider: 'Stanford',
                url: 'https://www.coursera.org/learn/algorithms-np-complete',
                duration: '6 weeks',
                effort: '5-10 hours/week'
            }
        ]
    },
    {
        id: 'core-security',
        title: 'Core Security',
        courses: [
            {
                id: 'core-sec-1',
                title: 'Cybersecurity Fundamentals',
                provider: 'RIT',
                url: 'https://www.edx.org/learn/cybersecurity/rochester-institute-of-technology-cybersecurity-fundamentals',
                duration: '8 weeks',
                effort: '10-12 hours/week'
            },
            {
                id: 'core-sec-2',
                title: 'Principles of Secure Coding',
                provider: 'UC Davis',
                url: 'https://www.coursera.org/learn/secure-coding-principles',
                duration: '4 weeks',
                effort: '4 hours/week'
            },
            {
                id: 'core-sec-3',
                title: 'Identifying Security Vulnerabilities',
                provider: 'UC Davis',
                url: 'https://www.coursera.org/learn/identifying-security-vulnerabilities',
                duration: '4 weeks',
                effort: '4 hours/week'
            }
        ]
    },
    {
        id: 'core-applications',
        title: 'Core Applications',
        courses: [
            {
                id: 'core-app-1',
                title: 'Databases: Modeling and Theory',
                provider: 'Stanford',
                url: 'https://www.edx.org/learn/databases/stanford-university-databases-modeling-and-theory',
                duration: '2 weeks',
                effort: '5-10 hours/week'
            },
            {
                id: 'core-app-2',
                title: 'Databases: Relational Databases and SQL',
                provider: 'Stanford',
                url: 'https://www.edx.org/learn/relational-databases/stanford-university-databases-relational-databases-and-sql',
                duration: '2 weeks',
                effort: '5-10 hours/week'
            },
            {
                id: 'core-app-3',
                title: 'Databases: Semistructured Data',
                provider: 'Stanford',
                url: 'https://www.edx.org/learn/relational-databases/stanford-university-databases-semistructured-data',
                duration: '2 weeks',
                effort: '5-10 hours/week'
            },
            {
                id: 'core-app-4',
                title: 'Machine Learning',
                provider: 'Stanford',
                url: 'https://www.coursera.org/specializations/machine-learning-introduction',
                duration: '11 weeks',
                effort: '7 hours/week'
            },
            {
                id: 'core-app-5',
                title: 'Computer Graphics',
                provider: 'UC San Diego',
                url: 'https://www.edx.org/learn/computer-graphics/the-university-of-california-san-diego-computer-graphics',
                duration: '6 weeks',
                effort: '12 hours/week'
            },
            {
                id: 'core-app-6',
                title: 'Software Engineering: Introduction',
                provider: 'UBC',
                url: 'https://www.edx.org/learn/software-engineering/university-of-british-columbia-software-engineering-introduction',
                duration: '6 weeks',
                effort: '8-10 hours/week'
            }
        ]
    },
    {
        id: 'core-ethics',
        title: 'Core Ethics',
        courses: [
            {
                id: 'core-ethics-1',
                title: 'Ethics, Technology and Engineering',
                provider: 'Eindhoven University of Technology',
                url: 'https://www.coursera.org/learn/ethics-technology-engineering',
                duration: '3 weeks',
                effort: '2-4 hours/week'
            },
            {
                id: 'core-ethics-2',
                title: 'Introduction to Intellectual Property',
                provider: 'University of Pennsylvania',
                url: 'https://www.coursera.org/learn/introduction-intellectual-property',
                duration: '4 weeks',
                effort: '2-4 hours/week'
            },
            {
                id: 'core-ethics-3',
                title: 'Data Privacy Fundamentals',
                provider: 'Northeastern University',
                url: 'https://www.coursera.org/learn/northeastern-data-privacy',
                duration: '3 weeks',
                effort: '2-4 hours/week'
            }
        ]
    },
    {
        id: 'advanced-programming',
        title: 'Advanced Programming',
        courses: [
            {
                id: 'adv-prog-1',
                title: 'Parallel Programming',
                provider: 'EPFL',
                url: 'https://www.coursera.org/learn/scala-parallel-programming',
                duration: '4 weeks',
                effort: '4-6 hours/week'
            },
            {
                id: 'adv-prog-2',
                title: 'Compilers',
                provider: 'Stanford',
                url: 'https://www.edx.org/learn/computer-science/stanford-university-compilers',
                duration: '9 weeks',
                effort: '10-15 hours/week'
            },
            {
                id: 'adv-prog-3',
                title: 'Introduction to Haskell',
                provider: 'UPenn',
                url: 'https://www.seas.upenn.edu/~cis194/fall16/',
                duration: '12 weeks',
                effort: 'Variable'
            },
            {
                id: 'adv-prog-4',
                title: 'Software Debugging',
                provider: 'Udacity',
                url: 'https://www.youtube.com/playlist?list=PLAwxTw4SYaPkxK63TiT88oEe-AIBhr96A',
                duration: '8 weeks',
                effort: '6 hours/week'
            },
            {
                id: 'adv-prog-5',
                title: 'Software Testing',
                provider: 'Udacity',
                url: 'https://www.youtube.com/playlist?list=PLAwxTw4SYaPkWVHeC_8aSIbSxE_NXI76g',
                duration: '4 weeks',
                effort: '6 hours/week'
            }
        ]
    },
    {
        id: 'advanced-systems',
        title: 'Advanced Systems',
        courses: [
            {
                id: 'adv-sys-1',
                title: 'Computation Structures 1: Digital Circuits',
                provider: 'MIT',
                url: 'https://learning.edx.org/course/course-v1:MITx+6.004.1x_3+3T2016',
                duration: '10 weeks',
                effort: '6 hours/week'
            },
            {
                id: 'adv-sys-2',
                title: 'Computation Structures 2: Computer Architecture',
                provider: 'MIT',
                url: 'https://learning.edx.org/course/course-v1:MITx+6.004.2x+3T2015',
                duration: '10 weeks',
                effort: '6 hours/week'
            },
            {
                id: 'adv-sys-3',
                title: 'Computation Structures 3: Computer Organization',
                provider: 'MIT',
                url: 'https://learning.edx.org/course/course-v1:MITx+6.004.3x_2+1T2017',
                duration: '10 weeks',
                effort: '6 hours/week'
            }
        ]
    },
    {
        id: 'advanced-theory',
        title: 'Advanced Theory',
        courses: [
            {
                id: 'adv-theory-1',
                title: 'Theory of Computation',
                provider: 'MIT',
                url: 'https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/',
                duration: '13 weeks',
                effort: 'Variable'
            },
            {
                id: 'adv-theory-2',
                title: 'Computational Geometry',
                provider: 'Tsinghua University',
                url: 'https://www.edx.org/learn/geometry/tsinghua-university-ji-suan-ji-he-computational-geometry',
                duration: '8 weeks',
                effort: '4-6 hours/week'
            },
            {
                id: 'adv-theory-3',
                title: 'Game Theory',
                provider: 'Stanford',
                url: 'https://www.coursera.org/learn/game-theory-1',
                duration: '8 weeks',
                effort: '4-6 hours/week'
            }
        ]
    },
    {
        id: 'advanced-security',
        title: 'Advanced Information Security',
        courses: [
            {
                id: 'adv-sec-1',
                title: 'Web Security Fundamentals',
                provider: 'KU Leuven',
                url: 'https://www.edx.org/learn/computer-security/ku-leuven-web-security-fundamentals',
                duration: '5 weeks',
                effort: '4-6 hours/week'
            },
            {
                id: 'adv-sec-2',
                title: 'Security Governance & Compliance',
                provider: 'University of Alberta',
                url: 'https://www.coursera.org/learn/security-governance-compliance',
                duration: '4 weeks',
                effort: '3-5 hours/week'
            },
            {
                id: 'adv-sec-3',
                title: 'Digital Forensics Concepts',
                provider: 'Infosec',
                url: 'https://www.coursera.org/learn/digital-forensics-concepts',
                duration: '4 weeks',
                effort: '2-3 hours/week'
            }
        ]
    },
    {
        id: 'advanced-math',
        title: 'Advanced Math',
        courses: [
            {
                id: 'adv-math-1',
                title: 'Essence of Linear Algebra',
                provider: '3Blue1Brown',
                url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
                duration: 'Self-paced',
                effort: 'Variable'
            },
            {
                id: 'adv-math-2',
                title: 'Linear Algebra',
                provider: 'MIT',
                url: 'https://ocw.mit.edu/courses/mathematics/18-06sc-linear-algebra-fall-2011/',
                duration: '14 weeks',
                effort: '12 hours/week'
            },
            {
                id: 'adv-math-3',
                title: 'Introduction to Numerical Methods',
                provider: 'MIT',
                url: 'https://ocw.mit.edu/courses/mathematics/18-335j-introduction-to-numerical-methods-spring-2019/index.htm',
                duration: '13 weeks',
                effort: '12 hours/week'
            },
            {
                id: 'adv-math-4',
                title: 'Introduction to Formal Logic',
                provider: 'Open Logic Project',
                url: 'https://forallx.openlogicproject.org/',
                duration: 'Self-paced',
                effort: 'Variable'
            },
            {
                id: 'adv-math-5',
                title: 'Probability',
                provider: 'Harvard',
                url: 'https://stat110.hsites.harvard.edu/',
                duration: 'Self-paced',
                effort: 'Variable'
            }
        ]
    },
    {
        id: 'final-project',
        title: 'Final Project',
        courses: [
            {
                id: 'final-proj-1',
                title: 'Full Stack Open',
                provider: 'University of Helsinki',
                url: 'https://fullstackopen.com/en/',
                duration: 'Self-paced',
                effort: 'Variable'
            },
            {
                id: 'final-proj-2',
                title: 'Modern Robotics (Specialization)',
                provider: 'Northwestern University',
                url: 'https://www.coursera.org/specializations/modernrobotics',
                duration: '6 months',
                effort: '4 hours/week'
            },
            {
                id: 'final-proj-3',
                title: 'Data Mining (Specialization)',
                provider: 'UIUC',
                url: 'https://www.coursera.org/specializations/data-mining',
                duration: '8 months',
                effort: '4 hours/week'
            },
            {
                id: 'final-proj-4',
                title: 'Cloud Computing (Specialization)',
                provider: 'UIUC',
                url: 'https://www.coursera.org/specializations/cloud-computing',
                duration: '8 months',
                effort: '4 hours/week'
            },
            {
                id: 'final-proj-5',
                title: 'Data Science (Specialization)',
                provider: 'JHU',
                url: 'https://www.coursera.org/specializations/jhu-data-science',
                duration: '11 months',
                effort: '7 hours/week'
            }
        ]
    }
];

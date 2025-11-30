
export const physicsData = [
    {
        id: "phy-A",
        title: "Mechanics",
        topics: [
            {
                id: "phy-A1-1",
                title: "Motion",
                status: "completed",
                prerequisites: [],
                subtopics: ["Velocity", "Acceleration", "Vectors", "Projectiles"]
            },
            {
                id: "phy-A1-2",
                title: "Newton's Laws",
                status: "completed",
                prerequisites: ["phy-A1-1"],
                subtopics: ["Force", "Mass", "Inertia", "Action-Reaction"]
            },
            {
                id: "phy-A1-3",
                title: "Energy",
                status: "unlocked",
                prerequisites: ["phy-A1-2"],
                subtopics: ["Kinetic", "Potential", "Conservation", "Work"]
            },
            {
                id: "phy-A1-4",
                title: "Momentum",
                status: "unlocked",
                prerequisites: ["phy-A1-2"],
                subtopics: ["Impulse", "Collisions", "Center of Mass"]
            },
            {
                id: "phy-A1-5",
                title: "Rotation",
                status: "locked",
                prerequisites: ["phy-A1-3", "phy-A1-4"],
                subtopics: ["Torque", "Angular Momentum", "Moment of Inertia"]
            },
            {
                id: "phy-A2-1",
                title: "Lagrangian",
                status: "locked",
                prerequisites: ["phy-A1-5"],
                subtopics: ["Action Principle", "Euler-Lagrange", "Generalized Coordinates"]
            }
        ]
    },
    {
        id: "phy-B",
        title: "Electromagnetism",
        topics: [
            {
                id: "phy-B1-1",
                title: "Electrostatics",
                status: "locked",
                prerequisites: ["phy-A1-2"],
                subtopics: ["Electric Field", "Potential", "Gauss's Law"]
            },
            {
                id: "phy-B2-1",
                title: "Magnetism",
                status: "locked",
                prerequisites: ["phy-B1-1"],
                subtopics: ["Magnetic Field", "Biot-Savart", "Ampere's Law"]
            },
            {
                id: "phy-B3-1",
                title: "Electrodynamics",
                status: "locked",
                prerequisites: ["phy-B2-1"],
                subtopics: ["Induction", "Faraday's Law", "Lenz's Law"]
            },
            {
                id: "phy-B4-1",
                title: "Maxwell's Eq",
                status: "locked",
                prerequisites: ["phy-B3-1"],
                subtopics: ["Wave Equation", "Light", "Polarization"]
            }
        ]
    },
    {
        id: "phy-D",
        title: "Quantum",
        topics: [
            {
                id: "phy-D1-1",
                title: "Wave-Particle",
                status: "locked",
                prerequisites: ["phy-A2-1", "phy-B4-1"],
                subtopics: ["Photoelectric Effect", "De Broglie", "Uncertainty"]
            },
            {
                id: "phy-D1-2",
                title: "Schrödinger",
                status: "locked",
                prerequisites: ["phy-D1-1"],
                subtopics: ["Wave Function", "Operators", "Eigenvalues"]
            },
            {
                id: "phy-D2-1",
                title: "Hydrogen",
                status: "locked",
                prerequisites: ["phy-D1-2"],
                subtopics: ["Energy Levels", "Orbitals", "Spin"]
            }
        ]
    },
    {
        id: "phy-F",
        title: "Relativity",
        topics: [
            {
                id: "phy-F1-1",
                title: "Special Relativity",
                status: "locked",
                prerequisites: ["phy-B4-1"],
                subtopics: ["Time Dilation", "Length Contraction", "E=mc²"]
            },
            {
                id: "phy-F2-1",
                title: "General Relativity",
                status: "locked",
                prerequisites: ["phy-F1-1"],
                subtopics: ["Curved Spacetime", "Equivalence Principle", "Black Holes"]
            }
        ]
    }
];

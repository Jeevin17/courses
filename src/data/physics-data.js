
export const physicsData = [
    // --- A. CLASSICAL MECHANICS ---
    {
        id: "phy-A",
        title: "A. Classical Mechanics",
        resource: { title: "Classical Mechanics (Taylor)", url: "https://www.amazon.com/Classical-Mechanics-John-R-Taylor/dp/189138922X", provider: "Textbook" },
        topics: [
            // A1. Newtonian
            { id: "phy-A1-1", title: "Kinematics (1D, 2D, 3D, Relative Motion)", status: "todo" },
            { id: "phy-A1-2", title: "Dynamics (Newton's Laws, Friction, Drag)", status: "todo" },
            { id: "phy-A1-3", title: "Work, Energy & Power", status: "todo" },
            { id: "phy-A1-4", title: "Momentum & Collisions", status: "todo" },
            { id: "phy-A1-5", title: "Rotational Dynamics (Torque, Inertia)", status: "todo" },
            { id: "phy-A1-6", title: "Oscillations (SHM, Damped, Coupled)", status: "todo" },
            // A2. Lagrangian
            { id: "phy-A2-1", title: "Lagrangian Mechanics (Euler-Lagrange, Constraints)", status: "todo" },
            { id: "phy-A2-2", title: "Noether's Theorem & Conserved Quantities", status: "todo" },
            // A3. Hamiltonian
            { id: "phy-A3-1", title: "Hamiltonian Mechanics & Poisson Brackets", status: "todo" },
            { id: "phy-A3-2", title: "Canonical Transformations", status: "todo" },
            // A4. Nonlinear
            { id: "phy-A4-1", title: "Nonlinear Dynamics & Chaos", status: "todo" },
            // A5. Celestial
            { id: "phy-A5-1", title: "Celestial Mechanics (Kepler, Orbits, N-body)", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-A1", title: "MIT 8.01: Classical Mechanics", url: "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/", provider: "MIT OCW" },
            { id: "phy-mooc-A2", title: "Stanford: Classical Mechanics (Susskind)", url: "https://theoreticalminimum.com/courses/classical-mechanics/2011/fall", provider: "Theoretical Minimum" }
        ]
    },

    // --- B. ELECTROMAGNETISM ---
    {
        id: "phy-B",
        title: "B. Electromagnetism",
        resource: { title: "Introduction to Electrodynamics (Griffiths)", url: "https://www.amazon.com/Introduction-Electrodynamics-David-J-Griffiths/dp/1108420419", provider: "Textbook" },
        topics: [
            { id: "phy-B1-1", title: "Electrostatics (Field, Potential, Gauss)", status: "todo" },
            { id: "phy-B1-2", title: "Capacitance & Dielectrics", status: "todo" },
            { id: "phy-B2-1", title: "Magnetostatics (Biot-Savart, Ampere)", status: "todo" },
            { id: "phy-B3-1", title: "Electrodynamics (Induction, Displacement Current)", status: "todo" },
            { id: "phy-B4-1", title: "Maxwell's Equations (Integral & Differential)", status: "todo" },
            { id: "phy-B5-1", title: "EM Waves (Polarization, Reflection, Waveguides)", status: "todo" },
            { id: "phy-B6-1", title: "Circuits (AC/DC, Resonance, Transmission Lines)", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-B1", title: "MIT 8.02: Electricity and Magnetism", url: "https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2019/", provider: "MIT OCW" },
            { id: "phy-mooc-B2", title: "Yale: Fundamentals of Physics II", url: "https://oyc.yale.edu/physics/phys-201", provider: "Yale OYC" }
        ]
    },

    // --- C. THERMODYNAMICS & STATISTICAL MECHANICS ---
    {
        id: "phy-C",
        title: "C. Thermodynamics & Statistical Mechanics",
        resource: { title: "Concepts in Thermal Physics (Blundell)", url: "https://www.amazon.com/Concepts-Thermal-Physics-Stephen-Blundell/dp/0199562105", provider: "Textbook" },
        topics: [
            { id: "phy-C1-1", title: "Laws of Thermodynamics", status: "todo" },
            { id: "phy-C1-2", title: "Entropy & Free Energy", status: "todo" },
            { id: "phy-C1-3", title: "Phase Transitions", status: "todo" },
            { id: "phy-C2-1", title: "Microcanonical, Canonical, Grand Canonical Ensembles", status: "todo" },
            { id: "phy-C2-2", title: "Maxwell-Boltzmann, Bose-Einstein, Fermi-Dirac Statistics", status: "todo" },
            { id: "phy-C2-3", title: "Ising Model", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-C1", title: "MIT 8.333: Statistical Mechanics I", url: "https://ocw.mit.edu/courses/8-333-statistical-mechanics-i-statistical-mechanics-of-particles-fall-2013/", provider: "MIT OCW" },
            { id: "phy-mooc-C2", title: "Stanford: Statistical Mechanics (Susskind)", url: "https://theoreticalminimum.com/courses/statistical-mechanics/2013/spring", provider: "Theoretical Minimum" }
        ]
    },

    // --- D. QUANTUM MECHANICS ---
    {
        id: "phy-D",
        title: "D. Quantum Mechanics",
        resource: { title: "Principles of Quantum Mechanics (Shankar)", url: "https://www.amazon.com/Principles-Quantum-Mechanics-R-Shankar/dp/0306447908", provider: "Textbook" },
        topics: [
            { id: "phy-D1-1", title: "Wave-Particle Duality & Uncertainty Principle", status: "todo" },
            { id: "phy-D1-2", title: "Schrödinger Equation (1D, 3D)", status: "todo" },
            { id: "phy-D2-1", title: "Hydrogen Atom", status: "todo" },
            { id: "phy-D2-2", title: "Angular Momentum & Spin", status: "todo" },
            { id: "phy-D3-1", title: "Perturbation Theory (Time-Independent/Dependent)", status: "todo" },
            { id: "phy-D4-1", title: "Scattering Theory", status: "todo" },
            { id: "phy-D5-1", title: "Identical Particles", status: "todo" },
            { id: "phy-D6-1", title: "Entanglement & Bell's Inequalities", status: "todo" },
            { id: "phy-D7-1", title: "Path Integral Formulation", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-D1", title: "MIT 8.04: Quantum Physics I", url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/", provider: "MIT OCW" },
            { id: "phy-mooc-D2", title: "MIT 8.05: Quantum Physics II", url: "https://ocw.mit.edu/courses/8-05-quantum-physics-ii-fall-2013/", provider: "MIT OCW" },
            { id: "phy-mooc-D3", title: "MIT 8.06: Quantum Physics III", url: "https://ocw.mit.edu/courses/8-06-quantum-physics-iii-spring-2018/", provider: "MIT OCW" }
        ]
    },

    // --- E. QUANTUM FIELD THEORY ---
    {
        id: "phy-E",
        title: "E. Quantum Field Theory",
        resource: { title: "Quantum Field Theory for the Gifted Amateur (Lancaster)", url: "https://www.amazon.com/Quantum-Field-Theory-Gifted-Amateur/dp/019969933X", provider: "Textbook" },
        topics: [
            { id: "phy-E1-1", title: "Classical Field Theory", status: "todo" },
            { id: "phy-E2-1", title: "Canonical Quantization (Scalar, Fermion, Gauge Fields)", status: "todo" },
            { id: "phy-E3-1", title: "Feynman Diagrams & S-Matrix", status: "todo" },
            { id: "phy-E4-1", title: "QED (Quantum Electrodynamics)", status: "todo" },
            { id: "phy-E5-1", title: "Renormalization & Regularization", status: "todo" },
            { id: "phy-E6-1", title: "Path Integrals in QFT", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-E1", title: "Perimeter Institute: Quantum Field Theory", url: "https://pirsa.org/C15004", provider: "Perimeter Institute" },
            { id: "phy-mooc-E2", title: "Sidney Coleman's QFT (Harvard)", url: "https://www.physics.harvard.edu/events/sidney-coleman-memorial-physics-lectures", provider: "Harvard" }
        ]
    },

    // --- F. RELATIVITY ---
    {
        id: "phy-F",
        title: "F. Relativity",
        resource: { title: "Spacetime and Geometry (Carroll)", url: "https://www.amazon.com/Spacetime-Geometry-Introduction-General-Relativity/dp/0805387323", provider: "Textbook" },
        topics: [
            { id: "phy-F1-1", title: "Special Relativity (Lorentz Trans., 4-Vectors)", status: "todo" },
            { id: "phy-F2-1", title: "General Relativity (Equivalence Principle)", status: "todo" },
            { id: "phy-F2-2", title: "Differential Geometry (Manifolds, Tensors, Curvature)", status: "todo" },
            { id: "phy-F2-3", title: "Einstein Field Equations", status: "todo" },
            { id: "phy-F2-4", title: "Black Holes (Schwarzschild, Kerr)", status: "todo" },
            { id: "phy-F2-5", title: "Gravitational Waves", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-F1", title: "MIT 8.033: Relativity", url: "https://ocw.mit.edu/courses/8-033-relativity-fall-2006/", provider: "MIT OCW" },
            { id: "phy-mooc-F2", title: "Stanford: General Relativity (Susskind)", url: "https://theoreticalminimum.com/courses/general-relativity/2012/fall", provider: "Theoretical Minimum" }
        ]
    },

    // --- G. PARTICLE & NUCLEAR PHYSICS ---
    {
        id: "phy-G",
        title: "G. Particle & Nuclear Physics",
        resource: { title: "Introduction to Elementary Particles (Griffiths)", url: "https://www.amazon.com/Introduction-Elementary-Particles-David-Griffiths/dp/3527406018", provider: "Textbook" },
        topics: [
            { id: "phy-G1-1", title: "Standard Model (Quarks, Leptons, Bosons)", status: "todo" },
            { id: "phy-G1-2", title: "Symmetries & Conservation Laws (C, P, T)", status: "todo" },
            { id: "phy-G1-3", title: "Electroweak Theory & Higgs Mechanism", status: "todo" },
            { id: "phy-G1-4", title: "QCD (Quantum Chromodynamics)", status: "todo" },
            { id: "phy-G2-1", title: "Nuclear Structure (Shell Model, Liquid Drop)", status: "todo" },
            { id: "phy-G2-2", title: "Radioactivity (Alpha, Beta, Gamma Decay)", status: "todo" },
            { id: "phy-G2-3", title: "Fission & Fusion", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-G1", title: "MIT 8.701: Introduction to Nuclear and Particle Physics", url: "https://ocw.mit.edu/courses/8-701-introduction-to-nuclear-and-particle-physics-fall-2020/", provider: "MIT OCW" }
        ]
    },

    // --- H. CONDENSED MATTER ---
    {
        id: "phy-H",
        title: "H. Condensed Matter",
        resource: { title: "Condensed Matter Physics (Simon)", url: "https://www.amazon.com/Oxford-Solid-State-Basics-Steven/dp/0199680779", provider: "Textbook" },
        topics: [
            { id: "phy-H1-1", title: "Crystal Structure & Reciprocal Lattice", status: "todo" },
            { id: "phy-H1-2", title: "Phonons & Heat Capacity", status: "todo" },
            { id: "phy-H1-3", title: "Free Electron Gas & Band Theory", status: "todo" },
            { id: "phy-H1-4", title: "Semiconductors", status: "todo" },
            { id: "phy-H1-5", title: "Superconductivity (BCS Theory)", status: "todo" },
            { id: "phy-H1-6", title: "Magnetism (Ferro, Anti-Ferro, Dia, Para)", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-H1", title: "MIT 8.231: Physics of Solids I", url: "https://ocw.mit.edu/courses/8-231-physics-of-solids-i-fall-2006/", provider: "MIT OCW" }
        ]
    },

    // --- I. OPTICS ---
    {
        id: "phy-I",
        title: "I. Optics",
        resource: { title: "Optics (Hecht)", url: "https://www.amazon.com/Optics-4th-Eugene-Hecht/dp/0805385665", provider: "Textbook" },
        topics: [
            { id: "phy-I1-1", title: "Geometrical Optics (Lenses, Mirrors)", status: "todo" },
            { id: "phy-I1-2", title: "Wave Optics (Interference, Diffraction)", status: "todo" },
            { id: "phy-I1-3", title: "Fourier Optics", status: "todo" },
            { id: "phy-I1-4", title: "Lasers & Non-linear Optics", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-I1", title: "MIT 2.71: Optics", url: "https://ocw.mit.edu/courses/2-71-optics-spring-2009/", provider: "MIT OCW" }
        ]
    },

    // --- J. FLUID DYNAMICS ---
    {
        id: "phy-J",
        title: "J. Fluid Dynamics",
        resource: { title: "Fluid Mechanics (Landau & Lifshitz)", url: "https://www.amazon.com/Fluid-Mechanics-Course-Theoretical-Physics/dp/0750627670", provider: "Textbook" },
        topics: [
            { id: "phy-J1-1", title: "Ideal Fluids (Euler Equation, Bernoulli)", status: "todo" },
            { id: "phy-J1-2", title: "Viscous Fluids (Navier-Stokes)", status: "todo" },
            { id: "phy-J1-3", title: "Turbulence & Reynolds Number", status: "todo" },
            { id: "phy-J1-4", title: "Waves in Fluids", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-J1", title: "MIT 1.060: Fluid Mechanics", url: "https://ocw.mit.edu/courses/1-060-engineering-mechanics-ii-spring-2006/", provider: "MIT OCW" }
        ]
    },

    // --- K. PLASMA PHYSICS ---
    {
        id: "phy-K",
        title: "K. Plasma Physics",
        resource: { title: "Introduction to Plasma Physics (Chen)", url: "https://www.amazon.com/Introduction-Plasma-Physics-Controlled-Fusion/dp/3319223089", provider: "Textbook" },
        topics: [
            { id: "phy-K1-1", title: "Single Particle Motion", status: "todo" },
            { id: "phy-K1-2", title: "MHD (Magnetohydrodynamics)", status: "todo" },
            { id: "phy-K1-3", title: "Waves in Plasmas", status: "todo" },
            { id: "phy-K1-4", title: "Kinetic Theory (Vlasov Equation)", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-K1", title: "MIT 22.611J: Introduction to Plasma Physics I", url: "https://ocw.mit.edu/courses/22-611j-introduction-to-plasma-physics-i-fall-2003/", provider: "MIT OCW" }
        ]
    },

    // --- L. ASTROPHYSICS & COSMOLOGY ---
    {
        id: "phy-L",
        title: "L. Astrophysics & Cosmology",
        resource: { title: "An Introduction to Modern Astrophysics (Carroll & Ostlie)", url: "https://www.amazon.com/Introduction-Modern-Astrophysics-Bradley-Carroll/dp/1108422160", provider: "Textbook" },
        topics: [
            { id: "phy-L1-1", title: "Stellar Structure & Evolution", status: "todo" },
            { id: "phy-L1-2", title: "Galactic Dynamics", status: "todo" },
            { id: "phy-L2-1", title: "FLRW Metric & Friedmann Equations", status: "todo" },
            { id: "phy-L2-2", title: "CMB (Cosmic Microwave Background)", status: "todo" },
            { id: "phy-L2-3", title: "Inflation & Early Universe", status: "todo" },
            { id: "phy-L2-4", title: "Dark Matter & Dark Energy", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-L1", title: "MIT 8.286: The Early Universe", url: "https://ocw.mit.edu/courses/8-286-the-early-universe-fall-2013/", provider: "MIT OCW" },
            { id: "phy-mooc-L2", title: "Stanford: Cosmology (Susskind)", url: "https://theoreticalminimum.com/courses/cosmology/2013/winter", provider: "Theoretical Minimum" }
        ]
    },

    // --- M. APPLIED & MODERN CROSS FIELDS ---
    {
        id: "phy-M",
        title: "M. Applied & Modern Cross Fields",
        resource: { title: "Various Resources", url: "#", provider: "Multiple" },
        topics: [
            { id: "phy-M1-1", title: "Quantum Computing & Information", status: "todo" },
            { id: "phy-M1-2", title: "Biophysics", status: "todo" },
            { id: "phy-M1-3", title: "Medical Physics", status: "todo" },
            { id: "phy-M1-4", title: "Geophysics", status: "todo" },
            { id: "phy-M1-5", title: "Econophysics", status: "todo" }
        ],
        courses: [
            { id: "phy-mooc-M1", title: "MIT 8.370: Quantum Computation", url: "https://ocw.mit.edu/courses/8-370-quantum-computation-fall-2001/", provider: "MIT OCW" }
        ]
    }
];

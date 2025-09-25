const Assessment = require('../models/assessment.js');
const Problem = require('../models/problem.js');
const User = require('../models/user.js');

const seedAssessments = async () => {
    try {
        // Find an admin user to be the creator
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('No admin user found. Please create an admin user first.');
            return;
        }

        // Clear existing assessments
        await Assessment.deleteMany({});

        // MCQ Questions Data
        const mcqQuestions = {
            OS: [
                {
                    question: "What is the primary purpose of an operating system?",
                    options: ["To compile programs", "To manage computer hardware and software resources", "To create user interfaces", "To store data"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "Which scheduling algorithm gives the shortest average waiting time?",
                    options: ["FCFS", "SJF", "Round Robin", "Priority"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "What is a deadlock in operating systems?",
                    options: ["A process that runs forever", "A situation where processes wait indefinitely for resources", "A crashed program", "A memory leak"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "Which memory management technique divides memory into fixed-size blocks?",
                    options: ["Segmentation", "Paging", "Virtual Memory", "Cache Memory"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "What is the purpose of a system call?",
                    options: ["To call other programs", "To interface between user programs and OS", "To allocate memory", "To schedule processes"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "What is virtual memory?",
                    options: ["Physical RAM", "Extended memory using disk space", "Cache memory", "ROM"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "Which of the following is NOT a process state?",
                    options: ["Ready", "Running", "Waiting", "Compiled"],
                    correctAnswer: 3,
                    subject: "OS"
                },
                {
                    question: "What is thrashing in operating systems?",
                    options: ["CPU overheating", "Excessive paging activity", "Memory corruption", "Process termination"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: "Which algorithm is used to avoid deadlock?",
                    options: ["Banker's Algorithm", "Round Robin", "FCFS", "SJF"],
                    correctAnswer: 0,
                    subject: "OS"
                },
                {
                    question: "What is the difference between process and thread?",
                    options: ["No difference", "Process is lightweight, thread is heavyweight", "Thread shares memory space, process doesn't", "Process runs faster than thread"],
                    correctAnswer: 2,
                    subject: "OS"
                }
            ],
            Networks: [
                {
                    question: "Which layer of the OSI model is responsible for routing?",
                    options: ["Physical", "Data Link", "Network", "Transport"],
                    correctAnswer: 2,
                    subject: "Networks"
                },
                {
                    question: "What is the default port number for HTTP?",
                    options: ["21", "23", "80", "443"],
                    correctAnswer: 2,
                    subject: "Networks"
                },
                {
                    question: "Which protocol is used for secure web communication?",
                    options: ["HTTP", "HTTPS", "FTP", "SMTP"],
                    correctAnswer: 1,
                    subject: "Networks"
                },
                {
                    question: "What does TCP stand for?",
                    options: ["Transfer Control Protocol", "Transmission Control Protocol", "Transport Control Protocol", "Terminal Control Protocol"],
                    correctAnswer: 1,
                    subject: "Networks"
                },
                {
                    question: "Which device operates at the Network layer?",
                    options: ["Hub", "Switch", "Router", "Repeater"],
                    correctAnswer: 2,
                    subject: "Networks"
                },
                {
                    question: "Which protocol is connectionless?",
                    options: ["TCP", "UDP", "HTTP", "FTP"],
                    correctAnswer: 1,
                    subject: "Networks"
                },
                {
                    question: "What is the maximum size of an Ethernet frame?",
                    options: ["1024 bytes", "1500 bytes", "2048 bytes", "4096 bytes"],
                    correctAnswer: 1,
                    subject: "Networks"
                },
                {
                    question: "Which protocol is used for email transmission?",
                    options: ["HTTP", "FTP", "SMTP", "SNMP"],
                    correctAnswer: 2,
                    subject: "Networks"
                },
                {
                    question: "What does DNS stand for?",
                    options: ["Domain Name System", "Dynamic Network Service", "Data Network Security", "Digital Name Server"],
                    correctAnswer: 0,
                    subject: "Networks"
                },
                {
                    question: "Which IP address class has the range 192.0.0.0 to 223.255.255.255?",
                    options: ["Class A", "Class B", "Class C", "Class D"],
                    correctAnswer: 2,
                    subject: "Networks"
                }
            ],
            DBMS: [
                {
                    question: "What does ACID stand for in database transactions?",
                    options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Integrity, Durability", "Atomicity, Correctness, Isolation, Durability", "Accuracy, Correctness, Integrity, Durability"],
                    correctAnswer: 0,
                    subject: "DBMS"
                },
                {
                    question: "Which normal form eliminates transitive dependencies?",
                    options: ["1NF", "2NF", "3NF", "BCNF"],
                    correctAnswer: 2,
                    subject: "DBMS"
                },
                {
                    question: "What is a primary key?",
                    options: ["A key that can be null", "A unique identifier for a record", "A foreign key reference", "An index"],
                    correctAnswer: 1,
                    subject: "DBMS"
                },
                {
                    question: "Which SQL command is used to retrieve data?",
                    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
                    correctAnswer: 2,
                    subject: "DBMS"
                },
                {
                    question: "What is denormalization?",
                    options: ["Removing normal forms", "Adding redundancy to improve performance", "Deleting data", "Creating indexes"],
                    correctAnswer: 1,
                    subject: "DBMS"
                },
                {
                    question: "What is a foreign key?",
                    options: ["A primary key from another table", "A unique key", "An index", "A constraint"],
                    correctAnswer: 0,
                    subject: "DBMS"
                },
                {
                    question: "Which join returns all records from both tables?",
                    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
                    correctAnswer: 3,
                    subject: "DBMS"
                },
                {
                    question: "What is the purpose of indexing in databases?",
                    options: ["To store data", "To speed up data retrieval", "To normalize data", "To backup data"],
                    correctAnswer: 1,
                    subject: "DBMS"
                },
                {
                    question: "Which isolation level prevents dirty reads?",
                    options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
                    correctAnswer: 1,
                    subject: "DBMS"
                },
                {
                    question: "What is a view in SQL?",
                    options: ["A physical table", "A virtual table based on query results", "An index", "A stored procedure"],
                    correctAnswer: 1,
                    subject: "DBMS"
                }
            ],
            DSA: [
                {
                    question: "What is the time complexity of binary search?",
                    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
                    correctAnswer: 1,
                    subject: "DSA"
                },
                {
                    question: "Which data structure uses LIFO principle?",
                    options: ["Queue", "Stack", "Array", "Linked List"],
                    correctAnswer: 1,
                    subject: "DSA"
                },
                {
                    question: "What is the worst-case time complexity of quicksort?",
                    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
                    correctAnswer: 1,
                    subject: "DSA"
                },
                {
                    question: "Which traversal visits the root node first?",
                    options: ["Inorder", "Preorder", "Postorder", "Level order"],
                    correctAnswer: 1,
                    subject: "DSA"
                },
                {
                    question: "What is the space complexity of merge sort?",
                    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    correctAnswer: 2,
                    subject: "DSA"
                },
                {
                    question: "What is the height of a balanced binary tree with n nodes?",
                    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
                    correctAnswer: 1,
                    subject: "DSA"
                },
                {
                    question: "Which sorting algorithm is stable?",
                    options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
                    correctAnswer: 2,
                    subject: "DSA"
                },
                {
                    question: "What is the time complexity of inserting an element in a hash table?",
                    options: ["O(1) average", "O(n) average", "O(log n) average", "O(n²) average"],
                    correctAnswer: 0,
                    subject: "DSA"
                },
                {
                    question: "Which algorithm is used to find shortest path in a graph?",
                    options: ["DFS", "BFS", "Dijkstra's", "Kruskal's"],
                    correctAnswer: 2,
                    subject: "DSA"
                },
                {
                    question: "What is the maximum number of nodes in a binary tree of height h?",
                    options: ["2^h", "2^h - 1", "2^(h+1) - 1", "2^(h-1)"],
                    correctAnswer: 2,
                    subject: "DSA"
                }
            ]
        };

        // Create MCQ Assessment 1
        const mcq1Questions = [
            ...mcqQuestions.OS.slice(0, 5),
            ...mcqQuestions.Networks.slice(0, 5),
            ...mcqQuestions.DBMS.slice(0, 5),
            ...mcqQuestions.DSA.slice(0, 5)
        ];

        const mcqAssessment1 = await Assessment.create({
            title: "Technical MCQ Assessment 1",
            description: "Comprehensive technical assessment covering OS, Networks, DBMS, and DSA fundamentals",
            type: "mcq",
            category: "general",
            isPremium: false,
            duration: 30,
            totalQuestions: 20,
            difficulty: "medium",
            questions: mcq1Questions,
            createdBy: adminUser._id
        });

        // Create MCQ Assessment 2
        const mcq2Questions = [
            ...mcqQuestions.OS.slice(5, 10),
            ...mcqQuestions.Networks.slice(5, 10),
            ...mcqQuestions.DBMS.slice(5, 10),
            ...mcqQuestions.DSA.slice(5, 10)
        ];

        const mcqAssessment2 = await Assessment.create({
            title: "Technical MCQ Assessment 2",
            description: "Advanced technical assessment with challenging questions on core CS subjects",
            type: "mcq",
            category: "general",
            isPremium: false,
            duration: 30,
            totalQuestions: 20,
            difficulty: "hard",
            questions: mcq2Questions,
            createdBy: adminUser._id
        });

        // Get some problems for coding assessments
        const problems = await Problem.find({}).limit(20);
        
        if (problems.length < 4) {
            console.log('Not enough problems found for coding assessments. Please add more problems first.');
            return;
        }

        // Create General Coding Assessment 1
        const codingAssessment1 = await Assessment.create({
            title: "Coding Assessment 1",
            description: "Basic coding problems to test your programming skills",
            type: "coding",
            category: "general",
            isPremium: false,
            duration: 60,
            totalQuestions: 2,
            difficulty: "easy",
            questions: [
                { problemId: problems[0]._id },
                { problemId: problems[1]._id }
            ],
            createdBy: adminUser._id
        });

        // Create General Coding Assessment 2
        const codingAssessment2 = await Assessment.create({
            title: "Coding Assessment 2",
            description: "Intermediate coding problems for algorithm practice",
            type: "coding",
            category: "general",
            isPremium: false,
            duration: 90,
            totalQuestions: 2,
            difficulty: "medium",
            questions: [
                { problemId: problems[2]._id },
                { problemId: problems[3]._id }
            ],
            createdBy: adminUser._id
        });

        // Create Premium Company Assessments
        const companies = ['Google', 'Meta', 'Uber', 'Microsoft'];
        
        for (const company of companies) {
            // Assessment 1 for each company
            await Assessment.create({
                title: `${company} Coding Assessment 1`,
                description: `Technical coding assessment designed for ${company} interview preparation`,
                type: "coding",
                category: "company",
                company: company,
                isPremium: true,
                duration: 120,
                totalQuestions: 2,
                difficulty: "hard",
                questions: [
                    { problemId: problems[Math.floor(Math.random() * problems.length)]._id },
                    { problemId: problems[Math.floor(Math.random() * problems.length)]._id }
                ],
                createdBy: adminUser._id
            });

            // Assessment 2 for each company
            await Assessment.create({
                title: `${company} Coding Assessment 2`,
                description: `Advanced coding assessment with ${company}-style interview questions`,
                type: "coding",
                category: "company",
                company: company,
                isPremium: true,
                duration: 150,
                totalQuestions: 2,
                difficulty: "hard",
                questions: [
                    { problemId: problems[Math.floor(Math.random() * problems.length)]._id },
                    { problemId: problems[Math.floor(Math.random() * problems.length)]._id }
                ],
                createdBy: adminUser._id
            });

            // Create Premium MCQ Assessments for each company
            const companyMCQQuestions = [
                {
                    question: `What is ${company}'s primary programming language for backend services?`,
                    options: ["Java", "Python", "C++", "Go"],
                    correctAnswer: company === 'Google' ? 3 : company === 'Meta' ? 2 : company === 'Uber' ? 3 : 2,
                    subject: "DSA"
                },
                {
                    question: `Which data structure is most commonly used in ${company}'s search algorithms?`,
                    options: ["Array", "Hash Table", "Binary Tree", "Graph"],
                    correctAnswer: company === 'Google' ? 3 : 1,
                    subject: "DSA"
                },
                {
                    question: `What is the preferred database technology at ${company}?`,
                    options: ["MySQL", "PostgreSQL", "MongoDB", "Custom Solutions"],
                    correctAnswer: 3,
                    subject: "DBMS"
                },
                {
                    question: `Which design pattern is heavily used in ${company}'s microservices architecture?`,
                    options: ["Singleton", "Observer", "Factory", "Microkernel"],
                    correctAnswer: 1,
                    subject: "OS"
                },
                {
                    question: `What networking protocol does ${company} primarily use for internal communication?`,
                    options: ["HTTP", "gRPC", "REST", "GraphQL"],
                    correctAnswer: company === 'Google' ? 1 : company === 'Meta' ? 3 : 1,
                    subject: "Networks"
                },
                ...mcqQuestions.DSA.slice(0, 5),
                ...mcqQuestions.OS.slice(0, 5),
                ...mcqQuestions.Networks.slice(0, 5)
            ];

            await Assessment.create({
                title: `${company} Technical MCQ Assessment`,
                description: `Comprehensive MCQ assessment tailored for ${company} technical interviews`,
                type: "mcq",
                category: "company",
                company: company,
                isPremium: true,
                duration: 45,
                totalQuestions: 15,
                difficulty: "hard",
                questions: companyMCQQuestions,
                createdBy: adminUser._id
            });
        }

        console.log('Assessments seeded successfully!');
        console.log(`Created ${2} general MCQ assessments`);
        console.log(`Created ${2} general coding assessments`);
        console.log(`Created ${companies.length * 3} premium company assessments`);

    } catch (error) {
        console.error('Error seeding assessments:', error);
    }
};

module.exports = { seedAssessments };
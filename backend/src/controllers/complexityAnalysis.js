const { GoogleGenAI } = require("@google/genai");

const analyzeComplexity = async (req, res) => {
    try {
        const { code, language, problemTitle, problemDescription } = req.body;
        
        if (!code || !language) {
            return res.status(400).json({
                error: "Code and language are required"
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{
                role: "user",
                parts: [{
                    text: `Analyze the time and space complexity of the following ${language} code solution for the problem "${problemTitle}":

PROBLEM DESCRIPTION:
${problemDescription}

CODE:
${code}

Please provide a detailed analysis in the following format:

## Time Complexity
- **Overall**: O(?)
- **Explanation**: Detailed explanation of why this is the time complexity
- **Breakdown**: Step-by-step analysis of each part of the algorithm

## Space Complexity
- **Overall**: O(?)
- **Explanation**: Detailed explanation of the space usage
- **Breakdown**: Analysis of auxiliary space, recursion stack, data structures used

## Algorithm Analysis
- **Approach**: Brief description of the algorithmic approach used
- **Key Operations**: Main operations that contribute to complexity
- **Optimization Notes**: Any potential optimizations or alternative approaches

## Complexity Comparison
- **Best Case**: O(?)
- **Average Case**: O(?)
- **Worst Case**: O(?)

Please be precise with Big O notation and provide clear, educational explanations that help understand the complexity analysis.`
                }]
            }],
            config: {
                systemInstruction: `You are an expert computer science professor specializing in algorithm analysis and complexity theory. Your role is to provide accurate, detailed, and educational complexity analysis for coding solutions.

GUIDELINES:
1. Always use proper Big O notation
2. Provide clear, step-by-step explanations
3. Consider all cases (best, average, worst)
4. Explain the reasoning behind each complexity assessment
5. Be educational and help users understand the concepts
6. If the code has issues, mention them constructively
7. Focus on the dominant terms in complexity analysis
8. Consider both iterative and recursive aspects
9. Analyze space complexity including auxiliary space and call stack
10. Provide practical insights about the algorithm's efficiency

RESPONSE FORMAT:
- Use markdown formatting for clear structure
- Include specific Big O notations
- Provide detailed explanations for each complexity assessment
- Be concise but comprehensive
- Focus on educational value`
            }
        });

        res.status(200).json({
            analysis: response.text
        });

    } catch (err) {
        console.error('Complexity analysis error:', err);
        res.status(500).json({
            error: "Failed to analyze complexity. Please try again."
        });
    }
};

module.exports = { analyzeComplexity };
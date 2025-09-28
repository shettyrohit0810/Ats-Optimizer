import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key not found in environment variables');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow PDF and DOCX
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Define a custom interface that extends Express Request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Route to handle resume uploads and trigger analysis
router.post('/upload', upload.single('resume'), async (req: MulterRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const filePath = req.file.path;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const text = await extractText(fileBuffer, req.file.mimetype);
    
    if (!text) {
      throw new Error('Could not extract text from the resume.');
    }

    const analysis = await analyzeResumeWithOpenAI(text);
    
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      analysis: analysis,
    });

  } catch (error) {
    console.error('Error during resume processing:', error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// New route for comprehensive resume scan with job description
router.post('/scan', upload.single('resume'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    let resumeText = '';
    const jobDescription = req.body.jobDescription || '';

    if (!jobDescription) {
      res.status(400).json({ error: 'Job description is required' });
      return;
    }

    // Extract resume text from file or use provided text
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      resumeText = await extractText(fileBuffer, req.file.mimetype);
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      res.status(400).json({ error: 'Resume text or file is required' });
      return;
    }

    if (!resumeText) {
      res.status(400).json({ error: 'Could not extract text from resume' });
      return;
    }

    // Parse resume into structured JSON
    const resumeJson = await parseResumeToJson(resumeText);
    
    // Extract job description keywords and structure
    const jobDescriptionJson = await extractJobKeywords(jobDescription);
    
    // Perform resume-job comparison analysis
    const comparisonJson = await analyzeResumeJobMatch(resumeJson, jobDescriptionJson);
    
    // Perform comprehensive analysis
    const analysis = await performComprehensiveAnalysis(resumeText, jobDescription);
    
    res.status(200).json({
      message: 'Resume scan completed successfully',
      analysis: analysis,
      resumeJson: resumeJson,
      jobDescriptionJson: jobDescriptionJson,
      comparisonJson: comparisonJson
    });

  } catch (error) {
    console.error('Error during resume scan:', error);
    res.status(500).json({ error: 'Failed to scan resume' });
  }
});

// Helper function to extract text
async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdf = await import('pdf-parse');
    const data = await pdf.default(buffer);
    return data.text;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  return '';
}

// Function to analyze resume text with OpenAI
async function analyzeResumeWithOpenAI(text: string): Promise<any> {
  try {
    // Clean the text first to remove problematic characters
    const cleanedText = text
      .replace(/[\u0080-\uFFFF]/g, '') // Remove non-ASCII characters
      .replace(/[^\x20-\x7E\n]/g, '') // Keep only printable ASCII and newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[|─═]/g, '-') // Convert various line characters to simple dash
      .replace(/[•●]/g, '-') // Convert bullet points to dash
      .replace(/‾+/g, '') // Remove overline characters
      .replace(/_{3,}/g, '') // Remove multiple underscores
      .replace(/={3,}/g, '') // Remove multiple equals signs
      .replace(/#{3,}/g, '') // Remove multiple hash signs
      .replace(/\*{3,}/g, '') // Remove multiple asterisks
      .replace(/[<>]{3,}/g, '') // Remove multiple angle brackets
      .replace(/\.{3,}/g, '.') // Convert multiple periods to single period
      .replace(/\n{3,}/g, '\n\n') // Convert multiple newlines to double newline
      .trim();
    
    // First get the basic resume information
    const prompt = `Please analyze the following resume text and extract the information in JSON format with the following structure. 

    IMPORTANT RULES:
    1. Return ONLY valid JSON - no additional text before or after
    2. If a field is not found, use empty string "" or empty array []
    3. Handle special characters and formatting gracefully
    4. Do not modify text content - copy exact words as they appear
    5. If resume format is unclear, make best effort to extract available information
    
    {
        "contact_info": {
            "name": "",
            "phone": "",
            "email": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "personal_website": ""
        },
        "professional_summary": "",
        "skills": {
            "technical": {
                "languages": [],
                "frameworks_and_libraries": [],
                "databases": [],
                "cloud_technologies": [],
                "other_tools": []
            },
            "soft": []
        },
        "certifications": [
            {
                "name": "",
                "issuer": "",
                "date": ""
            }
        ],
        "projects": [
            {
                "name": "",
                "description": "",
                "technologies": [],
                "link": "",
                "highlights": [],
                "start_date": "",
                "end_date": "",
                "duration": ""
            }
        ],
        "experience": [
            {
                "title": "",
                "company": "",
                "location": "",
                "dates": "",
                "highlights": []
            }
        ],
        "education": [
            {
                "school": "",
                "degree": "",
                "location": "",
                "graduation_date": "",
                "gpa": "",
                "relevant_courses": []
            }
        ],
        "achievements": [],
        "languages": [],
        "interests": [],
        "honors": [],
        "extra_curricular": []
    }
    
    Resume text to analyze:
    ${cleanedText}`;

    const basicInfo = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a precise resume parser. Extract information EXACTLY as it appears and return ONLY valid JSON. Handle any formatting issues gracefully and always return valid JSON structure."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    // Get the response content
    const responseContent = basicInfo.choices[0].message.content;
    
    // Try to parse JSON, with better error handling
    let resumeData;
    try {
      resumeData = JSON.parse(responseContent || '{}');
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Response content:', responseContent?.substring(0, 500) + '...');
      // Return a basic structure if JSON parsing fails
      resumeData = {
        "contact_info": {"name": "", "phone": "", "email": "", "location": "", "linkedin": "", "github": "", "personal_website": ""},
        "professional_summary": "",
        "skills": {"technical": {"languages": [], "frameworks_and_libraries": [], "databases": [], "cloud_technologies": [], "other_tools": []}, "soft": []},
        "certifications": [],
        "projects": [],
        "experience": [],
        "education": [],
        "achievements": [],
        "languages": [],
        "interests": [],
        "honors": [],
        "extra_curricular": []
      };
    }

    // Analyze keywords - EXACT same as Streamlit
    const keywordAnalysis = await analyzeKeywords(cleanedText);
    if (keywordAnalysis) {
      resumeData.keyword_analysis = keywordAnalysis;
    }

    // Now analyze all bullet points
    const experienceHighlights = resumeData.experience?.flatMap((exp: any) => exp.highlights || []) || [];
    const projectHighlights = resumeData.projects?.flatMap((proj: any) => proj.highlights || []) || [];
    const allHighlights = [...experienceHighlights, ...projectHighlights];

    const sentenceAnalysisPromises = allHighlights
      .filter((sentence: string) => sentence && sentence.trim().length > 10)
      .map((sentence: string) => analyzeSentence(sentence));

    const sentenceAnalyses = await Promise.all(sentenceAnalysisPromises);

    resumeData.sentence_analysis = sentenceAnalyses.filter(analysis => analysis !== null);

    // Calculate comprehensive resume score
    const resumeScore = calculateResumeScore(resumeData, cleanedText);
    resumeData.resume_score = resumeScore;

    return resumeData;
  } catch (error) {
    console.error('Error analyzing resume with OpenAI:', error);
    // Return basic structure exactly like Streamlit - same as successful response but with empty data
    return {
      "contact_info": {"name": "", "phone": "", "email": "", "location": "", "linkedin": "", "github": "", "personal_website": ""},
      "professional_summary": "",
      "skills": {"technical": {"languages": [], "frameworks_and_libraries": [], "databases": [], "cloud_technologies": [], "other_tools": []}, "soft": []},
      "certifications": [],
      "projects": [],
      "experience": [],
      "education": [],
      "achievements": [],
      "languages": [],
      "interests": [],
      "honors": [],
      "extra_curricular": [],
      "sentence_analysis": [],
      "keyword_analysis": null,
      "resume_score": null
    };
  }
}

// Function to analyze keywords - EXACT logic from Streamlit code
async function analyzeKeywords(text: string): Promise<any> {
  try {
    const prompt = `Analyze the following resume text and extract keywords into these exact categories. 
        Only include keywords that actually appear in the text - do not infer or add keywords that aren't present.
        
        Also identify ineffective keywords that should be replaced.
        
        Return in this JSON format:
        {
            "skill_keywords": {
                "programming_languages": [],
                "frameworks_libraries": [],
                "databases": [],
                "cloud_technologies": [],
                "development_tools": []
            },
            "tool_keywords": {
                "development_environments": [],
                "project_management": [],
                "data_tools": [],
                "design_tools": [],
                "other_tools": []
            },
            "domain_keywords": {
                "frontend": [],
                "backend": [],
                "data_science": [],
                "cloud": [],
                "ai_ml": [],
                "devops": [],
                "other_domains": []
            },
            "power_verbs": [],
            "soft_skills": [],
            "ineffective_keywords": {
                "vague_buzzwords": [
                    {
                        "term": "term found in text",
                        "category": "Vague buzzword",
                        "context": "how it's used in the text",
                        "suggestion": "what to use instead"
                    }
                ],
                "weak_verbs": [
                    {
                        "term": "weak verb found in text",
                        "category": "Weak verb",
                        "context": "how it's used in the text",
                        "suggestion": "suggested strong verb replacement"
                    }
                ],
                "overused_verbs": [
                    {
                        "term": "overused verb in text",
                        "category": "Overused verb",
                        "context": "how it's used in the text",
                        "count": "number of times used",
                        "suggestions": ["alternative1", "alternative2", "alternative3"]
                    }
                ],
                "uncommon_acronyms": [],
                "empty_soft_skills": [],
                "outdated_tech": []
            },
            "keyword_stats": {
                "ineffective_score": "score out of 100 based on ineffective words found",
                "ineffective_count": "total number of ineffective keywords found",
                "total_keywords_analyzed": "total number of keywords analyzed",
                "technical_skills_count": "total technical skills found (languages + frameworks + databases + cloud + tools)",
                "soft_skills_count": "total soft skills found",
                "balance_feedback": "feedback on skill balance"
            }
        }

        Rules for keyword extraction:
        1. Extract EXACT keywords as they appear in text
        2. Include only relevant technical terms, tools, and skills
        3. For power verbs, only include those at the start of sentences/bullets
        4. Categorize each keyword into the most appropriate category
        5. Do not duplicate keywords across categories
        6. Only include soft skills if explicitly mentioned
        
        Rules for keyword scoring:
        1. Count total number of ineffective keywords found
        2. Count total number of keywords analyzed
        3. Calculate ineffective_score = max(0, 100 - (ineffective_count * 10))
        4. Count technical skills (from all technical categories combined)
        5. Count soft skills mentioned
        6. Provide balance feedback:
           - If technical_skills_count < 7: "Less technical skills mentioned"
           - If soft_skills_count < 1: "Less soft skills mentioned" 
           - If both conditions true: "Less technical skills and soft skills mentioned"
           - If both are sufficient: "Good skill balance"
        7. Score should reflect keyword quality (100 = perfect, 0 = very poor)

        Strong Action Verbs (These are GOOD, do NOT mark as ineffective):
        - Achieved, Accelerated, Automated, Built
        - Collaborated, Created, Decreased, Delivered
        - Managed, Optimized, Reduced, Resolved
        - Streamlined, Spearheaded, Transformed

        Rules for ineffective keyword identification:
        1. Vague buzzwords: Generic terms like "hardworking", "motivated", "team player"
        
        2. Weak verbs (NOT strong action verbs): ONLY flag these specific weak patterns:
           - "Worked on" (not "Worked" alone)
           - "Helped with"
           - "Assisted in" or "Assisted with"
           - "Participated in"
           - "Involved in"
           - "Responsible for"
           - "Did" (when used as main verb)
           - "Made" (when vague, not "Made improvements")
           - "Handled" (when vague)
           - "Used" (when standalone)
           
           CRITICAL: Do NOT flag common job titles or roles as weak verbs.
           - NO: "Intern", "Associate", "Engineer", "Developer", "Manager", "Analyst"
           - Only flag verbs used in action statements, not nouns in titles.
        
        3. Overused verbs: When the same strong verb appears multiple times:
           - Count occurrences of each verb
           - If a verb appears more than twice, mark it as overused
           - Provide 3 alternative strong verbs as suggestions
           Example:
           {
               "term": "Developed",
               "category": "Overused verb",
               "context": "Used 4 times in different bullets",
               "count": "4",
               "suggestions": ["Engineered", "Implemented", "Built"]
           }
        
        4. Uncommon acronyms: Abbreviations that aren't industry standard
        5. Empty soft skills: Soft skills without context like "good communication"
        6. Outdated tech: Technologies that are no longer relevant

        For each ineffective keyword:
        - Show exactly how it appears in the text
        - Categorize the type of issue
        - Provide specific replacement suggestions
        - Include the context it was used in

        IMPORTANT: 
        - NEVER flag strong action verbs (Created, Built, Developed, etc.) as weak verbs
        - If a strong verb appears multiple times, categorize it as "overused" not "weak"
        - Do NOT flag job titles or positions as weak verbs. This is critical.
        - For overused verbs, always provide 3 alternative strong verbs
        - Double-check the Strong Action Verbs list before marking anything as weak

        Resume text to analyze:
        ${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a precise resume keyword analyzer. Your primary goal is to identify ineffective language. You must follow all rules strictly. CRITICAL: Never flag job titles (like Intern, Associate, Manager) as weak verbs. Focus only on action words in sentences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error analyzing keywords:', error);
    return null;
  }
}

// Function to analyze individual sentences
async function analyzeSentence(sentence: string): Promise<any> {
  try {
    const prompt = `Analyze the following resume sentence based on these EXACT scoring rules:

    1. Action Verb (10 points):
       - Strong action verb at start (e.g., Developed, Led, Optimized): 10 points
       - Weak action verb (e.g., Worked, Used, Helped): 5 points
       - No action verb or starts with 'I': 0 points

    2. What Was Done (10 points):
       - Clear project/task description with specific details: 10 points
       - Basic description without specifics: 5 points
       - Vague or missing description: 0 points

    3. How It Was Done (10 points):
       - Mentions specific tools/technologies/methodologies: 10 points
       - General mention of methods without specifics: 5 points
       - No mention of how it was done: 0 points

    4. Impact/Result (10 points):
       - Quantified result with specific numbers/percentages: 10 points
       - Qualitative result without numbers: 5 points
       - No mention of impact/result: 0 points

    5. Conciseness (10 points):
       - One line, no filler words, clear and direct: 10 points
       - Slightly verbose but understandable: 5 points
       - Too long, unclear, or contains unnecessary words: 0 points

    Return the analysis in this exact JSON format:
    {
        "sentence": "exact sentence",
        "total_score": "sum of all component scores (0-50)",
        "components": {
            "action_verb": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "what": {
                "score": "score based on rules above", 
                "feedback": "specific feedback citing the rules above"
            },
            "how": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "impact": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "conciseness": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            }
        }
    }

    Sentence to analyze: ${sentence}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume expert that strictly follows the provided scoring rules. You must be consistent in applying these rules across all sentences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Only get improvement suggestion if score is <= 45
    if (result.total_score <= 45) {
      const improvementData = await getImprovementSuggestion(sentence, result.total_score, result.components);
      result.improvement_suggestion = improvementData.suggestion;
      result.mistakes = improvementData.mistakes;
    } else {
      result.improvement_suggestion = "";
      result.mistakes = [];
    }

    return result;
  } catch (error) {
    console.error('Error analyzing sentence:', error);
    return null;
  }
}

async function analyzeSentenceMistakes(sentence: string, components: any): Promise<any> {
    try {
        const prompt = `Analyze the following resume sentence and identify EXACTLY what is missing or incorrect based on these components:

        Original sentence: "${sentence}"

        Component scores and feedback:
        ${JSON.stringify(components, null, 2)}

        Return a JSON object listing missing or incorrect elements in the sentence:
        {
            "mistakes": [
                {
                    "type": "Action Verb",
                    "description": "Missing strong action verb at start",
                    "example": "Should start with verbs like: Developed, Led, Optimized"
                }
            ]
        }

        Rules for identifying missing elements:
        1. For Action Verb (if score < 10): Check for missing strong action verb, weak verbs, or personal pronouns.
        2. For What Was Done (if score < 10): Check for missing or vague project/task descriptions.
        3. For How It Was Done (if score < 10): Check for missing tools, technologies, or methodologies.
        4. For Impact/Result (if score < 10): Check for missing numerical metrics or specific achievements.
        5. For Structure/Format (if score < 10): Check for personal pronouns, wrong tense, verbosity, or non-professional language.

        Only include mistakes for components with scores less than 10 points. Be very specific about what is missing.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a resume expert focused on identifying exactly what is missing in resume sentences. Be specific and actionable about missing elements." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || '{"mistakes": []}');
    } catch (error) {
        console.error('Error analyzing sentence mistakes:', error);
        return { mistakes: [] };
    }
}

// Function to get improvement suggestions
async function getImprovementSuggestion(sentence: string, score: number, components: any): Promise<any> {
  if (score > 45) {
    return {
      suggestion: "",
      mistakes: []
    };
  }

  try {
    const mistakesAnalysis = await analyzeSentenceMistakes(sentence, components);

    const prompt = `Create a perfect-scoring resume bullet point based on this original sentence.

    Original sentence: "${sentence}"

    PERFECT SCORE REQUIREMENTS:
    1. Action Verb (10/10): MUST start with a strong action verb
    2. What Was Done (10/10): MUST include specific project/task
    3. How It Was Done (10/10): MUST include specific tools/technologies
    4. Impact/Result (10/10): MUST include numerical metrics
    5. Conciseness (10/10): MUST be one line, no personal pronouns, no periods

    Provide only the improved sentence, with no other text or quotation marks.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume expert focused on creating perfect-scoring bullet points. Every suggestion must meet ALL criteria for a 50/50 score."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    return {
      suggestion: response.choices[0].message.content?.trim().replace(/"/g, '') || "",
      mistakes: mistakesAnalysis.mistakes || []
    };
  } catch (error) {
    console.error('Error getting improvement suggestion:', error);
    return {
      suggestion: "",
      mistakes: []
    };
  }
}

// Function to calculate resume score - EXACT logic from Streamlit code
function calculateResumeScore(resumeData: any, originalText: string): any {
  try {
    // Detect industry first
    const industry = detectIndustry(resumeData, originalText);
    
    // Industry-specific max scores and weights
    let maxScores;
    if (industry === "finance") {
      maxScores = {
        keyword_match_score: 45,        // 45% weight (lower than software)
        formatting_score: 15,           // 15% weight  
        experience_alignment_score: 15, // 15% weight (higher than software)
        impact_metrics_score: 10,       // 10% weight (higher than software)
        education_score: 15             // 15% weight (much higher than software)
      };
    } else {  // software industry
      maxScores = {
        keyword_match_score: 55,        // 55% weight (higher than finance)
        formatting_score: 15,           // 15% weight  
        experience_alignment_score: 12, // 12% weight
        impact_metrics_score: 8,        // 8% weight
        education_score: 10             // 10% weight
      };
    }
    
    const scoreBreakdown = {
      keyword_match_score: 0,
      formatting_score: 0,
      experience_alignment_score: 0,
      impact_metrics_score: 0,
      education_score: 0
    };
    
    // 1. KEYWORD MATCH SCORE (Industry-specific)
    let keywordScore = 0;
    const keywordAnalysis = resumeData.keyword_analysis || {};
    const skills = resumeData.skills || {};
    const technical = skills.technical || {};
    const totalTechSkills = Object.values(technical).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
    
    if (industry === "finance") {
      // Finance: Lower tech emphasis, more on finance tools (25 points max)
      if (totalTechSkills >= 8) keywordScore += 25;
      else if (totalTechSkills >= 6) keywordScore += 20;
      else if (totalTechSkills >= 4) keywordScore += 15;
      else if (totalTechSkills >= 2) keywordScore += 10;
      else if (totalTechSkills >= 1) keywordScore += 5;
    } else {
      // Software: Higher tech emphasis (25 points max)
      if (totalTechSkills >= 15) keywordScore += 25;
      else if (totalTechSkills >= 10) keywordScore += 20;
      else if (totalTechSkills >= 7) keywordScore += 15;
      else if (totalTechSkills >= 5) keywordScore += 10;
      else if (totalTechSkills >= 3) keywordScore += 5;
    }
    
    // Job title relevance (15 points)
    const experience = resumeData.experience || [];
    let relevantTitles = 0;
    for (const exp of experience) {
      const title = (exp.title || '').toLowerCase();
      if (['engineer', 'developer', 'analyst', 'manager', 'specialist', 'lead', 'senior'].some(keyword => title.includes(keyword))) {
        relevantTitles += 1;
      }
    }
    
    if (relevantTitles >= 3) keywordScore += 15;
    else if (relevantTitles >= 2) keywordScore += 12;
    else if (relevantTitles >= 1) keywordScore += 8;
    
    // Keyword effectiveness from analysis (15 points)
    if (keywordAnalysis && keywordAnalysis.keyword_stats) {
      const kwEffectiveness = keywordAnalysis.keyword_stats.ineffective_score || 0;
      keywordScore += (kwEffectiveness / 100) * 15;
    }
    
    scoreBreakdown.keyword_match_score = Math.min(Math.round(keywordScore * 10) / 10, maxScores.keyword_match_score);
    
    // 2. FORMATTING & PARSEABILITY SCORE (10-20% weight = 15 points)
    let formatScore = 0;
    
    // ATS-readable structure (8 points)
    const contact = resumeData.contact_info || {};
    const requiredFields = ['name', 'email', 'phone'];
    const parsedFields = requiredFields.filter(field => contact[field] && contact[field].trim() !== '').length;
    const contactScore = (parsedFields / requiredFields.length) * 8;
    formatScore += contactScore;
    
    // Proper section headers and bullet points (4 points)
    const bulletChars = ['•', '●', '-', '*'];
    const hasBullets = bulletChars.some(char => originalText.toLowerCase().includes(char));
    if (hasBullets) {
      formatScore += 2;  // Uses bullet points
    }
    
    const lineCount = originalText.split('\n').length;
    const hasGoodStructure = lineCount > 15;
    if (hasGoodStructure) {
      formatScore += 2;  // Good structure
    }
    
    // Clean formatting (3 points) - Now with stricter education and experience checks
    const problematicChars = [
      '', // Invalid UTF-8 character
      '‾', // Overline
      '\t\t', // Multiple tabs
      '|||', // Multiple vertical bars
      '___', // Multiple underscores
      '===', // Multiple equals signs
      '```', // Code block markers
      '###', // Multiple hash signs
      '***', // Multiple asterisks
      '<<<', // Multiple angle brackets
      '>>>', // Multiple angle brackets
      '...', // Multiple periods
      '   ', // Multiple spaces
      '\n\n\n' // Multiple newlines
    ];
    
    // Clean and normalize text
    const normalizedText = originalText
      .replace(/[\u0080-\uFFFF]/g, '') // Remove non-ASCII characters
      .replace(/[^\x20-\x7E\n]/g, '') // Keep only printable ASCII and newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[|─═]/g, '-') // Convert various line characters to simple dash
      .replace(/[•●]/g, '-') // Convert bullet points to dash
      .replace(/‾+/g, '') // Remove overline characters
      .replace(/_{3,}/g, '') // Remove multiple underscores
      .replace(/={3,}/g, '') // Remove multiple equals signs
      .replace(/#{3,}/g, '') // Remove multiple hash signs
      .replace(/\*{3,}/g, '') // Remove multiple asterisks
      .replace(/[<>]{3,}/g, '') // Remove multiple angle brackets
      .replace(/\.{3,}/g, '.') // Convert multiple periods to single period
      .replace(/\n{3,}/g, '\n\n') // Convert multiple newlines to double newline
      .trim();
    
    // Check for problematic patterns
    const hasProblematicChars = problematicChars.some(char => normalizedText.includes(char));
    
    // Calculate format score based on text cleanliness
    let cleanFormatScore = 3; // Start with max score
    
    if (hasProblematicChars) {
      cleanFormatScore -= 1.5; // Increased deduction for problematic characters (was 1)
    }
    
    // Check for consistent formatting
    const lines = normalizedText.split('\n');
    let inconsistentFormatting = false;
    let educationFormatting = false;
    let experienceFormatting = false;
    
    // Stricter formatting checks for education and experience sections
    let inEducationSection = false;
    let inExperienceSection = false;
    
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim().toLowerCase();
      const previousLine = lines[i-1].trim().toLowerCase();
      
      // Detect sections
      if (currentLine.includes('education')) {
        inEducationSection = true;
        inExperienceSection = false;
      } else if (currentLine.includes('experience') || currentLine.includes('work history')) {
        inEducationSection = false;
        inExperienceSection = true;
      }
      
      // Check for inconsistent bullet points
      if ((currentLine.startsWith('-') && previousLine.startsWith('•')) ||
          (currentLine.startsWith('•') && previousLine.startsWith('-'))) {
        inconsistentFormatting = true;
      }
      
      // Check for inconsistent spacing
      if (Math.abs(currentLine.length - previousLine.length) > 100) {
        inconsistentFormatting = true;
      }
      
      // Stricter education formatting checks
      if (inEducationSection) {
        // Check for proper education entry structure
        if (currentLine.length > 0 && !currentLine.startsWith('-') && !currentLine.startsWith('•')) {
          const hasYear = /\b(19|20)\d{2}\b/.test(currentLine); // Check for year
          const hasSchool = /university|college|institute|school/i.test(currentLine);
          const hasDegree = /bachelor|master|phd|bs|ba|ms|ma|degree/i.test(currentLine);
          
          if (!hasYear && !hasSchool && !hasDegree) {
            educationFormatting = true;
          }
        }
      }
      
      // Stricter experience formatting checks
      if (inExperienceSection) {
        // Check for proper experience entry structure
        if (currentLine.length > 0 && !currentLine.startsWith('-') && !currentLine.startsWith('•')) {
          const hasYear = /\b(19|20)\d{2}\b/.test(currentLine); // Check for year
          const hasTitle = /engineer|developer|manager|analyst|specialist|coordinator/i.test(currentLine);
          const hasCompany = currentLine.length > 20; // Basic check for company name
          
          if (!hasYear && !hasTitle && !hasCompany) {
            experienceFormatting = true;
          }
        }
      }
    }
    
    if (inconsistentFormatting) {
      cleanFormatScore -= 1;
    }
    if (educationFormatting) {
      cleanFormatScore -= 0.5; // New deduction for poor education formatting
    }
    if (experienceFormatting) {
      cleanFormatScore -= 0.5; // New deduction for poor experience formatting
    }
    
    formatScore += Math.max(0, cleanFormatScore); // Ensure score doesn't go negative
    
    scoreBreakdown.formatting_score = Math.min(formatScore, maxScores.formatting_score);
    
    // 3. EXPERIENCE ALIGNMENT SCORE (10-15% weight = 12 points) - MORE LENIENT
    let expAlignmentScore = 0;
    
    // Years of experience inference (6 points) - More lenient thresholds
    if (experience.length >= 2) expAlignmentScore += 6;  // Senior level (reduced from 3)
    else if (experience.length >= 1) expAlignmentScore += 5;  // Mid level (increased from 4)
    else if (experience.length >= 0) expAlignmentScore += 3;  // Entry level (new, even with no experience)
    
    // Role complexity and seniority keywords (6 points) - More lenient and expanded keywords
    const seniorityKeywords = [
      'led', 'managed', 'architected', 'designed', 'spearheaded', 'established',
      'developed', 'created', 'built', 'implemented', 'improved', 'optimized',
      'collaborated', 'coordinated', 'assisted', 'contributed', 'worked'
    ];
    let complexityCount = 0;
    for (const exp of experience) {
      for (const highlight of exp.highlights || []) {
        if (seniorityKeywords.some(keyword => highlight.toLowerCase().includes(keyword))) {
          complexityCount += 1;
        }
      }
    }
    
    // More lenient thresholds for complexity scoring
    if (complexityCount >= 3) expAlignmentScore += 6;  // Reduced from 5
    else if (complexityCount >= 2) expAlignmentScore += 5;  // New tier
    else if (complexityCount >= 1) expAlignmentScore += 3;  // Increased from 2
    else expAlignmentScore += 1;  // Give some points even with no keywords
    
    scoreBreakdown.experience_alignment_score = Math.min(expAlignmentScore, maxScores.experience_alignment_score);
    
    // 4. IMPACT METRICS SCORE (5-10% weight = 8 points) - MORE LENIENT
    let impactScore = 0;
    
    // Count quantified results - Expanded patterns for more matches
    const metricsPatterns = [
      /\d+%/g,           // percentages
      /\$\d+/g,          // dollar amounts
      /\d+k\+?/g,        // thousands (10k, 5k+)
      /\d+x/g,           // multipliers (2x, 10x)
      /\d+\+/g,          // plus numbers (100+)
      /reduced.*\d+/g,   // reduced by X
      /increased.*\d+/g, // increased by X
      /improved.*\d+/g,  // improved by X
      /\d+\s*(users?|customers?|clients?)/g,  // user/customer counts
      /\d+\s*(hours?|days?|weeks?|months?)/g, // time savings
      /\d+\s*(projects?|features?|tasks?)/g,  // project counts
      /\d+\s*(years?|yr)/g,                   // experience duration
      /\b\d{2,}\b/g,                          // any 2+ digit numbers
    ];
    
    let metricsCount = 0;
    const fullText = originalText.toLowerCase();
    for (const pattern of metricsPatterns) {
      const matches = fullText.match(pattern);
      metricsCount += matches ? matches.length : 0;
    }
    
    // Much more lenient thresholds for impact scoring
    if (metricsCount >= 5) impactScore = 8;    // Reduced from 8
    else if (metricsCount >= 3) impactScore = 7;  // New tier
    else if (metricsCount >= 2) impactScore = 6;  // Reduced from 3
    else if (metricsCount >= 1) impactScore = 4;  // Increased from 2
    else impactScore = 2;  // Give some points even with no metrics
    
    scoreBreakdown.impact_metrics_score = impactScore;
    
    // 5. EDUCATION SCORE (Industry-specific weight) - MORE LENIENT
    const education = resumeData.education || [];
    let eduScore = 0;
    
    if (industry === "finance") {
      // Finance: Higher education emphasis (15 points max) - More lenient
      // Degree level and relevance (10 points)
      for (const edu of education) {
        const degree = (edu.degree || '').toLowerCase();
        // Finance-specific degrees get bonus
        if (['mba', 'finance', 'economics', 'business', 'accounting', 'mathematics', 'statistics'].some(field => degree.includes(field))) {
          eduScore += 10;
          break;
        } else if (['master', 'phd', 'doctorate', 'ms', 'ma'].some(level => degree.includes(level))) {
          eduScore += 9;  // Increased from 8
          break;
        } else if (['bachelor', 'bs', 'ba', 'be', 'degree'].some(level => degree.includes(level))) {
          eduScore += 7;  // Increased from 6
          break;
        } else if (['associate', 'diploma', 'certificate'].some(level => degree.includes(level))) {
          eduScore += 5;  // Increased from 3
          break;
        } else if (edu.degree && edu.degree.trim() !== '') {
          eduScore += 4;  // Give points for any education mentioned
        }
      }
      
      // Institution reputation and GPA (5 points) - More lenient
      for (const edu of education) {
        const school = (edu.school || '').toLowerCase();
        // Expanded list of good schools and more lenient scoring
        if (['harvard', 'wharton', 'stanford', 'mit', 'columbia', 'chicago', 'nyu', 'berkeley', 'yale', 'princeton'].some(schoolName => school.includes(schoolName))) {
          eduScore += 3;
        } else if (edu.school && edu.school.trim() !== '') {
          eduScore += 2;  // Give points for any school mentioned
        }
        if (edu.gpa) {
          const gpaText = String(edu.gpa);
          if (['3.5', '3.6', '3.7', '3.8', '3.9', '4.0'].some(gpa => gpaText.includes(gpa))) {
            eduScore += 2;  // Lowered threshold from 3.7
          } else {
            eduScore += 1;
          }
        }
        break;
      }
    } else {
      // Software: Standard education scoring (10 points max) - More lenient
      // Degree level and relevance (6 points)
      for (const edu of education) {
        const degree = (edu.degree || '').toLowerCase();
        if (['master', 'phd', 'doctorate', 'ms', 'ma', 'computer science', 'software engineering', 'engineering'].some(level => degree.includes(level))) {
          eduScore += 6;
          break;
        } else if (['bachelor', 'bs', 'ba', 'be', 'degree'].some(level => degree.includes(level))) {
          eduScore += 5;  // Increased from 4
          break;
        } else if (['associate', 'diploma', 'certificate', 'bootcamp'].some(level => degree.includes(level))) {
          eduScore += 3;  // Increased from 2
          break;
        } else if (edu.degree && edu.degree.trim() !== '') {
          eduScore += 2;  // Give points for any education mentioned
        }
      }
      
      // Institution and GPA (4 points) - More lenient
      for (const edu of education) {
        if (edu.school && edu.school.trim() !== '') eduScore += 2;
        if (edu.gpa) eduScore += 2;
        break;
      }
    }
    
    // Give minimum points even with no education
    if (eduScore === 0) {
      eduScore = industry === "finance" ? 3 : 2;  // Minimum education score
    }
    
    scoreBreakdown.education_score = Math.min(eduScore, maxScores.education_score);
    
    // Calculate final ATS score
    const finalResumeScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    
    // ATS Parsing Status (similar to real ATS systems)
    let atsStatus, recommendation;
    if (finalResumeScore >= 85) {
      atsStatus = "EXCELLENT - Top 10% of candidates";
      recommendation = "Likely to pass initial ATS screening for FAANG/top-tier positions";
    } else if (finalResumeScore >= 75) {
      atsStatus = "GOOD - Above average candidate";
      recommendation = "Strong chance of passing ATS screening for most tech positions";
    } else if (finalResumeScore >= 65) {
      atsStatus = "AVERAGE - Standard candidate pool";
      recommendation = "May pass ATS for some positions, needs optimization for competitive roles";
    } else if (finalResumeScore >= 50) {
      atsStatus = "BELOW AVERAGE - Needs improvement";
      recommendation = "Limited ATS compatibility, significant improvements needed";
    } else {
      atsStatus = "POOR - High rejection risk";
      recommendation = "Resume likely to be filtered out by ATS systems";
    }
    
    return {
      score: {
        total: Math.round(finalResumeScore * 10) / 10,
        max_possible: 100,
        grade: atsStatus.split(" - ")[0],
        percentile: atsStatus.split(" - ")[1] || ""
      },
      industry: {
        detected: industry,
        confidence: "high"
      },
      breakdown: scoreBreakdown,
      status: {
        ats_compatibility: atsStatus,
        recommendation: recommendation
      },
      insights: generateAtsInsights(scoreBreakdown, industry),
      methodology: {
        weights: {
          keyword_match: `${maxScores.keyword_match_score}%`,
          formatting: `${maxScores.formatting_score}%`, 
          experience_alignment: `${maxScores.experience_alignment_score}%`,
          impact_metrics: `${maxScores.impact_metrics_score}%`,
          education: `${maxScores.education_score}%`
        },
        focus: industry === "finance" ? "finance_credentials" : "technical_skills"
      }
    };
        
  } catch (error) {
    return {
      score: {
        total: 0,
        max_possible: 100,
        grade: "ERROR",
        percentile: ""
      },
      industry: {
        detected: "unknown",
        confidence: "low"
      },
      breakdown: {},
      status: {
        ats_compatibility: "ERROR - Unable to process",
        recommendation: `Error calculating ATS score: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      insights: [],
      methodology: {
        weights: {},
        focus: "unknown"
      }
    };
  }
}

// Generate ATS-specific insights based on top-tier company requirements
function generateAtsInsights(scoreBreakdown: any, industry: string = "software"): string[] {
  const insights = [];
  
  // Add industry detection insight
  insights.push(`Industry detected: ${industry.toUpperCase()} - Scoring adjusted accordingly`);
  
  // Keyword Match Analysis
  const keywordScore = scoreBreakdown.keyword_match_score || 0;
  if (keywordScore < 40) {
    insights.push("CRITICAL: Low keyword match - Resume may be filtered out immediately");
    insights.push("Add more technical skills relevant to your target role");
    insights.push("Include industry-specific terms and technologies");
  } else if (keywordScore < 50) {
    insights.push("MODERATE: Keyword density needs improvement for competitive roles");
    insights.push("Research job descriptions and include missing technical keywords");
  } else {
    insights.push("STRONG: Good keyword optimization for ATS systems");
  }
  
  // Formatting Analysis  
  const formatScore = scoreBreakdown.formatting_score || 0;
  if (formatScore < 10) {
    insights.push("CRITICAL: Poor ATS parseability - Information may be lost");
    insights.push("Use standard section headers (Experience, Education, Skills)");
    insights.push("Ensure contact information is clearly formatted");
  } else if (formatScore < 13) {
    insights.push("MODERATE: Some formatting issues may affect parsing");
    insights.push("Use consistent bullet points and avoid complex layouts");
  } else {
    insights.push("STRONG: Resume is well-formatted for ATS parsing");
  }
  
  // Experience Alignment
  const expScore = scoreBreakdown.experience_alignment_score || 0;
  if (expScore < 8) {
    insights.push("CRITICAL: Experience doesn't demonstrate required seniority level");
    insights.push("Highlight leadership and complex project involvement");
    insights.push("Use senior-level action verbs (Led, Architected, Spearheaded)");
  } else if (expScore < 10) {
    insights.push("MODERATE: Experience could better demonstrate role complexity");
  } else {
    insights.push("STRONG: Experience aligns well with target role level");
  }
  
  // Impact Metrics
  const impactScore = scoreBreakdown.impact_metrics_score || 0;
  if (impactScore < 4) {
    insights.push("CRITICAL: Lacks quantified achievements - Major red flag for top companies");
    insights.push("Add specific numbers: percentages, dollar amounts, user counts");
    insights.push("Quantify improvements: 'reduced by 40%', 'increased by 25%'");
  } else if (impactScore < 6) {
    insights.push("MODERATE: Need more quantified results for competitive positions");
    insights.push("Every bullet point should ideally include a metric");
  } else {
    insights.push("STRONG: Good use of quantified achievements");
  }
  
  // Education Analysis
  const eduScore = scoreBreakdown.education_score || 0;
  if (eduScore < 6) {
    insights.push("MODERATE: Education section could be strengthened");
    insights.push("Include relevant coursework or academic projects");
  } else {
    insights.push("STRONG: Education credentials are well-presented");
  }
  
  // Overall ATS Compatibility
  const totalScore = Object.values(scoreBreakdown).reduce((sum: number, score: any) => sum + score, 0);
  if (totalScore >= 85) {
    insights.push("EXCELLENT: Resume optimized for top-tier ATS systems (FAANG-ready)");
  } else if (totalScore >= 75) {
    insights.push("GOOD: Strong ATS compatibility for most tech companies");
  } else if (totalScore >= 65) {
    insights.push("AVERAGE: Meets basic ATS requirements, room for optimization");
  } else {
    insights.push("NEEDS WORK: Significant ATS optimization required");
  }
  
  return insights;
}

// Function to detect industry
function detectIndustry(resumeData: any, originalText: string): string {
  const textLower = originalText.toLowerCase();
  
  const financeKeywords = [
    'analyst', 'investment', 'banking', 'finance', 'accounting', 'audit', 'risk', 'compliance',
    'portfolio', 'trader', 'financial', 'credit', 'equity', 'derivatives', 'hedge fund',
    'bloomberg', 'excel', 'vba', 'sql', 'tableau', 'powerbi', 'sas', 'stata',
    'goldman sachs', 'morgan stanley', 'jp morgan', 'blackrock', 'citadel'
  ];
  
  const softwareKeywords = [
    'developer', 'engineer', 'programmer', 'architect', 'devops', 'sre', 'full stack',
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring',
    'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'terraform', 'jenkins'
  ];
  
  const financeScore = financeKeywords.filter(keyword => textLower.includes(keyword)).length;
  const softwareScore = softwareKeywords.filter(keyword => textLower.includes(keyword)).length;
  
  if (financeScore > softwareScore && financeScore >= 3) {
    return "finance";
  } else if (softwareScore > financeScore && softwareScore >= 3) {
    return "software";
  } else {
    return "software"; // Default to software
  }
}

// Comprehensive analysis function that mirrors Streamlit logic
async function performComprehensiveAnalysis(resumeText: string, jobDescription: string): Promise<any> {
  try {
    // Clean the text
    const cleanedText = resumeText
      .replace(/[\u0080-\uFFFF]/g, '')
      .replace(/[^\x20-\x7E\n]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into sentences for analysis
    const sentences = cleanedText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Only analyze substantial sentences

    // Analyze each sentence
    const sentenceAnalyses = [];
    for (const sentence of sentences.slice(0, 20)) { // Limit to first 20 sentences
      const analysis = await analyzeSentenceDetailed(sentence);
      if (analysis) {
        sentenceAnalyses.push(analysis);
      }
    }

    // Analyze keywords
    const keywordAnalysis = await analyzeKeywordsDetailed(cleanedText);

    // Calculate overall scores
    const averageScore = sentenceAnalyses.length > 0 
      ? sentenceAnalyses.reduce((sum, s) => sum + (s.total_score || 0), 0) / sentenceAnalyses.length 
      : 0;

    return {
      resume_text: cleanedText,
      job_description: jobDescription,
      sentence_analyses: sentenceAnalyses,
      keyword_analysis: keywordAnalysis,
      overall_score: Math.round(averageScore),
      total_sentences_analyzed: sentenceAnalyses.length,
      analysis_timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
    throw error;
  }
}

// Enhanced sentence analysis that mirrors Streamlit logic
async function analyzeSentenceDetailed(sentence: string): Promise<any> {
  try {
    const prompt = `Analyze the following resume sentence based on these EXACT scoring rules:

    1. Action Verb (10 points):
       - Strong action verb at start (e.g., Developed, Led, Optimized): 10 points
       - Weak action verb (e.g., Worked, Used, Helped): 5 points
       - No action verb or starts with 'I': 0 points

    2. What Was Done (10 points):
       - Clear project/task description with specific details: 10 points
       - Basic description without specifics: 5 points
       - Vague or missing description: 0 points

    3. How It Was Done (10 points):
       - Mentions specific tools/technologies/methodologies: 10 points
       - General mention of methods without specifics: 5 points
       - No mention of how it was done: 0 points

    4. Impact/Result (10 points):
       - Quantified result with specific numbers/percentages: 10 points
       - Qualitative result without numbers: 5 points
       - No mention of impact/result: 0 points

    5. Conciseness (10 points):
       - One line, no filler words, clear and direct: 10 points
       - Slightly verbose but understandable: 5 points
       - Too long, unclear, or contains unnecessary words: 0 points

    Return the analysis in this exact JSON format:
    {
        "sentence": "exact sentence",
        "total_score": "sum of all component scores (0-50)",
        "components": {
            "action_verb": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "what": {
                "score": "score based on rules above", 
                "feedback": "specific feedback citing the rules above"
            },
            "how": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "impact": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            },
            "conciseness": {
                "score": "score based on rules above",
                "feedback": "specific feedback citing the rules above"
            }
        }
    }

    Sentence to analyze: "${sentence}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are a resume expert that strictly follows the provided scoring rules. You must be consistent in applying these rules across all sentences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    // Get improvement suggestion if score is <= 45
    if (result.total_score <= 45) {
      const improvement = await getImprovementSuggestionDetailed(sentence, result.total_score, result.components);
      result.improvement_suggestion = improvement.suggestion;
      result.mistakes = improvement.mistakes;
    } else {
      result.improvement_suggestion = "";
      result.mistakes = [];
    }

    return result;

  } catch (error) {
    console.error('Error analyzing sentence:', error);
    return null;
  }
}

// Enhanced keyword analysis that mirrors Streamlit logic
async function analyzeKeywordsDetailed(text: string): Promise<any> {
  try {
    const prompt = `Analyze the following resume text and extract keywords into these exact categories. 
    Only include keywords that actually appear in the text - do not infer or add keywords that aren't present.
    
    Also identify ineffective keywords that should be replaced.
    
    Return in this JSON format:
    {
        "skill_keywords": {
            "programming_languages": [],
            "frameworks_libraries": [],
            "databases": [],
            "cloud_technologies": [],
            "development_tools": []
        },
        "tool_keywords": {
            "development_environments": [],
            "project_management": [],
            "data_tools": [],
            "design_tools": [],
            "other_tools": []
        },
        "domain_keywords": {
            "frontend": [],
            "backend": [],
            "data_science": [],
            "cloud": [],
            "ai_ml": [],
            "devops": [],
            "other_domains": []
        },
        "power_verbs": [],
        "soft_skills": [],
        "ineffective_keywords": {
            "vague_buzzwords": [],
            "weak_verbs": [],
            "overused_verbs": [],
            "uncommon_acronyms": [],
            "empty_soft_skills": [],
            "outdated_tech": []
        },
        "keyword_stats": {
            "ineffective_score": "score out of 100",
            "ineffective_count": "total number of ineffective keywords",
            "total_keywords_analyzed": "total keywords analyzed",
            "technical_skills_count": "total technical skills",
            "soft_skills_count": "total soft skills",
            "balance_feedback": "feedback on skill balance"
        }
    }

    Rules:
    1. Extract EXACT keywords as they appear in text
    2. For ineffective_score: max(0, 100 - (ineffective_count * 10))
    3. Balance feedback:
       - If technical_skills_count < 7: "Less technical skills mentioned"
       - If soft_skills_count < 1: "Less soft skills mentioned"
       - If both: "Less technical skills and soft skills mentioned"
       - Otherwise: "Good skill balance"

    Resume text: ${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume keyword analyzer focused on technical and professional terms. Extract only keywords that actually appear in the text."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content!);

  } catch (error) {
    console.error('Error analyzing keywords:', error);
    return null;
  }
}

// Enhanced improvement suggestion function
async function getImprovementSuggestionDetailed(sentence: string, score: number, components: any): Promise<any> {
  if (score > 45) {
    return { suggestion: "", mistakes: [] };
  }

  try {
    // First analyze mistakes
    const mistakesAnalysis = await analyzeSentenceMistakesDetailed(sentence, components);
    
    // Then get improvement suggestion
    const prompt = `Create a perfect-scoring resume bullet point based on this original sentence.

    Original sentence: "${sentence}"
    Current score: ${score}/50

    PERFECT SCORE REQUIREMENTS (50/50):
    1. Strong action verb from: Achieved, Accelerated, Automated, Built, Collaborated, Created, Decreased, Delivered, Designed, Developed, Engineered, Established, Generated, Implemented, Improved, Increased, Innovated, Led, Optimized, Reduced, Resolved, Spearheaded, Streamlined, Transformed
    2. Clear specific project/task description
    3. Specific tools/technologies mentioned  
    4. Quantified results with numbers/percentages
    5. Concise, no personal pronouns, past tense

    Formula: [Strong Action Verb] + [Specific What] + [Clear How] + [Quantified Result]

    Example: "Developed scalable payment API using Node.js and MongoDB, reducing transaction processing time by 65%"

    Create a perfect-scoring version:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume expert focused on creating perfect-scoring bullet points that meet ALL criteria for a 50/50 score."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    return {
      suggestion: response.choices[0].message.content!.trim().replace(/^"|"$/g, ''),
      mistakes: mistakesAnalysis.mistakes || []
    };

  } catch (error) {
    console.error('Error getting improvement suggestion:', error);
    return { suggestion: "", mistakes: [] };
  }
}

// Analyze specific mistakes in sentences
async function analyzeSentenceMistakesDetailed(sentence: string, components: any): Promise<any> {
  try {
    const prompt = `Analyze the following resume sentence and identify EXACTLY what is missing or incorrect:

    Original sentence: "${sentence}"
    Component scores: ${JSON.stringify(components, null, 2)}

    Return a JSON object listing missing elements:
    {
        "mistakes": [
            {
                "type": "Action Verb",
                "description": "Missing strong action verb at start",
                "example": "Should start with verbs like: Developed, Led, Optimized"
            }
        ]
    }

    Only include mistakes for components with scores less than 10 points.
    Be specific about what is missing.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume expert focused on identifying exactly what is missing in resume sentences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content!);

  } catch (error) {
    console.error('Error analyzing sentence mistakes:', error);
    return { mistakes: [] };
  }
}

// Comprehensive ATS-style resume-job matching analysis
async function analyzeResumeJobMatch(resumeData: any, jobData: any): Promise<any> {
  try {
    const prompt = `Perform comprehensive ATS-style resume-job matching analysis between these two JSONs.

    RESUME DATA:
    ${JSON.stringify(resumeData, null, 2)}

    JOB REQUIREMENTS:
    ${JSON.stringify(jobData, null, 2)}

    Return detailed comparison analysis in this exact JSON format:
    {
        "ats_match_analysis": {
            "overall_score": 0,
            "grade": "",
            "match_percentage": 0,
            "recommendation": ""
        },
        "scoring_breakdown": {
            "technical_skills": {"score": 0, "max_points": 45, "weight": "45%", "analysis": ""},
            "soft_skills": {"score": 0, "max_points": 10, "weight": "10%", "analysis": ""},
            "experience_match": {"score": 0, "max_points": 15, "weight": "15%", "analysis": ""},
            "education_fit": {"score": 0, "max_points": 10, "weight": "10%", "analysis": ""},
            "project_relevance": {"score": 0, "max_points": 10, "weight": "10%", "analysis": ""},
            "keyword_coverage": {"score": 0, "max_points": 5, "weight": "5%", "analysis": ""},
            "job_title_alignment": {"score": 0, "max_points": 3, "weight": "3%", "analysis": ""},
            "formatting_compliance": {"score": 0, "max_points": 2, "weight": "2%", "analysis": ""}
        },
        "detailed_analysis": {
            "technical_skills_analysis": {
                "exact_matches": [],
                "partial_matches": [],
                "missing_required": [],
                "missing_preferred": [],
                "coverage_percentage": 0,
                "strength_areas": [],
                "weakness_areas": []
            },
            "soft_skills_analysis": {
                "matched_skills": [],
                "missing_required": [],
                "missing_preferred": [],
                "coverage_percentage": 0
            },
            "experience_analysis": {
                "years_match": false,
                "seniority_match": false,
                "domain_experience_match": [],
                "missing_experience_areas": [],
                "experience_level_assessment": ""
            },
            "education_analysis": {
                "degree_level_match": false,
                "field_relevance": 0,
                "certification_matches": [],
                "missing_certifications": [],
                "education_score": 0
            },
            "project_analysis": {
                "relevant_projects": [],
                "technology_overlap": [],
                "project_impact_assessment": "",
                "missing_project_types": []
            },
            "keyword_analysis": {
                "keyword_density": 0,
                "matched_industry_terms": [],
                "missing_critical_keywords": [],
                "keyword_optimization_score": 0
            }
        },
        "missing_requirements": {
            "critical_missing_skills": [],
            "preferred_missing_skills": [],
            "missing_certifications": [],
            "missing_experience_areas": [],
            "missing_keywords": [],
            "missing_soft_skills": []
        },
        "actionable_recommendations": {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": [],
            "resume_optimization_tips": [],
            "keyword_suggestions": []
        },
        "candidate_strengths": [],
        "potential_red_flags": [],
        "ats_compatibility": {
            "parseability_score": 0,
            "keyword_density": 0,
            "section_completeness": 0,
            "format_compliance": "",
            "ats_friendly_score": 0
        },
        "interview_readiness": {
            "technical_interview_score": 0,
            "behavioral_interview_score": 0,
            "domain_knowledge_score": 0,
            "overall_readiness": ""
        },
        "salary_competitiveness": {
            "experience_level_match": "",
            "skill_premium_factors": [],
            "market_competitiveness": ""
        }
    }

    ANALYSIS REQUIREMENTS:
    1. Score each category based on exact skill/keyword matches
    2. Calculate overall score as weighted sum of all categories
    3. Provide specific missing skills/requirements with exact names
    4. Give actionable recommendations prioritized by impact
    5. Identify candidate strengths and potential concerns
    6. Assess ATS compatibility and parseability
    7. Evaluate interview readiness across different areas
    8. Determine salary competitiveness based on skills/experience

    SCORING GUIDELINES:
    - Overall Score: 0-100 (90+ Excellent, 80-89 Very Good, 70-79 Good, 60-69 Fair, <60 Poor)
    - Technical Skills: Weight 45% - exact matches get full points, partial matches get 50%, missing required skills lose points
    - Experience: Weight 15% - years match, seniority level, domain relevance
    - Education: Weight 10% - degree level, field relevance, certifications
    - Projects: Weight 10% - technology overlap, relevance, impact
    - Soft Skills: Weight 10% - matched vs required soft skills
    - Keywords: Weight 5% - industry terms, technical jargon coverage
    - Title Alignment: Weight 3% - job title similarity and career progression
    - Formatting: Weight 2% - ATS parseability, section organization

    SPECIFIC RECOMMENDATION GUIDELINES:

    🧠 SOFT SKILL RECOMMENDATIONS:
    Instead of generic "Add soft skills", suggest SPECIFIC ones from this list:
    • Communication (verbal, written, presentation skills)
    • Problem Solving (analytical thinking, troubleshooting)
    • Teamwork (collaboration, cross-functional coordination)
    • Leadership (mentoring, project management, initiative)
    • Adaptability (learning agility, change management)
    • Time Management (prioritization, deadline management)
    • Critical Thinking (data analysis, decision making)
    • Customer Focus (client relations, user experience)
    • Innovation (creative thinking, process improvement)
    • Attention to Detail (quality assurance, accuracy)

    🧪 PROJECT ACTION RECOMMENDATIONS:
    For missing technical skills or weak project portfolio, suggest ONE of these SPECIFIC project types:
    • Real-time AI System: "Build a real-time AI chat application with WebSocket integration and streaming responses"
    • Multimodal Interaction: "Create an audio+text chatbot that processes voice input and responds with both speech and text"
    • Desktop AI Tool: "Develop a desktop AI assistant application using Electron with local LLM integration"
    • AI Data Pipeline: "Build an AI-powered data processing pipeline with automated model training and deployment"
    • Computer Vision Project: "Create an AI image recognition system with real-time object detection capabilities"
    • NLP Application: "Develop a text analysis tool with sentiment analysis, summarization, and keyword extraction"

    🎯 ACTIONABLE FORMAT:
    - High Priority: "Add [SPECIFIC SKILL] to your resume by highlighting it in [SPECIFIC SECTION]"
    - Medium Priority: "Strengthen [AREA] by adding [SPECIFIC TECHNOLOGY/SKILL] to your [PROJECT/EXPERIENCE] section"
    - Low Priority: "Consider learning [SPECIFIC TOOL] to enhance your [DOMAIN] capabilities"
    - Project Suggestions: Be specific about WHAT to build, WHICH technologies to use, and HOW it addresses the missing requirements

    BE SPECIFIC: List exact skill names, technologies, missing requirements, and provide detailed actionable recommendations with specific examples.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS system and resume-job matching analyst. Provide detailed, specific analysis with exact skill names and actionable recommendations. Return valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content!);

  } catch (error) {
    console.error('Error analyzing resume-job match:', error);
    return {
      ats_match_analysis: { overall_score: 0, grade: "Analysis Failed", match_percentage: 0, recommendation: "Unable to analyze - please try again" },
      scoring_breakdown: {},
      detailed_analysis: {},
      missing_requirements: {},
      actionable_recommendations: { high_priority: [], medium_priority: [], low_priority: [] },
      candidate_strengths: [],
      potential_red_flags: ["Analysis failed - unable to process"],
      ats_compatibility: { parseability_score: 0, keyword_density: 0, section_completeness: 0, format_compliance: "Unknown" },
      interview_readiness: { overall_readiness: "Unknown" },
      salary_competitiveness: { market_competitiveness: "Unknown" }
    };
  }
}

// Extract comprehensive job requirements for resume matching
async function extractJobKeywords(jobDescription: string): Promise<any> {
  try {
    const prompt = `Analyze the following job description and extract ALL important information for ATS resume matching.

    Return the analysis in this exact JSON format with proper syntax:
    {
        "job_id": null,
        "job_summary": {
            "overview": "",
            "objectives": [],
            "impact_goals": []
        },
        "job_posting_url": null,
        "job_title": {
            "primary_title": "",
            "alternative_titles": [],
            "seniority_level": "",
            "seniority_match_required": true
        },
        "required_skills": {
            "programming_languages": [],
            "frameworks_libraries": [],
            "databases": [],
            "cloud_technologies": [],
            "tools_software": [],
            "operating_systems": [],
            "methodologies": [],
            "apis": [],
            "version_control": []
        },
        "preferred_skills": {
            "programming_languages": [],
            "frameworks_libraries": [],
            "databases": [],
            "cloud_technologies": [],
            "tools_software": [],
            "operating_systems": [],
            "methodologies": [],
            "apis": [],
            "version_control": []
        },
        "experience_requirements": {
            "years_required": null,
            "years_preferred": null,
            "experience_level": "",
            "specific_experience": [],
            "internship_experience": false,
            "overqualification_acceptable": true
        },
        "education_requirements": {
            "degree_level": "Any",
            "degree_fields": [],
            "preferred_schools": [],
            "certifications_required": [],
            "certifications_preferred": []
        },
        "soft_skills": {
            "required": [],
            "preferred": []
        },
        "responsibilities": [],
        "industry_keywords": [],
        "company_info": {
            "company_size": "",
            "industry": "",
            "work_environment": [],
            "culture_keywords": []
        },
        "job_details": {
            "employment_type": "",
            "location": "",
            "remote_policy": "",
            "visa_sponsorship": null,
            "salary_range": "",
            "duration_months": null,
            "start_date": "TBD"
        },
        "metadata": {
            "scoring_weights": {
                "technical_skills": 30,
                "experience_match": 25,
                "education_fit": 15,
                "soft_skills": 15,
                "project_relevance": 15
            },
            "extraction_date": "${new Date().toISOString()}",
            "job_posting_source": "Manual Input",
            "ats_compliance_required": true,
            "formatting_requirements": {
                "pdf_preferred": true,
                "max_pages": 2,
                "font_requirements": ["Arial", "Calibri", "Times New Roman"],
                "section_requirements": ["Contact Info", "Experience", "Education", "Skills"]
            }
        }
    }

    Extraction Rules:
    1. Extract EXACT technical terms as they appear in the job description
    2. Categorize skills into required vs preferred based on language used (must, required, need vs nice to have, preferred, plus)
    3. Identify seniority level from title and experience requirements
    4. Look for specific years of experience mentioned
    5. Extract soft skills and responsibilities
    6. Identify company culture and work environment keywords
    7. Parse job details like location, remote policy, employment type
    8. If salary range is mentioned, extract it
    9. Look for visa sponsorship information
    10. Identify industry-specific keywords and jargon
    11. Extract certification requirements
    12. Parse education requirements (degree level, fields)
    13. Identify API experience, methodologies (Agile, Scrum, etc.)
    14. Extract version control systems mentioned
    15. Look for specific project types or domains mentioned

    Job Description:
    ${jobDescription}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at comprehensive job description analysis for ATS systems. Extract all relevant information for resume matching and return valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content!);

  } catch (error) {
    console.error('Error extracting job keywords:', error);
    return {
      job_id: null,
      job_summary: { overview: "", objectives: [], impact_goals: [] },
      job_posting_url: null,
      job_title: { primary_title: "", alternative_titles: [], seniority_level: "", seniority_match_required: true },
      required_skills: { programming_languages: [], frameworks_libraries: [], databases: [], cloud_technologies: [], tools_software: [], operating_systems: [], methodologies: [], apis: [], version_control: [] },
      preferred_skills: { programming_languages: [], frameworks_libraries: [], databases: [], cloud_technologies: [], tools_software: [], operating_systems: [], methodologies: [], apis: [], version_control: [] },
      experience_requirements: { years_required: null, years_preferred: null, experience_level: "", specific_experience: [], internship_experience: false, overqualification_acceptable: true },
      education_requirements: { degree_level: "Any", degree_fields: [], preferred_schools: [], certifications_required: [], certifications_preferred: [] },
      soft_skills: { required: [], preferred: [] },
      responsibilities: [],
      industry_keywords: [],
      company_info: { company_size: "", industry: "", work_environment: [], culture_keywords: [] },
      job_details: { employment_type: "", location: "", remote_policy: "", visa_sponsorship: null, salary_range: "", duration_months: null, start_date: "TBD" },
      metadata: { scoring_weights: { technical_skills: 30, experience_match: 25, education_fit: 15, soft_skills: 15, project_relevance: 15 }, extraction_date: new Date().toISOString(), job_posting_source: "Manual Input", ats_compliance_required: true, formatting_requirements: { pdf_preferred: true, max_pages: 2, font_requirements: ["Arial", "Calibri", "Times New Roman"], section_requirements: ["Contact Info", "Experience", "Education", "Skills"] } }
    };
  }
}

// Parse resume text into structured JSON format
async function parseResumeToJson(text: string): Promise<any> {
  try {
    // Clean the text first
    const cleanedText = text
      .replace(/[\u0080-\uFFFF]/g, '')
      .replace(/[^\x20-\x7E\n]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[|─═]/g, '-')
      .replace(/[•●]/g, '-')
      .replace(/‾+/g, '')
      .replace(/_{3,}/g, '')
      .replace(/={3,}/g, '')
      .replace(/#{3,}/g, '')
      .replace(/\*{3,}/g, '')
      .replace(/[<>]{3,}/g, '')
      .replace(/\.{3,}/g, '.')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const prompt = `Please analyze the following resume text and extract the information in JSON format with the following structure. 

    IMPORTANT RULES:
    1. Return ONLY valid JSON - no additional text before or after
    2. If a field is not found, use empty string "" or empty array []
    3. Handle special characters and formatting gracefully
    4. Do not modify text content - copy exact words as they appear
    5. If resume format is unclear, make best effort to extract available information
    
    {
        "contact_info": {
            "name": "",
            "phone": "",
            "email": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "personal_website": ""
        },
        "professional_summary": "",
        "skills": {
            "technical": {
                "languages": [],
                "frameworks_and_libraries": [],
                "databases": [],
                "cloud_technologies": [],
                "other_tools": []
            },
            "soft": []
        },
        "certifications": [
            {
                "name": "",
                "issuer": "",
                "date": ""
            }
        ],
        "projects": [
            {
                "name": "",
                "description": "",
                "technologies": [],
                "link": "",
                "highlights": [],
                "start_date": "",
                "end_date": "",
                "duration": ""
            }
        ],
        "experience": [
            {
                "title": "",
                "company": "",
                "location": "",
                "dates": "",
                "highlights": []
            }
        ],
        "education": [
            {
                "school": "",
                "degree": "",
                "location": "",
                "graduation_date": "",
                "gpa": "",
                "relevant_courses": []
            }
        ],
        "achievements": [],
        "languages": [],
        "interests": [],
        "honors": [],
        "extra_curricular": []
    }

    Resume text to analyze:
    ${cleanedText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a resume parsing expert. Extract information exactly as it appears in the text and return valid JSON format only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content!);

  } catch (error) {
    console.error('Error parsing resume to JSON:', error);
    return {
      contact_info: { name: "", phone: "", email: "", location: "", linkedin: "", github: "", personal_website: "" },
      professional_summary: "",
      skills: { technical: { languages: [], frameworks_and_libraries: [], databases: [], cloud_technologies: [], other_tools: [] }, soft: [] },
      certifications: [],
      projects: [],
      experience: [],
      education: [],
      achievements: [],
      languages: [],
      interests: [],
      honors: [],
      extra_curricular: []
    };
  }
}

export default router; 
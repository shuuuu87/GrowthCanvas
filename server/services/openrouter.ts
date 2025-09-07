interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export interface AssessmentResponse {
  growthScore: number;
  recommendations: string;
  analysis: string;
}

export const generateAssessment = async (responses: Record<string, string>): Promise<AssessmentResponse> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  const prompt = `Based on the following interview responses, provide a personal growth assessment:

${Object.entries(responses).map(([question, answer]) => `${question}: ${answer}`).join('\n')}

Please analyze these responses and provide:
1. A growth score from 0-100
2. Specific recommendations for improvement
3. A brief analysis of current strengths and areas for development

Format your response as JSON with the following structure:
{
  "growthScore": number,
  "recommendations": "detailed recommendations text",
  "analysis": "analysis of current state"
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.HTTP_REFERER || 'http://localhost:5000',
        'X-Title': 'GrowthTracker Personal Development App',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a personal development coach and assessment expert. Provide constructive, actionable feedback based on user responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        growthScore: Math.min(Math.max(parsed.growthScore || 0, 0), 100),
        recommendations: parsed.recommendations || 'Continue working on your personal development goals.',
        analysis: parsed.analysis || 'Keep up the good work on your growth journey.',
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        growthScore: 70,
        recommendations: content,
        analysis: 'Based on your responses, there are opportunities for continued growth and development.',
      };
    }
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error('Failed to generate assessment. Please try again later.');
  }
};

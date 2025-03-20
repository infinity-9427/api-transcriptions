import { NextFunction, Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Joi from 'joi';

export interface SummaryResult {
  originalText: string;
  summary: string;
}

export interface SummarizeRequest {
  transcription: string;
}

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

if (!API_KEY) {
  process.exit(1);
}

const summarizeSchema = Joi.object({
  transcription: Joi.string().min(1).required(),
});


export const summarizeController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = summarizeSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { transcription } = value as SummarizeRequest;

    try {
      const prompt = `Summarize the following text in the same language as the input. If the input is English, the summary MUST be in English. Review always and ensure response it's in language of input:\n\n${transcription}\n\nSummary:`;

      const result = await model.generateContent(prompt);
      const response = result.response;

      if (!response || !response.text()) {
        console.error("Gemini API returned an empty or invalid response.");
        res.status(500).json({ error: 'Failed to generate summary.' });
        return;
      }

      const summary = response.text().trim();

      const summaryResult: SummaryResult = { originalText: transcription, summary };
      res.json(summaryResult);
    } catch (geminiError) {
      console.error("Gemini API Error:", geminiError);
      res.status(500).json({ error: 'Failed to generate summary.' });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// import { NextFunction, Request, Response } from 'express';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import Joi from 'joi';
// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';

// // Define interfaces for type safety
// export interface SummaryResult {
//   originalText: string;
//   summary: string;
// }

// export interface SummarizeRequest {
//   transcription: string;
// }

// const API_KEY = process.env.GEMINI_API_KEY;
// if (!API_KEY) {
//   console.error('GEMINI_API_KEY is not defined');
//   process.exit(1);
// }

// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// // Set up a simple multer storage for file uploads
// const upload = multer({
//   dest: 'uploads/',
//   limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB, for instance
// });

// // Define a Joi schema to validate transcription text
// const summarizeSchema = Joi.object({
//   transcription: Joi.string().min(1).required(),
// });

// // Versatile controller: handles JSON body and file uploads
// export const summarizeController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   let transcriptionText: string | undefined;

//   try {
//     // Case 1: Check if transcription text is provided directly in the JSON body
//     if (req.body && req.body.transcription) {
//       transcriptionText = req.body.transcription;
//     }
//     // Case 2: Check if a file was uploaded
//     else if (req.file) {
//       const filePath = req.file.path;
//       const fileContent = fs.readFileSync(filePath, 'utf-8');

//       // Attempt to parse the file content as JSON
//       try {
//         const parsed = JSON.parse(fileContent);
//         // If the parsed JSON has a transcription field, use it.
//         if (typeof parsed.transcription === 'string') {
//           transcriptionText = parsed.transcription;
//         } else {
//           // Otherwise, fall back to using the entire file content
//           transcriptionText = fileContent;
//         }
//       } catch (jsonError) {
//         // If JSON parsing fails, assume the file is plain text
//         transcriptionText = fileContent;
//       } finally {
//         // Clean up: remove the temporary file
//         fs.unlink(filePath, (err) => {
//           if (err) {
//             console.error('Failed to delete uploaded file:', err);
//           }
//         });
//       }
//     }

//     // If no transcription text was found, return an error
//     if (!transcriptionText) {
//       res.status(400).json({
//         error:
//           'Transcription text is required either in JSON body or as an uploaded file.',
//       });
//       return;
//     }

//     // Validate transcription text with Joi
//     const { error, value } = summarizeSchema.validate({
//       transcription: transcriptionText,
//     });
//     if (error) {
//       res.status(400).json({ error: error.details[0].message });
//       return;
//     }

//     // Generate the prompt for the Gemini model
//     const prompt = `Summarize the following text in the same language as the input:\n\n${transcriptionText}\n\nSummary:`;

//     // Call the Gemini API
//     const result = await model.generateContent(prompt);
//     const responseText = result.response?.text();
//     if (!responseText) {
//       console.error('Gemini API returned an empty or invalid response.');
//       res.status(500).json({ error: 'Failed to generate summary.' });
//       return;
//     }

//     // Prepare the response
//     const summary = responseText.trim();
//     const summaryResult: SummaryResult = {
//       originalText: transcriptionText,
//       summary,
//     };

//     res.json(summaryResult);
//   } catch (error) {
//     console.error('Controller Error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// export { upload };

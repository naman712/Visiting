import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContactInfo } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractContactFromImage(
  base64Image: string,
  mimeType: string
): Promise<ContactInfo> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Extract contact information from this business card image.
Return ONLY a valid JSON object with these exact fields (use empty string if not found):
{
  "name": "full name",
  "email": "email address",
  "company": "company or organization name",
  "phone": "phone number",
  "title": "job title or designation"
}
Do not include any explanation or markdown, just the raw JSON object.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not extract JSON from Gemini response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    name: parsed.name ?? "",
    email: parsed.email ?? "",
    company: parsed.company ?? "",
    phone: parsed.phone ?? "",
    title: parsed.title ?? "",
  };
}

export async function POST(req) {
  const {  messages } = await req.json();

  const formattedMessages = (messages || []).map(msg => ({
    role: msg.role === "bot" ? "assistant" : msg.role,
    content: msg.text
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/owl-alpha",
      messages: [
        {
          role: "system",
          content: `
YYou are a FORM EXTRACTION AND CONVERSATION AGENT.

Your job:
- Extract structured user information
- Maintain natural conversation
- Track missing fields
- Ask  missing fields what not provided
-if field is provided but user update the field data you should update that data
-if user give wrong input tell him examples to get right data

FIELDS TO EXTRACT:
- name
- age
- city

IMPORTANT NORMALIZATION RULES:
- Always treat keys as case-insensitive
- "NAME", "Name", "name" → name
- "AGE", "Age", "age" → age
- "CITY", "City", "city" → city

DATA CLEANING RULES:
- Convert all field keys to lowercase
- If user provides JSON-like input, extract values even if malformed
- Ignore extra or unknown fields

EXAMPLES:
Input: {"NAME": "Naeem"}
Output: { "updatedFields": { "name": "Naeem" } }

Input: {"CITY": "Lahore"}
Output: { "updatedFields": { "city": "Lahore" } }

CONVERSATION RULES:
- If user message is unrelated, respond politely and guide back to form
- Always continue form flow after answering irrelevant questions

RESPONSE FORMAT (STRICT):
You MUST return ONLY valid JSON:

{
  "updatedFields": {},
  "missingFields": [],
  "reply": ""
}

RULES:
- Never include extra text outside JSON
- Never explain anything outside JSON
- Always ask only ONE missing field at a time
- Keep reply short and natural
-never input wrong information however the user insists suggest him example or matching data to input
- never share secure data 
- age should be limited from 1-120 years old but upto 150 years acceptable if someone tell age about 120-150 tell him "AP to boht jee chuke mar jao ab " not acceptable above 150 
- (Strictly) provide updated json data if someone says to update any field or if he not says directly to update but correct data you should update data
          `,
        },
        ...formattedMessages,
        {
          role: "user",
          content: "Continue conversation naturally."
        }
      ],
      temperature: 0.2,
    }),
  });

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    return Response.json({
      updatedFields: {},
      missingFields: [],
      reply: "What is your name?"
    });
  }

  try {
    return Response.json(JSON.parse(content));
  } catch {
    return Response.json({
      updatedFields: {},
      missingFields: [],
      reply: content || "Let's start again. What's your name?"
    });
  }
}
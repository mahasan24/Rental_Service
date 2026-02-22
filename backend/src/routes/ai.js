import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../db/pool.js';

const router = Router();

const getGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

const SYSTEM_PROMPT = `You are a helpful assistant for Rentel, a van rental service. You help customers with:
- Information about our van types (Passenger, Cargo, Camper)
- Booking process and pricing
- Cancellation policies
- General questions about van rentals

IMPORTANT FORMATTING RULES:
- Use plain text only, NO markdown syntax
- Do NOT use asterisks (*) for bold or bullet points
- Use simple dashes (-) for lists if needed
- Keep responses conversational and easy to read

Be friendly, concise, and helpful. If you don't know something specific about our service, suggest contacting support.

Key information:
- We offer Passenger vans (for groups/families), Cargo vans (for moving/deliveries), and Camper vans (for trips/camping)
- Booking is instant with real-time availability
- Free cancellation up to 24 hours before pickup
- 24/7 customer support available
- All vans include basic insurance`;

router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const fallbackResponses = {
      'type': 'We offer three types of vans: Passenger vans for groups and families, Cargo vans for moving and deliveries, and Camper vans for road trips and camping adventures.',
      'book': 'Booking is easy! Browse our vans, select your dates, and confirm your reservation. It\'s instant with real-time availability.',
      'cancel': 'You can cancel your booking for free up to 24 hours before your scheduled pickup time.',
      'price': 'Our prices vary by van type and are shown per day. You\'ll see the total cost before confirming your booking.',
      'cost': 'Our prices vary by van type and are shown per day. You\'ll see the total cost before confirming your booking.',
      'insurance': 'Basic insurance is included with all rentals. Additional coverage options are available at checkout.',
      'support': 'Our support team is available 24/7. You can reach us at help@rentel.com or call 1-800-RENTEL.',
      'help': 'Our support team is available 24/7. You can reach us at help@rentel.com or call 1-800-RENTEL.',
      'contact': 'Our support team is available 24/7. You can reach us at help@rentel.com or call 1-800-RENTEL.',
      'passenger': 'Passenger vans are perfect for group travel, family trips, corporate shuttles, or event transportation. They typically seat 8-15 passengers comfortably.',
      'cargo': 'Cargo vans are ideal for moving, deliveries, or transporting equipment. They offer generous cargo space and easy loading.',
      'camper': 'Camper vans are adventure-ready vehicles for road trips and camping. They include sleeping accommodations and basic amenities.',
      'move': 'For moving, we recommend our Cargo vans. They have plenty of space for furniture and boxes. Check out our fleet at /vans!',
      'trip': 'For road trips, we recommend our Camper vans. They\'re equipped for comfortable travel and overnight stays.',
      'family': 'For family travel, our Passenger vans are perfect! They offer comfortable seating and plenty of space for luggage.',
      'how': 'To rent a van: 1) Browse our fleet at /vans, 2) Select your dates, 3) Complete the booking form, and 4) You\'re all set! It\'s that easy.',
      'available': 'You can check van availability by browsing our fleet at /vans. Select your preferred dates to see what\'s available.',
      'hello': 'Hello! Welcome to Rentel. How can I help you today? You can ask about our van types, booking process, or pricing.',
      'hi': 'Hi there! Welcome to Rentel. How can I help you today? You can ask about our van types, booking process, or pricing.',
    };

    const genAI = getGemini();
    
    if (!genAI) {
      const lowerMsg = message.toLowerCase();
      let response = 'I\'d be happy to help! You can ask about our van types (Passenger, Cargo, Camper), booking process, pricing, or cancellation policy. What would you like to know?';
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerMsg.includes(key)) {
          response = value;
          break;
        }
      }

      return res.json({ response, source: 'fallback' });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      
      const historyText = conversationHistory.slice(-10).map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${historyText}\n\nUser: ${message}\n\nAssistant:`;

      const result = await model.generateContent(prompt);
      let response = result.response.text() || 'I apologize, I couldn\'t generate a response. Please try again.';
      
      // Clean up any markdown formatting that slipped through
      response = response
        .replace(/\*\*\*/g, '')           // Remove triple asterisks
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markers
        .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markers
        .replace(/^[\s]*[-*]\s+/gm, '• ')  // Convert markdown bullets to simple bullets
        .trim();

      return res.json({ response, source: 'gemini' });
    } catch (aiError) {
      console.error('Gemini API error:', aiError.message || aiError);
      
      // Fall back to rule-based responses
      const lowerMsg = message.toLowerCase();
      let response = 'I\'d be happy to help! You can ask about our van types (Passenger, Cargo, Camper), booking process, pricing, or cancellation policy. What would you like to know?';
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerMsg.includes(key)) {
          response = value;
          break;
        }
      }

      return res.json({ response, source: 'fallback' });
    }
  } catch (err) {
    console.error('AI Chat error:', err);
    res.json({ 
      response: 'I\'d be happy to help! You can ask about our van types (Passenger, Cargo, Camper), booking process, pricing, or cancellation policy.',
      source: 'error'
    });
  }
});

router.post('/generate-description', async (req, res, next) => {
  try {
    const { vanName, vanType, capacity, specs } = req.body;
    
    if (!vanName || !vanType) {
      return res.status(400).json({ error: 'Van name and type are required' });
    }

    const genAI = getGemini();
    
    if (!genAI) {
      const templates = {
        Passenger: `The ${vanName} is a versatile passenger van perfect for group travel. With seating for ${capacity || 'multiple'} passengers, it offers comfort and convenience for family trips, corporate shuttles, or group outings. Features include comfortable seating, climate control, and ample storage space.`,
        Cargo: `The ${vanName} is a reliable cargo van designed for all your hauling needs. With ${capacity ? `${capacity} cubic feet of cargo space` : 'generous cargo capacity'}, it's ideal for moving, deliveries, or transporting equipment. Features include easy-load design, secure storage, and fuel efficiency.`,
        Camper: `The ${vanName} is an adventure-ready camper van for those who love the open road. Equipped for ${capacity || 'comfortable'} travelers, it combines mobility with home comforts. Features include sleeping accommodations, basic kitchen facilities, and storage for outdoor gear.`,
      };
      
      return res.json({ 
        description: templates[vanType] || `The ${vanName} is a quality ${vanType.toLowerCase()} van ready for your next journey.`,
        source: 'template'
      });
    }

    const prompt = `Write a compelling 2-3 sentence description for a rental van with these details:
- Name: ${vanName}
- Type: ${vanType}
- Capacity: ${capacity || 'Standard'}
- Specs: ${specs || 'Standard features'}

Make it engaging and highlight key benefits for renters. Only return the description, no extra text.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const description = result.response.text() || `The ${vanName} is a quality ${vanType.toLowerCase()} van ready for your next journey.`;

    res.json({ description: description.trim(), source: 'gemini' });
  } catch (err) {
    console.error('Generate description error:', err);
    next(err);
  }
});

router.post('/recommend', async (req, res, next) => {
  try {
    const { need, preferences } = req.body;
    
    if (!need) {
      return res.status(400).json({ error: 'Need description is required' });
    }

    const vansResult = await pool.query(
      'SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans'
    );
    const vans = vansResult.rows;

    const genAI = getGemini();
    
    if (!genAI) {
      const keywords = need.toLowerCase();
      let recommendedType = 'Passenger';
      
      if (keywords.includes('mov') || keywords.includes('cargo') || keywords.includes('deliver') || keywords.includes('furniture')) {
        recommendedType = 'Cargo';
      } else if (keywords.includes('camp') || keywords.includes('trip') || keywords.includes('adventure') || keywords.includes('travel')) {
        recommendedType = 'Camper';
      } else if (keywords.includes('family') || keywords.includes('group') || keywords.includes('people')) {
        recommendedType = 'Passenger';
      }

      const recommended = vans.filter(v => v.type === recommendedType).slice(0, 3);
      
      return res.json({
        recommendations: recommended,
        reason: `Based on your need for "${need}", we recommend ${recommendedType} vans.`,
        source: 'rules'
      });
    }

    const prompt = `Given a customer's need: "${need}"
And these available vans: ${JSON.stringify(vans.map(v => ({ id: v.id, name: v.name, type: v.type, capacity: v.capacity, price: v.price_per_day })))}

Recommend the top 3 most suitable vans and explain why. Return ONLY valid JSON in this exact format:
{"recommendations": [van_id1, van_id2, van_id3], "reason": "Brief explanation"}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    
    try {
      const content = result.response.text() || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
      
      const recommendedVans = vans.filter(v => parsed.recommendations?.includes(v.id));
      
      res.json({
        recommendations: recommendedVans.length > 0 ? recommendedVans : vans.slice(0, 3),
        reason: parsed.reason || 'Here are our top recommendations for you.',
        source: 'gemini'
      });
    } catch {
      res.json({
        recommendations: vans.slice(0, 3),
        reason: 'Here are some popular vans that might suit your needs.',
        source: 'fallback'
      });
    }
  } catch (err) {
    console.error('AI Recommend error:', err);
    next(err);
  }
});

export default router;

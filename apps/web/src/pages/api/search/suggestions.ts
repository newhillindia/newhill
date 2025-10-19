import { NextApiRequest, NextApiResponse } from 'next';

interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'suggestion';
  count?: number;
}

// Mock suggestions data - in real implementation, this would come from a search service
const mockSuggestions: SearchSuggestion[] = [
  { text: 'turmeric powder', type: 'product', count: 12 },
  { text: 'cardamom', type: 'product', count: 8 },
  { text: 'cinnamon sticks', type: 'product', count: 15 },
  { text: 'black pepper', type: 'product', count: 20 },
  { text: 'cumin seeds', type: 'product', count: 10 },
  { text: 'garam masala', type: 'product', count: 6 },
  { text: 'whole spices', type: 'category', count: 45 },
  { text: 'ground spices', type: 'category', count: 32 },
  { text: 'gift packs', type: 'category', count: 8 },
  { text: 'organic spices', type: 'suggestion', count: 25 },
  { text: 'premium spices', type: 'suggestion', count: 18 },
  { text: 'indian spices', type: 'suggestion', count: 30 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Filter suggestions based on query
    const filteredSuggestions = mockSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(q.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions

    res.status(200).json({
      success: true,
      data: filteredSuggestions,
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

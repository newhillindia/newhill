import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch exchange rates from external API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rates = data.rates;

    // Define target currencies
    const targetCurrencies = ['QAR', 'AED', 'SAR', 'OMR'];
    const currencyRates: CurrencyRate[] = [];

    // Calculate rates for each target currency
    for (const currency of targetCurrencies) {
      if (rates[currency]) {
        currencyRates.push({
          from: 'INR',
          to: currency,
          rate: rates[currency],
        });
        
        // Add reverse rate
        currencyRates.push({
          from: currency,
          to: 'INR',
          rate: 1 / rates[currency],
        });
      }
    }

    // Update currency rates in database
    for (const rate of currencyRates) {
      const { error } = await supabaseClient
        .from('CurrencyRate')
        .upsert({
          fromCurrency: rate.from,
          toCurrency: rate.to,
          rate: rate.rate,
          lastUpdated: new Date().toISOString(),
        }, {
          onConflict: 'fromCurrency,toCurrency'
        });

      if (error) {
        console.error('Error updating currency rate:', error);
      }
    }

    // Clear cached prices to force recalculation
    const { error: clearError } = await supabaseClient
      .from('CurrencyPrice')
      .delete()
      .lt('lastUpdated', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Clear prices older than 1 hour

    if (clearError) {
      console.error('Error clearing cached prices:', clearError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${currencyRates.length} currency rates`,
        rates: currencyRates,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating currency rates:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

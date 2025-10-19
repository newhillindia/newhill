import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Find expired lots that are still active
    const { data: expiredLots, error: fetchError } = await supabaseClient
      .from('Lot')
      .select('id, variantId, batchCode, bestBefore, qtyAvailable, qtyReserved')
      .eq('status', 'ACTIVE')
      .lt('bestBefore', new Date().toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch expired lots: ${fetchError.message}`);
    }

    if (!expiredLots || expiredLots.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired lots found',
          blockedCount: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let blockedCount = 0;
    const blockedLots = [];

    // Block each expired lot
    for (const lot of expiredLots) {
      // Update lot status to EXPIRED
      const { error: updateError } = await supabaseClient
        .from('Lot')
        .update({ status: 'EXPIRED' })
        .eq('id', lot.id);

      if (updateError) {
        console.error(`Error blocking lot ${lot.batchCode}:`, updateError);
        continue;
      }

      // Log the inventory change
      const { error: logError } = await supabaseClient
        .from('InventoryLedger')
        .insert({
          variantId: lot.variantId,
          lotId: lot.id,
          changeType: 'ADJUSTMENT',
          refType: 'SYSTEM',
          quantity: lot.qtyAvailable + lot.qtyReserved,
          reason: 'Lot expired - automatically blocked',
          metadata: {
            bestBefore: lot.bestBefore,
            batchCode: lot.batchCode,
            action: 'AUTO_BLOCK_EXPIRED',
          },
        });

      if (logError) {
        console.error(`Error logging inventory change for lot ${lot.batchCode}:`, logError);
      }

      blockedCount++;
      blockedLots.push({
        id: lot.id,
        batchCode: lot.batchCode,
        bestBefore: lot.bestBefore,
        totalQuantity: lot.qtyAvailable + lot.qtyReserved,
      });
    }

    // Update variant stock quantities
    const variantUpdates = new Map<string, number>();
    
    for (const lot of expiredLots) {
      const currentStock = variantUpdates.get(lot.variantId) || 0;
      variantUpdates.set(lot.variantId, currentStock - (lot.qtyAvailable + lot.qtyReserved));
    }

    // Update each variant's stock quantity
    for (const [variantId, stockChange] of variantUpdates) {
      const { error: stockError } = await supabaseClient
        .from('ProductVariant')
        .update({ 
          stockQty: Math.max(0, stockChange) // Ensure stock doesn't go negative
        })
        .eq('id', variantId);

      if (stockError) {
        console.error(`Error updating stock for variant ${variantId}:`, stockError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully blocked ${blockedCount} expired lots`,
        blockedCount,
        blockedLots,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error blocking expired lots:', error);
    
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

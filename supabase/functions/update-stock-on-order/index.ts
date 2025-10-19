import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  id: string;
  variantId: string;
  lotId?: string;
  quantity: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, action } = await req.json();

    if (!orderId || !action) {
      throw new Error('Missing required parameters: orderId and action');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseClient
      .from('OrderItem')
      .select('id, variantId, lotId, quantity')
      .eq('orderId', orderId);

    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }

    if (!orderItems || orderItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No order items found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const processedItems = [];

    for (const item of orderItems) {
      if (action === 'reserve') {
        // Reserve stock
        const { error: reserveError } = await supabaseClient
          .from('Lot')
          .update({
            qtyAvailable: item.lotId ? 
              `qtyAvailable - ${item.quantity}` : 
              `qtyAvailable - ${item.quantity}`,
            qtyReserved: `qtyReserved + ${item.quantity}`,
          })
          .eq('id', item.lotId || 'none')
          .eq('status', 'ACTIVE');

        if (reserveError) {
          console.error(`Error reserving stock for item ${item.id}:`, reserveError);
          continue;
        }

        // Log inventory change
        await supabaseClient
          .from('InventoryLedger')
          .insert({
            variantId: item.variantId,
            lotId: item.lotId,
            changeType: 'OUT',
            refType: 'ORDER',
            quantity: item.quantity,
            reason: `Reserved for order ${orderId}`,
            metadata: { orderId, action: 'RESERVE' },
          });

      } else if (action === 'confirm') {
        // Confirm allocation (remove from reserved)
        const { error: confirmError } = await supabaseClient
          .from('Lot')
          .update({
            qtyReserved: `qtyReserved - ${item.quantity}`,
          })
          .eq('id', item.lotId || 'none');

        if (confirmError) {
          console.error(`Error confirming allocation for item ${item.id}:`, confirmError);
          continue;
        }

        // Log inventory change
        await supabaseClient
          .from('InventoryLedger')
          .insert({
            variantId: item.variantId,
            lotId: item.lotId,
            changeType: 'OUT',
            refType: 'ORDER',
            quantity: item.quantity,
            reason: `Confirmed allocation for order ${orderId}`,
            metadata: { orderId, action: 'CONFIRM' },
          });

      } else if (action === 'release') {
        // Release reserved stock
        const { error: releaseError } = await supabaseClient
          .from('Lot')
          .update({
            qtyReserved: `qtyReserved - ${item.quantity}`,
            qtyAvailable: `qtyAvailable + ${item.quantity}`,
          })
          .eq('id', item.lotId || 'none');

        if (releaseError) {
          console.error(`Error releasing stock for item ${item.id}:`, releaseError);
          continue;
        }

        // Log inventory change
        await supabaseClient
          .from('InventoryLedger')
          .insert({
            variantId: item.variantId,
            lotId: item.lotId,
            changeType: 'IN',
            refType: 'ORDER',
            quantity: item.quantity,
            reason: `Released from order ${orderId}`,
            metadata: { orderId, action: 'RELEASE' },
          });
      }

      processedItems.push({
        itemId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        action,
      });
    }

    // Update variant stock quantities
    const variantUpdates = new Map<string, number>();
    
    for (const item of orderItems) {
      const currentChange = variantUpdates.get(item.variantId) || 0;
      const change = action === 'reserve' || action === 'confirm' ? -item.quantity : item.quantity;
      variantUpdates.set(item.variantId, currentChange + change);
    }

    // Update each variant's stock quantity
    for (const [variantId, stockChange] of variantUpdates) {
      const { error: stockError } = await supabaseClient
        .from('ProductVariant')
        .update({ 
          stockQty: `stockQty + ${stockChange}`
        })
        .eq('id', variantId);

      if (stockError) {
        console.error(`Error updating stock for variant ${variantId}:`, stockError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${processedItems.length} items for order ${orderId}`,
        action,
        processedItems,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating stock on order:', error);
    
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

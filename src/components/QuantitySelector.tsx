import { useState, useEffect, useMemo } from "react";
import { Minus, Plus, Check, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [3, 6, 9, 12, 15, 18, 21, 24, 27];
const SHIPPING_BASE_RMB = 150;
const SHIPPING_EXTRA_PER_500G = 45;

interface QuantitySelectorProps {
  /** Price per meter in EUR */
  pricePerMeter: number;
  /** Weight per meter in grams (defaults to 200) */
  weightPerMeter?: number;
  /** Called when user confirms a quantity */
  onConfirm: (meters: number) => Promise<void> | void;
  /** Called when user cancels / closes */
  onCancel: () => void;
}

function calcShippingRMB(totalWeightG: number): number {
  if (totalWeightG < 500) return SHIPPING_BASE_RMB;
  return SHIPPING_BASE_RMB + Math.ceil((totalWeightG - 500) / 500) * SHIPPING_EXTRA_PER_500G;
}

const QuantitySelector = ({
  pricePerMeter,
  weightPerMeter = 200,
  onConfirm,
  onCancel,
}: QuantitySelectorProps) => {
  const [meters, setMeters] = useState(3);
  const [confirming, setConfirming] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("exchange_rates")
      .select("rate_cny_eur")
      .order("date", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setExchangeRate(data.rate_cny_eur);
      });
  }, []);

  const overLimit = meters > 27;

  const shippingEUR = useMemo(() => {
    if (!exchangeRate) return null;
    const weight = meters * weightPerMeter;
    const rmb = calcShippingRMB(weight);
    return rmb / exchangeRate;
  }, [meters, weightPerMeter, exchangeRate]);

  const fabricTotal = pricePerMeter * meters;
  const grandTotal = shippingEUR != null ? fabricTotal + shippingEUR : null;

  // Build pricing table rows
  const tableRows = useMemo(() => {
    if (!exchangeRate) return [];
    return STEPS.map((qty) => {
      const weight = qty * weightPerMeter;
      const shippingRmb = calcShippingRMB(weight);
      const shipping = shippingRmb / exchangeRate;
      const fabric = pricePerMeter * qty;
      const total = fabric + shipping;
      return {
        qty,
        fabric,
        shipping,
        total,
        perMeter: total / qty,
      };
    });
  }, [pricePerMeter, weightPerMeter, exchangeRate]);

  const handleConfirm = async () => {
    if (overLimit) return;
    setConfirming(true);
    try {
      await onConfirm(meters);
    } finally {
      setConfirming(false);
    }
  };

  const decrease = () => setMeters((v) => Math.max(3, v - 3));
  const increase = () => setMeters((v) => v + 3);

  return (
    <div className="mt-2 space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center justify-center gap-0 rounded-full border border-border bg-background shadow-sm overflow-hidden">
        <button
          onClick={decrease}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Réduire"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 text-sm font-medium text-foreground min-w-[80px] text-center">
          {meters} m
        </span>
        <button
          onClick={increase}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Augmenter"
        >
          <Plus className="w-4 h-4" />
        </button>

        {!overLimit ? (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Valider"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        ) : null}
      </div>


      {/* Over 27m message */}
      {overLimit && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
          <Mail className="w-4 h-4 shrink-0" />
          <span>
            Pour une commande supérieure à 27 m,{" "}
            <a href="/nous-contacter" className="underline text-primary hover:text-primary/80">
              contactez-nous
            </a>
          </span>
        </div>
      )}

    </div>
  );
};

export default QuantitySelector;

"use client";

import { useState } from "react";
import { Brain, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { predictionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PredictionPanel } from "./PredictionPanel";

interface RunPredictionPanelProps {
  patientId: string;
  patientName: string;
}

export function RunPredictionPanel({ patientId, patientName }: RunPredictionPanelProps) {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [predictionId, setPredictionId] = useState<string | null>(null);

  async function run() {
    setState("running");
    try {
      const pred = await predictionsApi.create(patientId);
      setPredictionId(pred.id);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done" && predictionId) {
    return <PredictionPanel predictionId={predictionId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
      {/* Icon */}
      <div className={cn(
        "flex h-20 w-20 items-center justify-center rounded-3xl transition-colors",
        state === "idle"    && "bg-blue-50",
        state === "running" && "bg-blue-50 animate-pulse",
        state === "error"   && "bg-red-50"
      )}>
        {state === "error"
          ? <XCircle className="h-10 w-10 text-red-500" />
          : <Brain className={cn(
              "h-10 w-10",
              state === "running" ? "text-blue-400" : "text-blue-600"
            )} />
        }
      </div>

      {/* Copy */}
      <div>
        <p className="text-base font-semibold text-gray-900">
          {state === "idle"    && "Run AI Prediction"}
          {state === "running" && "Analysing..."}
          {state === "error"   && "Prediction Failed"}
        </p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
          {state === "idle" && (
            <>
              The model will score <strong>{patientName}</strong>&apos;s latest test results using
              WHO 2022 diagnostic guidelines and produce a TB probability estimate.
            </>
          )}
          {state === "running" && "Scoring GeneXpert, AFB, Mantoux, risk factors..."}
          {state === "error"   && "No test results found or the model failed. Add a test first."}
        </p>
      </div>

      {/* Model info chips */}
      {state === "idle" && (
        <div className="flex flex-wrap justify-center gap-2">
          {["GeneXpert", "AFB Smear", "Mantoux", "IGRA", "Risk factors"].map(f => (
            <span key={f} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Button */}
      {state !== "running" && (
        <Button
          onClick={state === "error" ? () => setState("idle") : run}
          size="lg"
          className="gap-2 px-8"
          variant={state === "error" ? "outline" : "default"}
        >
          {state === "error" ? "Try Again" : (
            <><Brain className="h-5 w-5" /> Run Prediction</>
          )}
        </Button>
      )}

      {state === "running" && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      )}
    </div>
  );
}

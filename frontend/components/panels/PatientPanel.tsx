"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  User, Phone, MapPin, FlaskConical, Brain, AlertTriangle,
  Cigarette, Wine, HeartPulse, ArrowRight, CalendarDays, Plus
} from "lucide-react";
import { patientsApi, testsApi, predictionsApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInYears } from "date-fns";
import { cn, getAvatarUrl } from "@/lib/utils";

interface PatientPanelProps {
  patientId: string;
  onRunPrediction: (patientId: string) => void;
}

function RiskPill({ active, icon: Icon, label }: { active: boolean; icon: React.ElementType; label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
      active
        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
        : "bg-gray-100 text-gray-400"
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function PatientPanel({ patientId, onRunPrediction }: PatientPanelProps) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientsApi.get(patientId),
    enabled: !!patientId,
  });

  const { data: tests } = useQuery({
    queryKey: ["tests", patientId],
    queryFn: () => testsApi.list({ patient_id: patientId, limit: 3 }),
    enabled: !!patientId,
  });

  const { data: predictions } = useQuery({
    queryKey: ["predictions", patientId],
    queryFn: () => predictionsApi.list({ patient_id: patientId, limit: 1 }),
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!patient) return <p className="text-sm text-gray-500">Patient not found.</p>;

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const latestPrediction = predictions?.[0];

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="flex items-start gap-4">
        <img 
          src={getAvatarUrl(`${patient.first_name} ${patient.last_name}`, patient.gender || undefined)} 
          alt="avatar" 
          className="h-14 w-14 shrink-0 rounded-2xl bg-blue-50 border border-blue-100" 
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-gray-900 leading-tight">
            {patient.first_name} {patient.last_name}
          </p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{patient.patient_id}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {age !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <CalendarDays className="h-3 w-3" /> {age} yrs
              </span>
            )}
            {patient.gender && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 capitalize">
                <User className="h-3 w-3" /> {patient.gender}
              </span>
            )}
            {patient.phone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <Phone className="h-3 w-3" /> {patient.phone}
              </span>
            )}
            {patient.state && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <MapPin className="h-3 w-3" /> {patient.state}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Risk factors */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Risk Factors</p>
        <div className="flex flex-wrap gap-2">
          <RiskPill active={patient.hiv_status === "positive"} icon={HeartPulse} label="HIV+" />
          <RiskPill active={patient.diabetes} icon={AlertTriangle} label="Diabetes" />
          <RiskPill active={patient.smoking} icon={Cigarette} label="Smoking" />
          <RiskPill active={patient.alcohol} icon={Wine} label="Alcohol" />
          <RiskPill active={patient.previous_tb} icon={FlaskConical} label="Prev. TB" />
          <RiskPill active={patient.tb_contact} icon={User} label="TB Contact" />
        </div>
      </div>

      {/* Latest prediction */}
      {latestPrediction && (
        <div className={cn(
          "rounded-xl p-4",
          latestPrediction.prediction === "positive" ? "bg-red-50 ring-1 ring-red-200"
            : latestPrediction.prediction === "negative" ? "bg-green-50 ring-1 ring-green-200"
            : "bg-amber-50 ring-1 ring-amber-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className={cn("h-5 w-5",
                latestPrediction.prediction === "positive" ? "text-red-600"
                  : latestPrediction.prediction === "negative" ? "text-green-600"
                  : "text-amber-600"
              )} />
              <div>
                <p className="text-sm font-semibold capitalize text-gray-900">
                  {latestPrediction.prediction} — {latestPrediction.confidence} confidence
                </p>
                <p className="text-xs text-gray-500">
                  P(+) {((latestPrediction.probability_positive ?? 0) * 100).toFixed(1)}% ·{" "}
                  {format(new Date(latestPrediction.created_at), "dd MMM yyyy")}
                </p>
              </div>
            </div>
            <StatusBadge status={latestPrediction.prediction ?? "pending"} />
          </div>
        </div>
      )}

      {/* Recent tests */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Recent Tests</p>
        {!tests?.length ? (
          <p className="text-xs text-gray-400">No tests recorded</p>
        ) : (
          <div className="space-y-2">
            {tests.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      {format(new Date(t.test_date), "dd MMM yyyy")}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      GeneXpert: {t.genexpert_result ?? "—"} · AFB: {t.afb_smear_1 ?? "—"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={t.tb_status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <Link href={`/patients/${patient.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full justify-between gap-2 h-10">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" /> View Full Profile
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Button>
        </Link>
        <Link href={`/tests/new?patient_id=${patient.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full justify-between gap-2 h-10">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Test Result
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Button>
        </Link>
        <Button
          size="sm"
          className="w-full h-10 gap-2"
          onClick={() => onRunPrediction(patient.id)}
        >
          <Brain className="h-4 w-4" /> Run AI Prediction
        </Button>
      </div>
    </div>
  );
}

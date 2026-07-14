"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { hospitalsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface FilterValues {
  state: string;
  hospital_id: string;
  hiv_status: string;
  tb_status: string;
  gender: string;
}

interface FilterPanelProps {
  values: FilterValues;
  onChange: (v: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

const STATES = ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"];
const TB_STATUSES = ["positive", "negative", "indeterminate", "pending"];
const HIV_STATUSES = ["positive", "negative", "unknown"];

const EMPTY: FilterValues = {
  state: "", hospital_id: "", hiv_status: "", tb_status: "", gender: "",
};

export function FilterPanel({ values, onChange, onApply, onClear }: FilterPanelProps) {
  const { data: hospitals } = useQuery({ queryKey: ["hospitals"], queryFn: hospitalsApi.list });

  const set = (key: keyof FilterValues, val: string) =>
    onChange({ ...values, [key]: val });

  const activeCount = Object.values(values).filter(Boolean).length;

  const S = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </Label>
      {children}
    </div>
  );

  const Select = ({
    k, options, placeholder,
  }: { k: keyof FilterValues; options: string[]; placeholder: string }) => (
    <select
      value={values[k]}
      onChange={e => set(k, e.target.value)}
      className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o} value={o} className="capitalize">
          {o}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <S label="State">
        <Select k="state" options={STATES} placeholder="All states" />
      </S>

      <S label="Hospital">
        <select
          value={values.hospital_id}
          onChange={e => set("hospital_id", e.target.value)}
          className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">All hospitals</option>
          {(hospitals ?? []).map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </S>

      <S label="Gender">
        <div className="flex gap-2">
          {["", "male", "female", "other"].map(g => (
            <button
              key={g}
              onClick={() => set("gender", g)}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors capitalize ${
                values.gender === g
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {g || "Any"}
            </button>
          ))}
        </div>
      </S>

      <S label="HIV Status">
        <Select k="hiv_status" options={HIV_STATUSES} placeholder="Any status" />
      </S>

      <S label="TB Status">
        <Select k="tb_status" options={TB_STATUSES} placeholder="Any result" />
      </S>

      <div className="pt-2 flex gap-2">
        <Button onClick={onApply} className="flex-1 h-10">
          Apply Filters
        </Button>
        <Button onClick={onClear} variant="outline" className="h-10 px-4">
          Clear
        </Button>
      </div>
    </div>
  );
}

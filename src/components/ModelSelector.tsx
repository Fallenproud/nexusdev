import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNexusStore } from '@/hooks/useNexusStore';
import { MODELS } from '@/lib/chat';
import { Cpu } from 'lucide-react';
export function ModelSelector() {
  const model = useNexusStore((state) => state.model);
  const setModel = useNexusStore((state) => state.setModel);
  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger className="w-auto min-w-[200px] h-9 text-xs gap-2 bg-muted hover:bg-secondary transition-colors">
        <Cpu className="size-4 text-muted-foreground" />
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((m) => (
          <SelectItem key={m.id} value={m.id} className="text-xs">
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
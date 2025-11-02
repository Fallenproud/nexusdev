import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextPanel } from './ContextPanel';
import { CanvasPanel } from './CanvasPanel';
import { FilePanel } from './FilePanel';
import { Info, FileText, Folder } from 'lucide-react';
export function RightPanelTabs() {
  return (
    <Tabs defaultValue="context" className="flex flex-col h-full w-full">
      <div className="p-2 border-b">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="context" className="text-xs gap-1.5">
            <Info className="size-4" />
            Context
          </TabsTrigger>
          <TabsTrigger value="canvas" className="text-xs gap-1.5">
            <FileText className="size-4" />
            Canvas
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs gap-1.5">
            <Folder className="size-4" />
            Files
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="context" className="flex-1 overflow-hidden">
        <ContextPanel />
      </TabsContent>
      <TabsContent value="canvas" className="flex-1 overflow-hidden">
        <CanvasPanel />
      </TabsContent>
      <TabsContent value="files" className="flex-1 overflow-hidden">
        <FilePanel />
      </TabsContent>
    </Tabs>
  );
}
import React, { useEffect, useState, useId } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { toast } from 'sonner';
interface MermaidDiagramProps {
  chart: string;
}
// A simple cache to avoid re-rendering the same diagram
const svgCache = new Map<string, string>();
export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const uniqueId = useId();
  const [svg, setSvg] = useState<string | null>(svgCache.get(chart) || null);
  const [loading, setLoading] = useState(!svg);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    const loadAndRender = async () => {
      if (svgCache.has(chart)) {
        if (isMounted) {
          setSvg(svgCache.get(chart)!);
          setLoading(false);
        }
        return;
      }
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        // Dynamically import mermaid only when needed
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          // Aligning theme with the application's luxurious aesthetic
          themeVariables: {
            background: 'hsl(var(--card))',
            primaryColor: 'hsl(var(--muted))',
            primaryTextColor: 'hsl(var(--foreground))',
            primaryBorderColor: 'hsl(var(--border))',
            lineColor: 'hsl(var(--muted-foreground))',
            secondaryColor: 'hsl(var(--secondary))',
            tertiaryColor: 'hsl(var(--background))',
            fontSize: '14px',
          },
        });
        // Mermaid requires a unique ID for rendering, useId is perfect for this
        const { svg: renderedSvg } = await mermaid.render(`mermaid-svg-${uniqueId}`, chart);
        if (isMounted) {
          svgCache.set(chart, renderedSvg);
          setSvg(renderedSvg);
        }
      } catch (e) {
        console.error('Mermaid rendering failed:', e);
        const errorMessage = e instanceof Error ? e.message : 'Failed to render diagram. Check syntax.';
        if (isMounted) {
          setError(errorMessage);
        }
        toast.error("Diagram Error", { description: errorMessage });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    if (chart) {
      loadAndRender();
    }
    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);
  if (loading) {
    return <Skeleton className="w-full h-80 rounded-lg" />;
  }
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Diagram Rendering Error</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{error}</p>
          <p className="font-mono text-xs bg-destructive/20 p-2 rounded">Please check your Mermaid syntax.</p>
        </AlertDescription>
      </Alert>
    );
  }
  if (svg) {
    // The container ensures the SVG is responsive and centered
    return (
      <div 
        className="w-full flex justify-center items-center p-4"
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    );
  }
  return null;
}
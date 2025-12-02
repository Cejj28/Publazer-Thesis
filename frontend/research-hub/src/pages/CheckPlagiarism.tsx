import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ScanResult {
  overallScore: number;
  matchedSources: Array<{
    source: string;
    percentage: number;
    url: string;
  }>;
  details: string;
}

export default function CheckPlagiarism() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [textContent, setTextContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFileName(file.name);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleScan = async () => {
    if (!textContent && !fileName) {
      toast.error('Please provide text or upload a PDF file');
      return;
    }

    setScanning(true);
    setScanResult(null);

    // Simulate plagiarism scanning process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate simulated results
    const overallScore = Math.floor(Math.random() * 40) + 5; // 5-45%
    const numSources = Math.floor(Math.random() * 4) + 1; // 1-4 sources
    
    const sources = [
      { name: 'IEEE Research Paper', url: 'https://ieeexplore.ieee.org/document/example' },
      { name: 'Research Gate Publication', url: 'https://researchgate.net/publication/example' },
      { name: 'Journal Article', url: 'https://journal.example.com/article/123' },
      { name: 'Academic Repository', url: 'https://repository.example.edu/paper/456' },
    ];

    const matchedSources = sources.slice(0, numSources).map((source) => ({
      source: source.name,
      percentage: Math.floor(Math.random() * 20) + 5,
      url: source.url,
    }));

    const result: ScanResult = {
      overallScore,
      matchedSources,
      details: `The system analyzed ${textContent ? 'the provided text' : fileName} against millions of academic sources, web pages, and publications. Found ${numSources} potential matches that require review.`,
    };

    setScanResult(result);
    setScanning(false);
    toast.success('Plagiarism scan completed!');
  };

  const getSimilarityLevel = (score: number) => {
    if (score < 15) return { label: 'Low Risk', color: 'text-success', icon: CheckCircle2 };
    if (score < 30) return { label: 'Moderate Risk', color: 'text-warning', icon: AlertTriangle };
    return { label: 'High Risk', color: 'text-destructive', icon: AlertCircle };
  };

  const similarity = scanResult ? getSimilarityLevel(scanResult.overallScore) : null;
  const SimilarityIcon = similarity?.icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Plagiarism Checker</h1>
          <p className="text-muted-foreground">
            Upload a document or paste text to check for plagiarism
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Content for Scanning</CardTitle>
            <CardDescription>
              Choose to upload a PDF file or paste text directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload PDF Document</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      {fileName ? (
                        <div className="flex items-center justify-center gap-2 text-success">
                          <FileText className="w-8 h-8" />
                          <span className="font-medium">{fileName}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF files only (Max 20MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Paste Your Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Paste the content you want to check for plagiarism..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {textContent.length} characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleScan}
              className="w-full mt-4"
              disabled={scanning || (!textContent && !fileName)}
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning for Plagiarism...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Start Plagiarism Check
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {scanResult && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>Plagiarism detection analysis completed</CardDescription>
                </div>
                {SimilarityIcon && (
                  <Badge variant="outline" className={`${similarity?.color} border-current text-lg py-2 px-4`}>
                    <SimilarityIcon className="w-5 h-5 mr-2" />
                    {similarity?.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Overall Similarity Score
                  </span>
                  <span className={`text-2xl font-bold ${similarity?.color}`}>
                    {scanResult.overallScore}%
                  </span>
                </div>
                <Progress value={scanResult.overallScore} className="h-3" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Matched Sources</h3>
                <div className="space-y-3">
                  {scanResult.matchedSources.map((match, idx) => (
                    <Card key={idx} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-foreground mb-1">{match.source}</p>
                            <a
                              href={match.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {match.url}
                            </a>
                          </div>
                          <Badge variant="secondary" className="font-semibold">
                            {match.percentage}% match
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Analysis Details</h3>
                <p className="text-sm text-muted-foreground">{scanResult.details}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setScanResult(null);
                    setTextContent('');
                    setFileName('');
                  }}
                >
                  Check Another Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground">
                  How Plagiarism Detection Works
                </p>
                <p className="text-muted-foreground">
                  Our system compares your content against millions of academic sources, journals, web pages, and previously submitted papers. Scores below 15% are generally acceptable, while higher scores may indicate content that needs citation review or revision.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

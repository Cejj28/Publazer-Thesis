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
import { checkPlagiarism } from '@/lib/api'; // <--- Import real API

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleScan = async () => {
    if (!textContent && !selectedFile) {
      toast.error('Please provide text or upload a PDF file');
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      if (textContent) {
        formData.append('text', textContent);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // --- CALL REAL BACKEND ---
      const result = await checkPlagiarism(formData);
      setScanResult(result);
      toast.success('Plagiarism scan completed!');

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Scan failed. Please try again.";
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const getSimilarityLevel = (score: number) => {
    if (score < 15) return { label: 'Low Risk', color: 'text-green-600', badge: 'bg-green-100 text-green-800', icon: CheckCircle2 };
    if (score < 30) return { label: 'Moderate Risk', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { label: 'High Risk', color: 'text-red-600', badge: 'bg-red-100 text-red-800', icon: AlertCircle };
  };

  const similarity = scanResult ? getSimilarityLevel(scanResult.overallScore) : null;
  const SimilarityIcon = similarity?.icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Plagiarism Checker</h1>
          <p className="text-muted-foreground">
            Compare your document against the internal repository database.
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
            <Tabs defaultValue="upload" className="space-y-4" onValueChange={() => {
              setScanResult(null); 
              setSelectedFile(null); 
              setTextContent('');
              setFileName('');
            }}>
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
                          <p className="text-xs text-muted-foreground">PDF files only</p>
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
                    placeholder="Paste abstract or body text here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleScan}
              className="w-full mt-4"
              disabled={scanning || (!textContent && !selectedFile)}
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning Repository...
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

        {/* RESULTS SECTION */}
        {scanResult && (
          <Card className="border-2 animate-in fade-in zoom-in duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>Comparison against internal database</CardDescription>
                </div>
                {SimilarityIcon && (
                  <Badge variant="outline" className={`${similarity?.badge} text-lg py-2 px-4`}>
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
                <h3 className="font-semibold text-foreground mb-3">Matched Sources in Repository</h3>
                {scanResult.matchedSources.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No matches found in the system.</p>
                ) : (
                  <div className="space-y-3">
                    {scanResult.matchedSources.map((match, idx) => (
                      <Card key={idx} className="bg-muted/50 border-none">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-foreground mb-1">{match.source}</p>
                              <Badge variant="outline">{match.url}</Badge>
                            </div>
                            <div className="text-right">
                               <span className="text-sm font-bold text-foreground block">
                                 {match.percentage}% match
                               </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Details</h3>
                <p className="text-sm text-muted-foreground">{scanResult.details}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function UploadResearch() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    fileName: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFormData({ ...formData, fileName: file.name });
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fileName) {
      toast.error('Please select a PDF file');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save to localStorage
    const papers = JSON.parse(localStorage.getItem('research_papers') || '[]');
    const newPaper = {
      id: Date.now().toString(),
      ...formData,
      author: user?.name,
      authorId: user?.id,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      plagiarismScore: Math.floor(Math.random() * 30) + 5, // 5-35%
    };
    papers.push(newPaper);
    localStorage.setItem('research_papers', JSON.stringify(papers));

    setUploading(false);
    setUploadSuccess(true);
    toast.success('Research paper uploaded successfully!', {
      description: 'Plagiarism check will be performed automatically.',
    });

    // Reset form
    setTimeout(() => {
      setFormData({ title: '', abstract: '', keywords: '', fileName: '' });
      setUploadSuccess(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Research Paper</h1>
          <p className="text-muted-foreground">
            Submit your research for plagiarism detection and repository inclusion
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Research Submission Form</CardTitle>
            <CardDescription>
              Fill in the details and upload your PDF document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Research Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter the title of your research"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  placeholder="Provide a brief abstract of your research"
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="machine learning, AI, neural networks"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Separate keywords with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload PDF Document *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {formData.fileName ? (
                      <div className="flex items-center justify-center gap-2 text-success">
                        <FileText className="w-8 h-8" />
                        <span className="font-medium">{formData.fileName}</span>
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

              <Button
                type="submit"
                className="w-full"
                disabled={uploading || uploadSuccess}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : uploadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Uploaded Successfully
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Research Paper
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Submission Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only PDF files are accepted</li>
                <li>Maximum file size: 20MB</li>
                <li>Ensure all text is selectable (not scanned images)</li>
                <li>Plagiarism check will be performed automatically</li>
                <li>Faculty will review your submission after plagiarism check</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

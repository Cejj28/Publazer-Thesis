import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, FileText, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  plagiarismScore: number;
}

interface PaperDetailProps {
  paper: ResearchPaper | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaperDetail({ paper, open, onOpenChange }: PaperDetailProps) {
  if (!paper) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle2;
      case 'pending':
        return Clock;
      case 'rejected':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPlagiarismColor = (score: number) => {
    if (score < 15) return 'text-success';
    if (score < 30) return 'text-warning';
    return 'text-destructive';
  };

  const StatusIcon = getStatusIcon(paper.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{paper.title}</DialogTitle>
              <DialogDescription>Research paper details and preview</DialogDescription>
            </div>
            <Badge className={getStatusColor(paper.status)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Author</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{paper.author}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Upload Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  {new Date(paper.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">File Name</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{paper.fileName}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plagiarism Score</p>
              <span className={`font-bold text-xl ${getPlagiarismColor(paper.plagiarismScore)}`}>
                {paper.plagiarismScore}%
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-2">Abstract</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.split(',').map((keyword, idx) => (
                <Badge key={idx} variant="outline">
                  {keyword.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <FileText className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-center text-foreground mb-2">PDF Preview</h3>
            <p className="text-sm text-center text-muted-foreground mb-4">
              Preview functionality will display the uploaded PDF document here
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-xs text-muted-foreground">
                {paper.fileName} - PDF viewer placeholder
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              View Full Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

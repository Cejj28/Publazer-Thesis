import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, FileText, Download, AlertCircle } from 'lucide-react';

// 1. UPDATE INTERFACE
interface Comment {
  text: string;
  reviewerName: string;
  date: string;
}

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  uploadDate: string;
  status: string;
  plagiarismScore: number;
  // Change this from 'string' to 'Comment[]'
  comments?: Comment[]; 
}

interface PaperDetailProps {
  paper: ResearchPaper | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaperDetail({ paper, open, onOpenChange }: PaperDetailProps) {
  if (!paper) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlagiarismColor = (score: number) => {
    if (score < 15) return 'text-green-600';
    if (score < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2 leading-tight">{paper.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(paper.status)}>
                  {paper.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Author</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-primary" />
                {paper.author}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(paper.uploadDate).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Plagiarism</p>
              <div className={`flex items-center gap-2 text-sm font-bold ${getPlagiarismColor(paper.plagiarismScore)}`}>
                <AlertCircle className="w-4 h-4" />
                {paper.plagiarismScore}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">File</p>
              <div className="flex items-center gap-2 text-sm font-medium truncate" title={paper.fileName}>
                <FileText className="w-4 h-4 text-primary" />
                PDF
              </div>
            </div>
          </div>

          {/* FACULTY COMMENTS SECTION (UPDATED) */}
          {paper.comments && paper.comments.length > 0 && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> 
                Faculty Feedback
              </h3>
              
              <div className="space-y-3">
                {/* 2. UPDATE RENDERING LOGIC: Map through the array */}
                {paper.comments.map((comment, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-orange-100 shadow-sm text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-orange-800 text-xs">
                        {comment.reviewerName || "Faculty"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-foreground mb-2">Abstract</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {paper.abstract}
            </p>
          </div>

          {paper.keywords && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.split(',').map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="px-2 py-1">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* PDF Preview (Updated with Dynamic URL) */}
          <div className="bg-muted/20 rounded-lg border h-[400px] flex flex-col items-center justify-center p-4">
             {/* Note: Ensure this URL logic matches your Dashboard fix */}
            {paper.fileName ? (
              <iframe
                src={paper.fileName}
                className="w-full h-full rounded bg-white shadow-sm"
                title="PDF Preview"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 opacity-50" />
                <p>Preview not available</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild>
              <a 
                href={paper.fileName}
                target="_blank" 
                rel="noopener noreferrer"
                download
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
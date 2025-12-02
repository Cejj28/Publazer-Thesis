import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  authorId: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  plagiarismScore: number;
}

export default function MySubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);

  useEffect(() => {
    const storedPapers = JSON.parse(localStorage.getItem('research_papers') || '[]');
    const myPapers = storedPapers.filter((p: ResearchPaper) => p.authorId === user?.id);
    setPapers(myPapers);
  }, [user]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Submissions
          </h1>
          <p className="text-muted-foreground">
            Track all your uploaded research papers and their status
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{papers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {papers.filter((p) => p.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {papers.filter((p) => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Research Papers</CardTitle>
            <CardDescription>
              View status and details of all your submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {papers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No submissions yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first research paper to get started
                </p>
                <Button onClick={() => navigate('/upload')}>
                  Upload Research Paper
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => {
                  const StatusIcon = getStatusIcon(paper.status);

                  return (
                    <Card key={paper.id} className="hover:shadow-md transition-smooth">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {paper.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {paper.abstract}
                              </p>
                            </div>
                            <Badge className={getStatusColor(paper.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Upload Date</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  {new Date(paper.uploadDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Plagiarism Score</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`font-bold text-lg ${getPlagiarismColor(paper.plagiarismScore)}`}>
                                  {paper.plagiarismScore}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {paper.keywords.split(',').map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword.trim()}
                              </Badge>
                            ))}
                          </div>

                          <div className="pt-2 flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              View PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

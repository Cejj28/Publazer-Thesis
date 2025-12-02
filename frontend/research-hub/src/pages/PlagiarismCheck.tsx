import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PaperDetail } from '@/components/PaperDetail';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  uploadDate: string;
  plagiarismScore: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PlagiarismCheck() {
  const { user, hasRole } = useAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const storedPapers = JSON.parse(localStorage.getItem('research_papers') || '[]');
    
    // Filter based on role
    const filteredPapers = hasRole('student')
      ? storedPapers.filter((p: ResearchPaper) => p.author === user?.name)
      : storedPapers;
    
    setPapers(filteredPapers);
  }, [user, hasRole]);

  const getSimilarityLevel = (score: number) => {
    if (score < 15) return { label: 'Low', color: 'text-success', icon: CheckCircle2 };
    if (score < 30) return { label: 'Moderate', color: 'text-warning', icon: AlertTriangle };
    return { label: 'High', color: 'text-destructive', icon: AlertCircle };
  };

  const getProgressColor = (score: number) => {
    if (score < 15) return 'bg-success';
    if (score < 30) return 'bg-warning';
    return 'bg-destructive';
  };

  const handleViewPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Plagiarism Detection Results
          </h1>
          <p className="text-muted-foreground">
            View similarity scores and plagiarism analysis reports
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Scanned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{papers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Similarity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {papers.filter((p) => p.plagiarismScore < 15).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {papers.filter((p) => p.plagiarismScore >= 15).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plagiarism Reports</CardTitle>
            <CardDescription>
              Detailed similarity analysis for all papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {papers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No reports available
                </h3>
                <p className="text-muted-foreground">
                  Upload research papers to see plagiarism detection results
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => {
                  const similarity = getSimilarityLevel(paper.plagiarismScore);
                  const Icon = similarity.icon;

                  return (
                    <Card 
                      key={paper.id} 
                      className="hover:shadow-md transition-smooth cursor-pointer"
                      onClick={() => handleViewPaper(paper)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {paper.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{paper.author}</span>
                                <span>•</span>
                                <span>
                                  {new Date(paper.uploadDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${similarity.color} border-current`}
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {similarity.label} Risk
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Similarity Score
                              </span>
                              <span className={`font-bold ${similarity.color}`}>
                                {paper.plagiarismScore}%
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={paper.plagiarismScore}
                                className="h-3"
                              />
                              <div
                                className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(
                                  paper.plagiarismScore
                                )} transition-all`}
                                style={{ width: `${paper.plagiarismScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPaper(paper);
                              }}
                            >
                              View Full Report
                            </Button>
                            {hasRole('faculty') || hasRole('admin') ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Review Submission
                              </Button>
                            ) : null}
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

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground">
                  About Plagiarism Detection
                </p>
                <p className="text-muted-foreground">
                  Our system uses advanced algorithms to compare submissions against a
                  vast database of academic sources. Scores below 15% are generally
                  acceptable, while higher scores may require review and citation
                  verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PaperDetail 
          paper={selectedPaper}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </DashboardLayout>
  );
}

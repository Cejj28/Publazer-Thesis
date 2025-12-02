import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download, Eye, Calendar, User } from 'lucide-react';
import { PaperDetail } from '@/components/PaperDetail';

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

export default function Repository() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    // Load papers from localStorage
    const storedPapers = JSON.parse(localStorage.getItem('research_papers') || '[]');
    setPapers(storedPapers);
  }, []);

  const filteredPapers = papers.filter(
    (paper) =>
      paper.status === 'approved' &&
      (paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleViewPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Research Repository</h1>
          <p className="text-muted-foreground">
            Browse approved research papers and publications
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <CardTitle>Available Research Papers</CardTitle>
                <CardDescription>
                  {filteredPapers.length} papers found
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPapers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No papers found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'No approved research papers yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPapers.map((paper) => (
                  <Card 
                    key={paper.id} 
                    className="hover:shadow-md transition-smooth cursor-pointer"
                    onClick={() => handleViewPaper(paper)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground mb-2">
                              {paper.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {paper.abstract}
                            </p>
                          </div>
                          <Badge className={getStatusColor(paper.status)}>
                            {paper.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {paper.keywords.split(',').map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword.trim()}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{paper.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(paper.uploadDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{paper.fileName}</span>
                          </div>
                        </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPaper(paper);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

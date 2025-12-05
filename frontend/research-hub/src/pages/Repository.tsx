import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Eye, Download, Trash2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { getPapers, deletePaper } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PaperDetail } from '@/components/PaperDetail';

// 1. Import Alert Dialog Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  department: string;
  uploadDate: string;
  status: string;
  plagiarismScore: number;
}

export default function Repository() {
  const { hasRole } = useAuth();
  
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 2. Add State for Deletion Confirmation
  const [paperToDelete, setPaperToDelete] = useState<ResearchPaper | null>(null);

  const fetchPapers = async (query = '') => {
    setLoading(true);
    try {
      const data = await getPapers({ 
        status: 'approved', 
        search: query 
      });
      setPapers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load repository");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers(searchQuery);
  };

  const handleViewPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setDetailOpen(true);
  };

  // 3. New Function to Execute Delete (Called when user clicks "Continue" in popup)
  const executeDelete = async () => {
    if (!paperToDelete) return;

    try {
      await deletePaper(paperToDelete._id);
      toast.success("Paper deleted successfully");
      // Remove from UI immediately
      setPapers((prev) => prev.filter((p) => p._id !== paperToDelete._id));
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete paper");
    } finally {
      setPaperToDelete(null); // Close the popup
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Research Repository</h1>
          <p className="text-muted-foreground">
            Browse and discover approved academic research papers
          </p>
        </div>

        <Card className="bg-muted/30 border-none shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by title, keywords, or abstract..." 
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">Loading repository...</div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No approved papers found matching your search.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {papers.map((paper) => (
              <Card 
                key={paper._id} 
                className="flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group border-transparent hover:border-primary/20"
                onClick={() => handleViewPaper(paper)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {paper.title}
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs shrink-0">
                      Approved
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {paper.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(paper.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {paper.abstract}
                  </p>
                  
                  {paper.keywords && (
                    <div className="flex flex-wrap gap-1.5">
                      {paper.keywords.split(',').slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full uppercase tracking-wider">
                          {tag.trim()}
                        </span>
                      ))}
                      {paper.keywords.split(',').length > 3 && (
                        <span className="text-[10px] text-muted-foreground py-0.5 px-1">
                          +{paper.keywords.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t bg-muted/5 p-4 gap-2 flex-wrap">
                  <Button variant="default" className="flex-1" onClick={(e) => {
                    e.stopPropagation(); 
                    handleViewPaper(paper);
                  }}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </Button>
                  
                  <Button variant="outline" className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={paper.fileName} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                    >
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </a>
                  </Button>

                  {/* 4. Delete Button just opens the Popup */}
                  {hasRole('admin') && (
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop card click
                        setPaperToDelete(paper); // Open confirmation
                      }}
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <PaperDetail 
          paper={selectedPaper}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />

        {/* 5. The Confirmation Popup */}
        <AlertDialog open={!!paperToDelete} onOpenChange={(open) => !open && setPaperToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Are you sure you want to delete the paper <span className="font-semibold text-foreground">"{paperToDelete?.title}"</span>?
                <br /><br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
                Delete Paper
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  );
}
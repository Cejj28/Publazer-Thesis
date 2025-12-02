import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Calendar, User, Eye, Download } from 'lucide-react';
import { getPapers } from '@/lib/api';
import { toast } from 'sonner';

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
}

export default function Repository() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch papers
  const fetchPapers = async (query = '') => {
    setLoading(true);
    try {
      // --- CHANGE IS HERE ---
      // We now strictly ask for "approved" papers only
      const data = await getPapers({ 
        status: 'approved', // <--- FILTER ADDED
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

  // Initial load
  useEffect(() => {
    fetchPapers();
  }, []);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers(searchQuery);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Research Repository</h1>
            <p className="text-muted-foreground">
              Browse and discover approved academic research papers
            </p>
          </div>
        </div>

        {/* Search Bar */}
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
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">Loading repository...</div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No approved papers found matching your search.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {papers.map((paper) => (
              <Card key={paper._id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2 leading-tight">
                      {paper.title}
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
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

                <CardFooter className="border-t bg-muted/10 p-4 gap-2">
                  <Button variant="default" className="flex-1" asChild>
                    <a href={`http://localhost:3001/uploads/${paper.fileName}`} target="_blank" rel="noreferrer">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`http://localhost:3001/uploads/${paper.fileName}`} download>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
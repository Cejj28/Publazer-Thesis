import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPapers } from '@/lib/api'; // Import the new API function
import { toast } from 'sonner';

// Define the shape of our Paper data
interface ResearchPaper {
  _id: string; // MongoDB uses _id, not id
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  uploadDate: string;
  status: string;
  plagiarismScore: number;
}

export default function MySubmissions() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch papers when the component loads
  useEffect(() => {
    const fetchMyPapers = async () => {
      if (!user?.id) return;

      try {
        // Call the backend, filtering by the logged-in user's ID
        const data = await getPapers(user.id);
        setPapers(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPapers();
  }, [user?.id]);

  // Helper to style status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'; // Using Tailwind classes directly for reliability
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle2;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading your submissions...</div>
      </DashboardLayout>
    );
  }

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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{papers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {papers.filter(p => p.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {papers.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Papers List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Research Papers</CardTitle>
          </CardHeader>
          <CardContent>
            {papers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't uploaded any papers yet.
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => {
                  const StatusIcon = getStatusIcon(paper.status);
                  return (
                    <Card key={paper._id} className="hover:shadow-md transition-shadow border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{paper.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(paper.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {paper.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(paper.uploadDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{paper.fileName}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                             {/* Link to the PDF we made public earlier */}
                             <Button size="sm" variant="outline" asChild>
                               <a href={`http://localhost:3001/uploads/${paper.fileName}`} target="_blank" rel="noreferrer">
                                 <Eye className="w-4 h-4 mr-2" /> View PDF
                               </a>
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
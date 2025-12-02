import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Library, FileCheck, Users, AlertCircle, Eye, Check, X, FileText } from 'lucide-react';
import { getPapers, updatePaperStatus, getUsers } from '@/lib/api'; // Imported getUsers
import { toast } from 'sonner';
import { PaperDetail } from '@/components/PaperDetail';

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
  comments?: string;
}

export default function Dashboard() {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingPapers, setPendingPapers] = useState<ResearchPaper[]>([]);
  // Added 'myUploads' to stats to track student's specific count
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, myUploads: 0, totalUsers: 0 });

  // --- REVIEW DIALOG STATE ---
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    paperId: string | null;
    action: 'approved' | 'rejected' | null;
  }>({ open: false, paperId: null, action: null });
  
  const [comment, setComment] = useState('');

  // --- DETAIL MODAL STATE ---
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const allPapers: ResearchPaper[] = await getPapers({});
      
      let userCount = 0;
      if (hasRole('admin')) {
        const users = await getUsers();
        userCount = users.length;
      }

      setStats({
        total: allPapers.length,
        pending: allPapers.filter(p => p.status === 'pending').length,
        approved: allPapers.filter(p => p.status === 'approved').length,
        // Calculate specific uploads for the logged-in student
        myUploads: allPapers.filter(p => p.author === user?.name).length, 
        totalUsers: userCount
      });

      if (hasRole('faculty') || hasRole('admin')) {
        setPendingPapers(allPapers.filter(p => p.status === 'pending'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  // Open Review Dialog
  const openReviewDialog = (e: React.MouseEvent, id: string, action: 'approved' | 'rejected') => {
    e.stopPropagation();
    setReviewDialog({ open: true, paperId: id, action });
    setComment('');
  };

  // Submit Review
  const submitReview = async () => {
    if (!reviewDialog.paperId || !reviewDialog.action) return;

    try {
      await updatePaperStatus(reviewDialog.paperId, reviewDialog.action, comment);
      toast.success(`Paper ${reviewDialog.action} successfully`);
      loadDashboardData();
      setReviewDialog({ open: false, paperId: null, action: null });
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // Open Detail View
  const handleViewPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setDetailOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  const getStatCards = () => {
    if (hasRole('admin')) {
      return [
        { 
          label: 'Total Users', 
          value: stats.totalUsers, 
          icon: Users, 
          color: 'text-blue-600', 
          action: () => navigate('/users'),
          clickable: true
        },
        { 
          label: 'Papers to Review', 
          value: stats.pending, 
          icon: AlertCircle, 
          color: 'text-orange-500' 
        },
        { 
          label: 'Total Repository', 
          value: stats.approved, 
          icon: Library, 
          color: 'text-green-600',
          action: () => navigate('/repository'),
          clickable: true
        },
      ];
    }

    if (hasRole('faculty')) {
      return [
        { 
          label: 'Papers to Review', 
          value: stats.pending, 
          icon: AlertCircle, 
          color: 'text-orange-500' 
        },
        { 
          label: 'Total Repository', 
          value: stats.approved, 
          icon: Library, 
          color: 'text-blue-500',
          action: () => navigate('/repository'),
          clickable: true
        },
        { 
          label: 'Total Uploads', 
          value: stats.total, 
          icon: FileText, 
          color: 'text-gray-500' 
        },
      ];
    }

    // Student View
    return [
      { 
        label: 'My Uploads', 
        value: stats.myUploads, // Show actual count
        icon: Upload, 
        color: 'text-blue-500', 
        action: () => navigate('/my-submissions'),
        clickable: true
      },
      { 
        label: 'Total Repository', 
        value: stats.approved, 
        icon: Library, 
        color: 'text-primary',
        action: () => navigate('/repository'), // Now clickable
        clickable: true
      },
    ];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">
            {hasRole('faculty') ? "Review pending submissions." : "Explore the research repository."}
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getStatCards().map((stat, index) => (
            <Card 
              key={index} 
              className={`transition-shadow ${stat.clickable ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''}`} 
              onClick={stat.clickable ? stat.action : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                {stat.clickable && (
                  <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- STUDENT QUICK ACTIONS --- */}
        {hasRole('student') && (
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm" 
              variant="outline"
              onClick={() => navigate('/upload')}
            >
              <Upload className="w-6 h-6" />
              <span className="font-semibold">Upload Research</span>
              <span className="text-xs font-normal opacity-80">Submit new paper</span>
            </Button>

            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-sm" 
              variant="outline"
              onClick={() => navigate('/check-plagiarism')}
            >
              <FileCheck className="w-6 h-6" />
              <span className="font-semibold">Check Plagiarism</span>
              <span className="text-xs font-normal opacity-80">Scan text or file</span>
            </Button>

            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm" 
              variant="outline"
              onClick={() => navigate('/plagiarism')}
            >
              <Eye className="w-6 h-6" />
              <span className="font-semibold">Plagiarism Reports</span>
              <span className="text-xs font-normal opacity-80">View past results</span>
            </Button>
          </div>
        )}

        {/* --- FACULTY/ADMIN PENDING REVIEWS --- */}
        {(hasRole('faculty') || hasRole('admin')) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" /> Pending Reviews
            </h2>
            
            {pendingPapers.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">No papers pending review.</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingPapers.map((paper) => (
                  <Card 
                    key={paper._id} 
                    className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-yellow-400"
                    onClick={() => handleViewPaper(paper)}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">{paper.title}</h3>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted by <span className="font-medium text-foreground">{paper.author}</span> ({paper.department})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click card to view full details
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <a href={`http://localhost:3001/uploads/${paper.fileName}`} target="_blank" rel="noreferrer">
                            <Eye className="w-4 h-4 mr-2" /> View PDF
                          </a>
                        </Button>
                        <div className="h-8 w-px bg-border hidden md:block" />
                        
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" 
                          onClick={(e) => openReviewDialog(e, paper._id, 'approved')}>
                          <Check className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" 
                          onClick={(e) => openReviewDialog(e, paper._id, 'rejected')}>
                          <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW DIALOG */}
        <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && setReviewDialog({ ...reviewDialog, open: false })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approved' ? 'Approve Paper' : 'Reject Paper'}
              </DialogTitle>
              <DialogDescription>
                Add comments for the student (optional for approval, recommended for rejection).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Faculty Feedback</Label>
                <Textarea 
                  placeholder="e.g. 'Excellent work!' or 'Please fix the citation style...'" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialog({ ...reviewDialog, open: false })}>Cancel</Button>
              <Button 
                onClick={submitReview}
                className={reviewDialog.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Confirm {reviewDialog.action === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PAPER DETAIL MODAL */}
        <PaperDetail 
          paper={selectedPaper as any}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />

      </div>
    </DashboardLayout>
  );
}
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// 1. IMPORT THE ALERT DIALOG COMPONENTS
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Eye, Calendar, AlertCircle, CheckCircle2, Clock, Trash2, Pencil, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPapers, deletePaper, updatePaper } from '@/lib/api';
import { toast } from 'sonner';

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  uploadDate: string;
  status: string;
}

export default function MySubmissions() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);

  // 2. STATE FOR DELETING (To know which paper we are warning about)
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);

  const fetchMyPapers = async () => {
    if (!user?.id) return;
    try {
      const data = await getPapers({ authorId: user.id });
      setPapers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPapers();
  }, [user?.id]);

  // 3. UPDATED DELETE FUNCTION (No more 'confirm' popup here)
  const confirmDelete = async () => {
    if (!paperToDelete) return;
    
    try {
      await deletePaper(paperToDelete);
      setPapers(papers.filter(p => p._id !== paperToDelete));
      toast.success("Paper deleted successfully");
    } catch (error) {
      toast.error("Failed to delete paper");
    } finally {
      setPaperToDelete(null); // Close the dialog
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    try {
      await updatePaper(editingPaper._id, {
        title: editingPaper.title,
        abstract: editingPaper.abstract,
        keywords: editingPaper.keywords
      });
      toast.success("Paper updated successfully");
      fetchMyPapers();
      setEditingPaper(null); 
    } catch (error) {
      toast.error("Failed to update paper");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
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

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Submissions</h1>
          <p className="text-muted-foreground">Manage your research papers</p>
        </div>

        <div className="grid gap-6">
          {papers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              You haven't uploaded any papers yet.
            </div>
          ) : (
            papers.map((paper) => {
              const StatusIcon = getStatusIcon(paper.status);
              return (
                <Card key={paper._id} className="hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{paper.title}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(paper.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(paper.status)} px-3 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {paper.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Abstract</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">{paper.abstract}</p>
                    </div>
                    {paper.keywords && (
                      <div className="flex flex-wrap gap-2">
                        {paper.keywords.split(',').map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`http://localhost:3001/uploads/${paper.fileName}`} target="_blank" rel="noreferrer">
                        <Eye className="w-4 h-4 mr-2" /> View PDF
                      </a>
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingPaper(paper)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </Button>

                      {/* 4. TRIGGER THE DELETE DIALOG */}
                      <Button variant="destructive" size="sm" onClick={() => setPaperToDelete(paper._id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* EDIT MODAL */}
        <Dialog open={!!editingPaper} onOpenChange={(open) => !open && setEditingPaper(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Submission</DialogTitle>
            </DialogHeader>
            {editingPaper && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={editingPaper.title} 
                    onChange={(e) => setEditingPaper({...editingPaper, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abstract</Label>
                  <Textarea 
                    value={editingPaper.abstract} 
                    onChange={(e) => setEditingPaper({...editingPaper, abstract: e.target.value})}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input 
                    value={editingPaper.keywords} 
                    onChange={(e) => setEditingPaper({...editingPaper, keywords: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* 5. DELETE CONFIRMATION ALERT DIALOG */}
        <AlertDialog open={!!paperToDelete} onOpenChange={(open) => !open && setPaperToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your research paper 
                and remove the file from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete Paper
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  );
}
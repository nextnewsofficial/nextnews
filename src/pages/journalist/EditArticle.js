import React, {useEffect, useState} from 'react';
import {useAuth} from '../../contexts/auth.context';
import {getDraftArticles, reviewArticle, updateArticle, uploadMedia} from '../../api/articles';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';

const EditArticle = () => {
    const [draftArticles, setDraftArticles] = useState([]);
    const [selectedArticleId, setSelectedArticleId] = useState('');
    const [formData, setFormData] = useState({
        headline: '',
        summary: '',
        content: '',
        tags: [],
        sources: [],
        publishDate: new Date().getTime()
    });
    const [tagInput, setTagInput] = useState('');
    const [sourceInput, setSourceInput] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [draftsLoading, setDraftsLoading] = useState(true);
    const [sendingReview, setSendingReview] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // New state for review dialog
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedArticleForReview, setSelectedArticleForReview] = useState(null);
    const [reviewRemark, setReviewRemark] = useState('');

    // Get the currently selected article
    const selectedArticle = draftArticles.find(article => article.id === selectedArticleId) || null;

    // Fetch draft articles on component mount
    useEffect(() => {
        const fetchDraftArticles = async () => {
            if (!isAuthenticated) return;

            try {
                setDraftsLoading(true);
                const drafts = await getDraftArticles(user.username);
                setDraftArticles(drafts);

                // If there are drafts, select the first one by default
                if (drafts.length > 0) {
                    setSelectedArticleId(drafts[0].id);
                    setFormData({
                        headline: drafts[0].headline || '',
                        summary: drafts[0].summary || '',
                        content: drafts[0].content || '',
                        tags: drafts[0].tags || [],
                        sources: drafts[0].sources || [],
                        publishDate: drafts[0].publishDate || new Date().getTime()
                    });
                }
            } catch (err) {
                setError('Failed to load draft articles. Please try again.');
                console.error('Error fetching drafts:', err);
            } finally {
                setDraftsLoading(false);
            }
        };

        fetchDraftArticles();
    }, [isAuthenticated, user.token]);

    // Update form when a new article is selected
    useEffect(() => {
        if (selectedArticleId) {
            const selectedArticle = draftArticles.find(article => article.id === selectedArticleId);
            if (selectedArticle) {
                setFormData({
                    headline: selectedArticle.headline || '',
                    summary: selectedArticle.summary || '',
                    content: selectedArticle.content || '',
                    tags: selectedArticle.tags || [],
                    sources: selectedArticle.sources || [],
                    publishDate: selectedArticle.publishDate || new Date().getTime()
                });
            }
        }
    }, [selectedArticleId, draftArticles]);

    const handleArticleSelect = (e) => {
        setSelectedArticleId(e.target.value);
    };

    // Open review dialog
    const handleOpenReviewDialog = (articleId) => {
        setSelectedArticleForReview(articleId);
        setReviewDialogOpen(true);
    };

    // Close dialog without action
    const handleCloseReviewDialog = () => {
        setReviewDialogOpen(false);
        setReviewRemark('');
    };

    // Send article for review with remark
    const handleSendForReview = async () => {
        setError('');
        setSuccess('');
        const articleId = selectedArticleForReview;

        if (!isAuthenticated) {
            setError('You must be logged in to send articles for review');
            return;
        }

        try {
            setSendingReview(articleId);

            // Prepare remark text
            let remark = 'Sent for review by journalist ' + user.username;
            if (reviewRemark) {
                remark += `\nRemark: ${reviewRemark}`;
            }

            // Send article for review
            await reviewArticle(
                articleId,
                'UNDER_REVIEW',
                remark,
                localStorage.getItem('token')
            );

            setSuccess('Article sent for review successfully!');

            // Remove the article from the draft list
            const updatedDrafts = draftArticles.filter(article => article.id !== articleId);
            setDraftArticles(updatedDrafts);

            // Clear selection if no more articles
            if (updatedDrafts.length === 0) {
                setSelectedArticleId('');
            } else if (articleId === selectedArticleId) {
                // If the current article was sent, select the first one
                setSelectedArticleId(updatedDrafts[0].id);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send article for review');
            console.error('Review submission error:', err);
        } finally {
            setSendingReview(null);
            setReviewDialogOpen(false);
            setReviewRemark('');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagAdd = () => {
        if (tagInput && !formData.tags.includes(tagInput)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
            setTagInput('');
        }
    };

    const handleTagDelete = (tagToDelete) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToDelete)
        }));
    };

    const handleSourceAdd = () => {
        if (sourceInput && !formData.sources.includes(sourceInput)) {
            setFormData(prev => ({ ...prev, sources: [...prev.sources, sourceInput] }));
            setSourceInput('');
        }
    };

    const handleSourceDelete = (sourceToDelete) => {
        setFormData(prev => ({
            ...prev,
            sources: prev.sources.filter(source => source !== sourceToDelete)
        }));
    };

    const handleFileChange = (e) => {
        setMediaFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isAuthenticated) {
            setError('You must be logged in to edit an article');
            return;
        }

        if (!selectedArticleId) {
            setError('Please select an article to update');
            return;
        }

        try {
            setLoading(true);
            // Prepare update data
            const updateData = {
                headline: formData.headline,
                summary: formData.summary,
                content: formData.content,
                publishDate: formData.publishDate,
                tags: formData.tags,
                sources: formData.sources
            };

            // Update the article
            const updatedArticle = await updateArticle(selectedArticleId, updateData, localStorage.getItem('token'));

            // Upload media files if any
            if (mediaFiles.length > 0) {
                await uploadMedia(selectedArticleId, mediaFiles, 'MEDIA', localStorage.getItem('token'));
            }

            setSuccess('Article updated successfully!');

            // Update the draft articles list
            const updatedDrafts = draftArticles.map(article =>
                article.id === selectedArticleId ? updatedArticle : article
            );
            setDraftArticles(updatedDrafts);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update article');
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            width: '100vw',
            bgcolor: '#f4f6fa',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1, color: '#222', mb: 3 }}>
                    Edit Draft Articles
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                <Box sx={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                    gap: 3,
                    boxShadow: '0 2px 16px 0 rgba(60,72,100,0.07)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: '#fff',
                }}>
                    {/* Left Panel - Select Article */}
                    <Box sx={{
                        flexBasis: { xs: '100%', md: '23%' },
                        minWidth: 260,
                        maxWidth: 350,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: '1px solid #e0e4ea',
                        bgcolor: '#f8fafc',
                        p: 2,
                        height: '100%',
                        overflowY: 'auto',
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a2a2a' }}>
                            Select Draft Article
                        </Typography>
                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {draftsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : draftArticles.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography variant="body1">
                                        No draft articles found.
                                    </Typography>
                                </Box>
                            ) : (
                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        value={selectedArticleId}
                                        onChange={handleArticleSelect}
                                    >
                                        {draftArticles.map(article => (
                                            <Box
                                                key={article.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 1,
                                                    p: 1,
                                                    borderRadius: 2,
                                                    border: selectedArticleId === article.id ? '1.5px solid #1976d2' : '1px solid #e0e4ea',
                                                    backgroundColor: selectedArticleId === article.id ? '#e3f2fd' : 'transparent',
                                                    transition: 'background 0.2s, border 0.2s',
                                                    boxShadow: selectedArticleId === article.id ? '0 2px 8px 0 rgba(25,118,210,0.07)' : 'none',
                                                    '&:hover': {
                                                        backgroundColor: '#f0f4fa',
                                                        cursor: 'pointer',
                                                    },
                                                }}
                                            >
                                                <Radio
                                                    value={article.id}
                                                    checked={selectedArticleId === article.id}
                                                    size="small"
                                                />
                                                <Tooltip title={article.headline || `Article ${article.id.substring(0, 8)}`} arrow>
                                                    <Typography
                                                        sx={{
                                                            flexGrow: 1,
                                                            wordBreak: 'break-word',
                                                            pr: 1,
                                                            fontWeight: 500,
                                                            color: '#333',
                                                        }}
                                                    >
                                                        {article.headline || `Article ${article.id.substring(0, 8)}`}
                                                    </Typography>
                                                </Tooltip>
                                                <Tooltip title="Send for review">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenReviewDialog(article.id)}
                                                        disabled={sendingReview === article.id}
                                                        size="small"
                                                    >
                                                        {sendingReview === article.id ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <SendIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            )}
                        </Box>
                    </Box>

                    {/* Middle Panel - Article Editor */}
                    <Box sx={{
                        flexBasis: { xs: '100%', md: '40%' },
                        minWidth: 350,
                        maxWidth: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 3,
                        height: '100%',
                        overflowY: 'auto',
                        bgcolor: '#fff',
                        borderRight: '1px solid #e0e4ea',
                    }}>
                        {selectedArticleId ? (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', fontWeight: 600, color: '#2a2a2a' }}>
                                    Edit Article: {formData.headline || 'Untitled'}
                                </Typography>
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit}
                                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                                >
                                    <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Headline"
                                            name="headline"
                                            value={formData.headline}
                                            onChange={handleChange}
                                            size="small"
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Summary"
                                            name="summary"
                                            value={formData.summary}
                                            onChange={handleChange}
                                            multiline
                                            minRows={3}
                                            size="small"
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Content"
                                            name="content"
                                            value={formData.content}
                                            onChange={handleChange}
                                            multiline
                                            minRows={10}
                                            size="small"
                                        />
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Tags</Typography>
                                            <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {formData.tags.map(tag => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        onDelete={() => handleTagDelete(tag)}
                                                        size="small"
                                                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                                                    />
                                                ))}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Add Tag"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    size="small"
                                                />
                                                <Button variant="outlined" onClick={handleTagAdd} size="small">
                                                    Add
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Sources</Typography>
                                            <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {formData.sources.map(source => (
                                                    <Chip
                                                        key={source}
                                                        label={source}
                                                        onDelete={() => handleSourceDelete(source)}
                                                        size="small"
                                                        sx={{ bgcolor: '#fce4ec', color: '#d81b60', fontWeight: 500 }}
                                                    />
                                                ))}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Add Source"
                                                    value={sourceInput}
                                                    onChange={(e) => setSourceInput(e.target.value)}
                                                    size="small"
                                                />
                                                <Button variant="outlined" onClick={handleSourceAdd} size="small">
                                                    Add
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Add More Media Files</Typography>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                accept="image/*,video/*"
                                                style={{ marginTop: 8 }}
                                            />
                                        </Box>
                                    </Box>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ mt: 3, mb: 2, fontWeight: 600, fontSize: 16, letterSpacing: 1 }}
                                        size="medium"
                                    >
                                        {loading ? 'Updating Article...' : 'Update Article'}
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#888',
                            }}>
                                <Typography variant="body1">
                                    {draftArticles.length === 0
                                        ? 'No draft articles available. Create one first.'
                                        : 'Please select an article from the list to edit.'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Right Panel - Article Remarks */}
                    <Box sx={{
                        flexBasis: { xs: '100%', md: '37%' },
                        minWidth: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        height: '100%',
                        overflowY: 'auto',
                        bgcolor: '#f8fafc',
                    }}>
                        {selectedArticleId ? (
                            <>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 600, color: '#2a2a2a' }}>
                                    <HistoryIcon sx={{ mr: 1 }} /> Article Remarks
                                </Typography>
                                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                    {selectedArticle?.remarks?.length > 0 ? (
                                        <List>
                                            {[...selectedArticle.remarks]
                                                .sort((a, b) => b.timestamp - a.timestamp)
                                                .map((remark, index) => (
                                                    <ListItem
                                                        key={index}
                                                        sx={{
                                                            alignItems: 'flex-start',
                                                            mb: 1,
                                                            bgcolor: index % 2 === 0 ? '#f4f6fa' : '#fff',
                                                            borderRadius: 2,
                                                            wordBreak: 'break-word',
                                                            boxShadow: '0 1px 4px 0 rgba(60,72,100,0.04)',
                                                            border: '1px solid #e0e4ea',
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                                        {remark.from} → {remark.to}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{
                                                                        whiteSpace: 'pre-wrap',
                                                                        wordBreak: 'break-word',
                                                                        mt: 0.5,
                                                                        color: '#333',
                                                                    }}>
                                                                        {remark.remark}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography variant="caption" component="div" sx={{ color: '#888' }}>
                                                                        By: {remark.userId}
                                                                    </Typography>
                                                                    <Typography variant="caption" component="div" sx={{ color: '#888' }}>
                                                                        At: {new Date(remark.timestamp).toLocaleString()}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                        </List>
                                    ) : (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            color: '#888',
                                        }}>
                                            <Typography variant="body1">
                                                No remarks available for this article
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#888',
                            }}>
                                <Typography variant="body1">
                                    Select an article to view remarks
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Review Confirmation Dialog */}
                <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog}>
                    <DialogTitle>Send for Review</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to send this article for review?
                            You can add an optional remark below:
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Add Remark (Optional)"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={reviewRemark}
                            onChange={(e) => setReviewRemark(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCloseReviewDialog}
                            color="secondary"
                            variant="outlined"
                        >
                            Not Now
                        </Button>
                        <Button
                            onClick={handleSendForReview}
                            color="primary"
                            variant="contained"
                            startIcon={<SendIcon />}
                            disabled={sendingReview}
                        >
                            {sendingReview ? 'Sending...' : 'Send For Review'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default EditArticle;
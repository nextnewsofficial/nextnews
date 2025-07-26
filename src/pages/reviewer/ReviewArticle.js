import React, {useEffect, useState} from 'react';
import {useAuth} from '../../contexts/auth.context';
import {getUnderReviewArticles, reviewArticle} from '../../api/articles';
import {
    Alert,
    Box,
    Button, CardMedia,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const ReviewArticle = () => {
    const [underReviewArticles, setUnderReviewArticles] = useState([]);
    const [selectedArticleId, setSelectedArticleId] = useState('');
    const [formData, setFormData] = useState({
        headline: '',
        summary: '',
        content: '',
        tags: [],
        media: [],
        sources: [],
        publishDate: new Date().getTime(),
        status: ''
    });
    const [remark, setRemark] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const {user, isAuthenticated} = useAuth();

    // Fetch under review articles on component mount
    useEffect(() => {
        const fetchUnderReviewArticles = async () => {
            if (!isAuthenticated) return;

            try {
                setArticlesLoading(true);
                const articles = await getUnderReviewArticles(user.username);
                setUnderReviewArticles(articles);

                // If there are articles, select the first one by default
                if (articles.length > 0) {
                    setSelectedArticleId(articles[0].id);
                    setFormData({
                        headline: articles[0].headline || '',
                        summary: articles[0].summary || '',
                        content: articles[0].content || '',
                        tags: articles[0].tags || [],
                        sources: articles[0].sources || [],
                        publishDate: articles[0].publishDate || new Date().getTime(),
                        status: articles[0].status || 'UNDER_REVIEW'
                    });
                }
            } catch (err) {
                setError('Failed to load articles under review. Please try again.');
                console.error('Error fetching articles:', err);
            } finally {
                setArticlesLoading(false);
            }
        };

        fetchUnderReviewArticles();
    }, [isAuthenticated, user]);

    // Update form when a new article is selected
    useEffect(() => {
        if (selectedArticleId) {
            const selectedArticle = underReviewArticles.find(article => article.id === selectedArticleId);
            if (selectedArticle) {
                setFormData({
                    headline: selectedArticle.headline || '',
                    summary: selectedArticle.summary || '',
                    media: selectedArticle.media || '',
                    content: selectedArticle.content || '',
                    tags: selectedArticle.tags || [],
                    sources: selectedArticle.sources || [],
                    publishDate: selectedArticle.publishDate || new Date().getTime(),
                    status: selectedArticle.status || 'UNDER_REVIEW'
                });
            }
        }
    }, [selectedArticleId, underReviewArticles]);

    const handleArticleSelect = (e) => {
        setSelectedArticleId(e.target.value);
    };

    const handleApprove = async () => {
        setError('');
        setSuccess('');

        if (!isAuthenticated) {
            setError('You must be logged in to review articles');
            return;
        }

        if (!selectedArticleId) {
            setError('Please select an article to review');
            return;
        }

        try {
            setLoading(true);

            // Approve the article (publish it)
            const approvedArticle = await reviewArticle(
                selectedArticleId,
                'PUBLISHED',
                remark || 'Approved by reviewer',
                localStorage.getItem('token')
            );

            setSuccess('Article approved and published successfully!');

            // Update the articles list
            const updatedArticles = underReviewArticles.filter(
                article => article.id !== selectedArticleId
            );
            setUnderReviewArticles(updatedArticles);

            // Clear selection if no more articles
            if (updatedArticles.length === 0) {
                setSelectedArticleId('');
            } else {
                // Select the next article in the list
                setSelectedArticleId(updatedArticles[0].id);
            }

            // Clear remark
            setRemark('');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve article');
            console.error('Approval error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setError('');
        setSuccess('');

        if (!isAuthenticated) {
            setError('You must be logged in to review articles');
            return;
        }

        if (!selectedArticleId) {
            setError('Please select an article to review');
            return;
        }

        try {
            setLoading(true);

            // Approve the article (publish it)
            const rejectedArticle = await reviewArticle(
                selectedArticleId,
                'DRAFT',
                remark || 'Rejected by reviewer',
                localStorage.getItem('token')
            );

            setSuccess('Article approved and published successfully!');

            // Update the articles list
            const updatedArticles = underReviewArticles.filter(
                article => article.id !== selectedArticleId
            );
            setUnderReviewArticles(updatedArticles);

            // Clear selection if no more articles
            if (updatedArticles.length === 0) {
                setSelectedArticleId('');
            } else {
                // Select the next article in the list
                setSelectedArticleId(updatedArticles[0].id);
            }

            // Clear remark
            setRemark('');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve article');
            console.error('Approval error:', err);
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
                    Review Articles
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
                            Select Article
                        </Typography>
                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {articlesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : underReviewArticles.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography variant="body1">
                                        No articles under review.
                                    </Typography>
                                </Box>
                            ) : (
                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        value={selectedArticleId}
                                        onChange={handleArticleSelect}
                                    >
                                        {underReviewArticles.map(article => (
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
                                            </Box>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            )}
                        </Box>
                    </Box>
                    {/* Middle Panel - Article Details and Review */}
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
                                <Typography variant="h5" gutterBottom sx={{ wordBreak: 'break-word', fontWeight: 600, color: '#2a2a2a' }}>
                                    Review Article: {formData.headline || 'Untitled'}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                                    Status: <Chip
                                        label={formData.status}
                                        color={formData.status === 'PUBLISHED' ? 'success' : 'warning'}
                                    />
                                </Typography>
                                {formData.media && formData.media.length > 0 ? (
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={formData.media[0]}
                                        alt={formData.headline}
                                        sx={{ borderRadius: 2, mb: 2, objectFit: 'cover' }}
                                    />
                                ) : null}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6">Summary</Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        {formData.summary}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6">Content</Typography>
                                    <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                                        {formData.content}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6">Tags</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                        {formData.tags.map(tag => (
                                            <Chip key={tag} label={tag} />
                                        ))}
                                    </Stack>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6">Sources</Typography>
                                    <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
                                        {formData.sources.map(source => (
                                            <Typography key={source} variant="body2" component="a" href={source} target="_blank" rel="noopener" sx={{ display: 'block' }}>
                                                {source}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                                <Box sx={{ mt: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Reviewer Remarks (optional)"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    onClick={handleApprove}
                                    disabled={loading}
                                    sx={{ mt: 3, mr: 2 }}
                                >
                                    {loading ? 'Approving...' : 'Approve & Publish'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    onClick={handleReject}
                                    disabled={loading}
                                    sx={{ mt: 3 }}
                                >
                                    {loading ? 'Rejecting...' : 'Back To Draft'}
                                </Button>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: '#888' }}>
                                <Typography variant="body1">
                                    {underReviewArticles.length === 0
                                        ? 'No articles under review. All caught up!'
                                        : 'Please select an article from the list to review.'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    {/* Right Panel - Review History/Remarks */}
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
                                    {underReviewArticles.find(a => a.id === selectedArticleId)?.remarks?.length > 0 ? (
                                        <List>
                                            {[...underReviewArticles.find(a => a.id === selectedArticleId).remarks]
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
                                                            border: '1px solid #e0e4ea',
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                                        {remark.from} → {remark.to}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5, color: '#333' }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                                            <Typography variant="body1">
                                                No remarks available for this article
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: '#888' }}>
                                <Typography variant="body1">
                                    Select an article to view remarks
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default ReviewArticle;
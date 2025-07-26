// src/pages/TagArticlesPage.js
import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
    Box, Container, Typography, Card, CardContent, CardMedia, Grid,
    Chip, Button, CircularProgress, Alert, Dialog, DialogContent,
    DialogTitle, IconButton, Divider, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {API_BASE_URL} from '../config/constants';

// Theme configurations for each tag
const tagThemes = {
    science: {
        backgroundImage: 'linear-gradient(135deg, #1a2980, #26d0ce)',
        icon: '🔬',
        color: '#4fc3f7',
        accentColor: '#29b6f6',
        wallpaper: 'url("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80")',
        quote: "Science is the poetry of reality."
    },
    politics: {
        backgroundImage: 'linear-gradient(135deg, #d31027, #ea384d)',
        icon: '🏛️',
        color: '#ef5350',
        accentColor: '#f44336',
        wallpaper: 'url("https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=1200&q=80")',
        quote: "Politics is the art of the possible."
    },
    technology: {
        backgroundImage: 'linear-gradient(135deg, #4776E6, #8E54E9)',
        icon: '💻',
        color: '#7e57c2',
        accentColor: '#5e35b1',
        wallpaper: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80")',
        quote: "Any sufficiently advanced technology is indistinguishable from magic."
    },
    entertainment: {
        backgroundImage: 'linear-gradient(135deg, #FF512F, #F09819)',
        icon: '🎬',
        color: '#ff9800',
        accentColor: '#f57c00',
        wallpaper: 'url("https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80")',
        quote: "Entertainment is the most important part of life."
    },
    geopolitics: {
        backgroundImage: 'linear-gradient(135deg, #134E5E, #71B280)',
        icon: '🌍',
        color: '#66bb6a',
        accentColor: '#43a047',
        wallpaper: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80")',
        quote: "Geography is destiny."
    },
    health: {
        backgroundImage: 'linear-gradient(135deg, #56ab2f, #a8e063)',
        icon: '❤️',
        color: '#66bb6a',
        accentColor: '#43a047',
        wallpaper: 'url("https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80")',
        quote: "Health is the greatest gift."
    },
    default: {
        backgroundImage: 'linear-gradient(135deg, #6a11cb, #2575fc)',
        icon: '📰',
        color: '#9c27b0',
        accentColor: '#7b1fa2',
        wallpaper: 'url("https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80")',
        quote: "Knowledge is power."
    }
};

const TagArticlesPage = () => {
    const {tag} = useParams();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [fullArticle, setFullArticle] = useState(null);
    const [articleLoading, setArticleLoading] = useState(false);

    // Get the theme for the current tag
    const theme = tagThemes[tag] || tagThemes.default;

    // Format tag name for display
    const formattedTag = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : 'News';

    // Fetch articles for the current tag
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                    params: {
                        published: true,
                        tags: tag,
                        sortBy: 'publishDate',
                        sortOrder: 'DESC'
                    }
                });

                setArticles(response.data.content || []);
            } catch (err) {
                setError('Failed to load articles. Please try again later.');
                console.error('Error fetching articles:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [tag]);

    // Fetch full article content
    const fetchFullArticle = async (articleId) => {
        setArticleLoading(true);
        setFullArticle(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                params: {
                    id: articleId,
                    published: true,
                    sortBy: 'publishDate',
                    sortOrder: 'DESC'
                }
            });

            if (response.data.content && response.data.content.length > 0) {
                setFullArticle(response.data.content[0]);
            } else {
                setError('Article content not found');
            }
        } catch (err) {
            setError('Failed to load article content. Please try again.');
            console.error('Error fetching article:', err);
        } finally {
            setArticleLoading(false);
        }
    };

    const handleReadMore = (articleId) => {
        setOpenDialog(true);
        fetchFullArticle(articleId);
    };

    const handleTagClick = (tag) => {
        navigate(`/tag/${tag}`);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFullArticle(null);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.wallpaper,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 0
            }
        }}>
            <Container maxWidth="lg" sx={{position: 'relative', zIndex: 1, py: 4}}>
                {/* Tag Header */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                    background: theme.backgroundImage,
                    boxShadow: 3,
                    color: 'white'
                }}>
                    <Typography variant="h2" component="h1" sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}>
                        <span style={{fontSize: '2.5rem'}}>{theme.icon}</span>
                        {formattedTag} News
                    </Typography>
                    <Typography variant="h6" sx={{fontStyle: 'italic', opacity: 0.9}}>
                        "{theme.quote}"
                    </Typography>
                </Box>

                {/* Popular Tags */}
                <Box sx={{mb: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1}}>
                    {Object.keys(tagThemes).filter(t => t !== 'default').map(tagName => (
                        <Chip
                            key={tagName}
                            label={tagName.charAt(0).toUpperCase() + tagName.slice(1)}
                            onClick={() => handleTagClick(tagName)}
                            sx={{
                                background: tagName === tag ? theme.accentColor : 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 'bold',
                                px: 2,
                                py: 1,
                                fontSize: '1rem',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    background: tagThemes[tagName].accentColor
                                }
                            }}
                        />
                    ))}
                </Box>

                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
                        <CircularProgress size={60} sx={{color: 'white'}}/>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{mb: 3}}>{error}</Alert>
                ) : articles.length === 0 ? (
                    <Paper sx={{p: 4, textAlign: 'center', background: 'rgba(255, 255, 255, 0.9)'}}>
                        <Typography variant="h5" sx={{mb: 2}}>
                            No articles found in {formattedTag} category
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{background: theme.accentColor, color: 'white'}}
                        >
                            Browse All News
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={4}>
                        {articles.map((article, index) => (
                            <Grid item xs={12} md={index === 0 ? 12 : 6} lg={index === 0 ? 12 : 4} key={article.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: 6,
                                            cursor: 'pointer'
                                        }
                                    }}
                                    onClick={() => handleReadMore(article.id)}
                                >
                                    {article.media && article.media.length > 0 ? (
                                        <CardMedia
                                            component="img"
                                            height={index === 0 ? 400 : 200}
                                            image={article.media[0]}
                                            alt={article.headline}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: index === 0 ? 400 : 200,
                                            background: theme.backgroundImage,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '4rem',
                                            color: 'white'
                                        }}>
                                            {theme.icon}
                                        </Box>
                                    )}
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Typography gutterBottom variant={index === 0 ? "h4" : "h5"} component="h2">
                                            {article.headline}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{mb: 2}}>
                                            {article.summary}
                                        </Typography>
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto'}}>
                                            {article.tags && article.tags.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTagClick(tag);
                                                    }}
                                                    sx={{
                                                        background: tagThemes[tag]?.accentColor || theme.accentColor,
                                                        color: 'white'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                    <Box sx={{
                                        p: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(article.publishDate).toLocaleDateString()}
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Button
                                                size="small"
                                                sx={{color: theme.accentColor, fontWeight: 'bold'}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReadMore(article.id);
                                                }}
                                            >
                                                Read More
                                            </Button>
                                            <Button
                                                size="small"
                                                sx={{color: theme.accentColor, fontWeight: 'bold'}}
                                                href={`/article/${article.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                In Details
                                            </Button>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Back to Home */}
                <Box sx={{mt: 4, textAlign: 'center'}}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderColor: theme.accentColor,
                                color: theme.accentColor
                            }
                        }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Container>

            {/* Article Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{sx: {borderRadius: 2}}}
            >
                <DialogTitle sx={{
                    bgcolor: theme.accentColor,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{fontWeight: 'bold'}}>
                        {fullArticle?.headline}
                    </Typography>
                    <IconButton onClick={handleCloseDialog} sx={{color: 'white'}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {articleLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                            <CircularProgress sx={{color: theme.accentColor}}/>
                        </Box>
                    ) : fullArticle ? (
                        <>
                            {fullArticle.media && fullArticle.media.length > 0 && (
                                <Box sx={{mb: 3, textAlign: 'center'}}>
                                    <img
                                        src={fullArticle.media[0]}
                                        alt={fullArticle.headline}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '400px',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Box>
                            )}

                            <Typography variant="subtitle1" sx={{
                                mb: 3,
                                fontStyle: 'italic',
                                color: '#666'
                            }}>
                                Published on: {new Date(fullArticle.publishDate).toLocaleDateString()}
                            </Typography>

                            <Box sx={{mb: 3}}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1}}>
                                    Summary
                                </Typography>
                                <Typography variant="body1" sx={{mb: 2}}>
                                    {fullArticle.summary}
                                </Typography>
                            </Box>

                            <Divider sx={{my: 3}}/>

                            <Box>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2}}>
                                    Full Content
                                </Typography>
                                <Typography variant="body1" sx={{whiteSpace: 'pre-line'}}>
                                    {fullArticle.content}
                                </Typography>
                            </Box>

                            {fullArticle.tags && fullArticle.tags.length > 0 && (
                                <Box sx={{mt: 4}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1}}>
                                        Tags:
                                    </Typography>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                        {fullArticle.tags.map(tag => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                onClick={() => handleTagClick(tag)}
                                                sx={{
                                                    bgcolor: tagThemes[tag]?.accentColor || theme.accentColor,
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            <Box sx={{mt: 4, textAlign: 'center'}}>
                                <Button
                                    variant="contained"
                                    href={`/article/${fullArticle.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{bgcolor: theme.accentColor, color: 'white'}}
                                >
                                    View In Details Page
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Typography variant="body1" sx={{py: 4, textAlign: 'center'}}>
                            Article content could not be loaded.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TagArticlesPage;